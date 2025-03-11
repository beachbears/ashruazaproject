import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Button } from 'react-native';
import { usePostContext, type Post } from './../contexts/PostContext';
import PostModal from './postmodal';
import { AuthContext, AuthContextType } from './../contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { APP_NAME } from "../constants";

const dropdownOptions = ['Popularity', 'Time'];

interface DropdownProps {
  options: string[];
  onSelect?: (option: string) => void;
  defaultValue?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect, defaultValue = 'Select Option' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>(defaultValue);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  return (
    <View style={styles.dropdowncontainer}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownButton}>
        <Text style={styles.buttonText}>{selectedOption}</Text>
        <Entypo name="chevron-down" size={20} color="#44457D" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => selectOption(option)}
              style={styles.option}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Define a type for vote values.
type VoteType = 'upvote' | 'downvote';

export default function PostSuggestions() {
  const { posts, addPost, updatePost } = usePostContext();
  const [selectedOption, setSelectedOption] = useState<string>('Time');
  const { authToken } = React.useContext(AuthContext) as AuthContextType;
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Explicitly type selectedVotes with keys as numbers and values as VoteType.
  const [selectedVotes, setSelectedVotes] = useState<{ [key: number]: VoteType }>({});

  const router = useRouter();

  const params = useLocalSearchParams();
  const location = decodeURIComponent(params.location as string);
  const destination = decodeURIComponent(params.destination as string);
  const origin_lat = Number(params.origin_lat);
  const origin_lon = Number(params.origin_lon);
  const destination_lat = Number(params.destination_lat);
  const destination_lon = Number(params.destination_lon);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  console.log("All Posts:", posts);
  const handlePostSubmit = async (formData: Post) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const requestBody = {
        route_post: {
          ...formData,
          location,
          destination,
          origin_lat,
          origin_lon,
          dest_lat: destination_lat,
          dest_lon: destination_lon,
        },
      };

      const response = await fetch('https://comgu20-production.up.railway.app/api/route_posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error Response:", errorData);
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();
      if (!newPost.location) newPost.location = location;
      if (!newPost.destination) newPost.destination = destination;

      addPost(newPost, 'postsuggestions');
      setModalVisible(false);
    } catch (error) {
      console.error('Post submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }; 
  
  const sendVoteRequest = async (postId: string, action: VoteType) => {
    const endpoint = `https://comgu20-production.up.railway.app/api/route_posts/${postId}/${action}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send vote:', response.status, errorText);
        Alert.alert('Error', 'There was a problem registering your vote.');
        return false;
      }

      const updatedData = await response.json();
      console.log('Updated post data from API:', updatedData);

      // Find existing post before updating
      const existingPost = posts.find(post => post.id?.toString() === postId);
      if (!existingPost) {
        console.error('Post not found:', postId);
        return false;
      }

      // Merge old post data with the updated data
      updatePost({ ...existingPost, ...updatedData, id: existingPost.id });

      Alert.alert('Success', 'Your vote has been registered.');
      return true;
    } catch (error) {
      console.error('Vote error:', error);
      Alert.alert('Error', 'There was a problem sending your vote.');
      return false;
    }
  };

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      switch (selectedOption) {
        case 'Time':
          // Sort using created_at timestamp
          return (new Date(b.created_at ?? 0).getTime() || 0) - (new Date(a.created_at ?? 0).getTime() || 0);
        case 'Popularity':
          return (b.votes ?? 0) - (a.votes ?? 0);
        default:
          return 0;
      }
    });
  }, [posts, selectedOption]);

  const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return 'Just now';
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    return `${Math.floor(diff / day)}d ago`;
  };

  const handleVote = async (id: number, action: VoteType) => {
    // If the same vote is pressed, call the API to unvote but keep the highlight.
    if (selectedVotes[id] === action) {
      const success = await sendVoteRequest(id.toString(), action);
      if (success) {
        // Keep the vote state as-is to preserve background color.
      }
    } else {
      // Normal vote (or vote change) scenario.
      const success = await sendVoteRequest(id.toString(), action);
      if (success) {
        setSelectedVotes(prev => ({ ...prev, [id]: action }));
      }
    }
  };

  return (
    <ScrollView style={styles.maincontainer}>
      <Text style={styles.sectionTitle}>Discover Experiences</Text>
      <View style={styles.sectionHeader}>
      <View style={styles.detailsContainer}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={styles.label}>From:</Text>
                <Text style={styles.locationText}>{location}</Text>
              </View>
              <View style={{ flexDirection: 'column' }}>
                <Text style={styles.label}>To: </Text>
                <Text style={styles.locationText}>{destination}</Text>
              </View>
            </View>
      </View>

<View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 10, alignItems: 'center'}}>
      <View style={{ zIndex: 1000 }}>
        <Dropdown options={dropdownOptions} onSelect={handleOptionSelect} defaultValue="Time" />
      </View>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.postbutton}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 200 }}>
        {sortedPosts.map((post) => (
          <View key={post.id} style={styles.containerpost}>
            <View style={styles.suggestordetails}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <View style={styles.profile}>
                  <Text style={styles.initial}>
                    {post.user?.firstname && post.user?.lastname
                      ? post.user.firstname[0].toUpperCase() + post.user.lastname[0].toUpperCase()
                      : "G"}
                  </Text>
                </View>
                <View style={styles.suggestor}>
                  <Text style={styles.suggestorname}>
                    {post.user?.firstname && post.user?.lastname
                      ? `${post.user.firstname} ${post.user.lastname}`
                      : "Guest"}
                  </Text>
                  <Text style={styles.suggestorusername}>{post.user?.email}</Text>
                </View>
              </View>
              <Text style={styles.postTimestamp}>
                {post.created_at ? timeAgo(new Date(post.created_at).getTime()) : 'Unknown time'}
              </Text>
            </View>

           

            <View style={{ flexDirection: 'column', gap: 8 }}>
              <Text style={styles.label}>Your experiences</Text>
              <Text style={styles.experience}>{post.content}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={styles.content}>
                <View style={styles.badge}>
                  <Entypo name="check" size={16} color="#03C04A" />
                  <Text style={styles.cert}>Certified {APP_NAME}</Text>
                </View>
              </View>

              <View style={styles.arrowcontainer}>
                {/* Upvote Button */}
                <TouchableOpacity
                  style={[
                    styles.arrowup,
                    post.id && selectedVotes[post.id] === 'upvote' ? { backgroundColor: '#22C55E' } : undefined
                  ]}
                  onPress={() => post.id && handleVote(post.id, 'upvote')}
                >
                  <AntDesign
                    name="arrowup"
                    size={13}
                    color={post.id && selectedVotes[post.id] === 'upvote' ? '#fff' : '#22C55E'}
                  />
                </TouchableOpacity>

                {/* Vote Count */}
                <Text style={styles.arrowupnum}>{post.votes}</Text>

                {/* Downvote Button */}
                <TouchableOpacity
                  style={[
                    styles.arrowdown,
                    post.id && selectedVotes[post.id] === 'downvote' ? { backgroundColor: '#C52222' } : undefined
                  ]}
                  onPress={() => post.id && handleVote(post.id, 'downvote')}
                >
                  <AntDesign
                    name="arrowdown"
                    size={13}
                    color={post.id && selectedVotes[post.id] === 'downvote' ? '#fff' : '#C52222'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      <PostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handlePostSubmit}
        location={location}
        destination={destination}
        origin_lat={origin_lat}
        origin_lon={origin_lon}
        destination_lat={destination_lat}
        destination_lon={destination_lon}
        authToken={authToken}
        userEmail={''}
        userPassword={''}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: 'column',
    backgroundColor: '#F9FAFB',
    width: '100%',
    padding: 15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: {
    color: '#44457D',
    fontWeight: '500',
    fontSize: 16,
  },
  postbutton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontSize: 12,
  },
  detailsContainer: {
    marginBottom: 10,
    flexDirection: 'column',
    paddingHorizontal: 10,
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#44457D',
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
    
  },
  routecontainer: {
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'column',
    width: '100%',
  },
  position: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fare: {
    fontSize: 12,
    fontWeight: '400',
    color: '#44457D',
  },
  estimatedTime: {
    fontSize: 10,
    color: '#44457D',
    textAlign: 'center',
  },
  conlabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#44457D',
  },
  vehiclesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 4,
    marginTop: 10,
  },
  vehicleItem: {
    alignItems: 'center',
    marginTop: 4,
  },
  vehicleText: {
    fontSize: 11,
    color: '#44457D',
    marginVertical: 4,
  },
  getOnOff: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 12,
    color: '#44457D',
    marginBottom: 6,
  },
  experience: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  status: {
    fontSize: 11,
    color: '#404163',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: '700',
  },
  badge: {
    borderWidth: 1,
    borderColor: '#ABEBA2',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    backgroundColor: '#ecfdf5',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  dropdowncontainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginBottom: 10,
  },
  dropdownButton: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    width: 125,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
  },
  buttonText: {
    color: '#44457D',
    fontSize: 12,
    fontWeight: '400',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E5E7EB',
    zIndex: 1000,
    width: 125,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 4,
    top: 40,
  },
  option: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 4,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
    color: '#44457D',
  },
  profile: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  username: {
    fontSize: 12,
    color: '#6B7280',
  },
  suggestion: {
    fontSize: 12,
    color: '#6B7280',
    flexWrap: 'wrap',
    marginLeft: 50,
  },
  suggestorsdestination: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
    marginTop: 10,
    marginBottom: 6,
  },
  cert: {
    color: '#22c55e',
    fontWeight: '500',
    fontSize: 11,
  },
  arrowup: {
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowdown: {
    borderWidth: 1,
    borderColor: '#f47357',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowupnum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
  },
  arrowdownnum: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  sectionTitle: {
    color: '#44457D',
    fontWeight: '500',
    fontSize: 16,
  },
  dest: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
  },
  usersuggestion: {
    fontSize: 12,
    marginVertical: 4,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
  },
  suggestordetails: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    gap: 2,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  containerpost: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#C7D2FE',
    padding: 12,
    elevation: 4,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
  },
  suggestor: {
    flexDirection: 'column',
  },
  initial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  suggestorname: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  suggestorusername: {
    fontSize: 11,
    color: '#6B7280',
  },
  suggestordestination: {
    fontSize: 11,
    color: '#6B7280',
    flexWrap: 'wrap',
    marginLeft: 0,
  },
  postTimestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
});
