import React, { useState, useEffect, useContext, useMemo} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,   ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostModal from '../postmodal';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { usePostContext, type Post } from '../../contexts/PostContext';
import { useRouteContext } from '../../contexts/RouteContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { APP_NAME } from "../../constants";

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

type VoteType = 'upvote' | 'downvote';
export default function CommunityPage() {
  const { posts: contextPosts, addPost } = usePostContext();
  const { routeDetails } = useRouteContext();
  const { authToken } = React.useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const params = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
    const [selectedVotes, setSelectedVotes] = useState<{ [key: number]: VoteType }>({});
      const authContext = useContext(AuthContext) as AuthContextType | null;
      
        if (!authContext) return null; // Prevents errors if context is null
    const { isLoggedIn, userName, userHandle, userInitials, } = authContext;
    const [selectedOption, setSelectedOption] = useState<string>('Time');
  
    
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };
  
  // Use routeDetails if available; otherwise, try URL params or fall back to default names.
  const location =
    routeDetails?.location ||
    (params.location ? decodeURIComponent(params.location as string) : 'Unknown Origin');
  const destination =
    routeDetails?.destination ||
    (params.destination ? decodeURIComponent(params.destination as string) : 'Unknown Destination');
  const origin_lat = routeDetails?.origin_lat ?? (params.origin_lat ? Number(params.origin_lat) : 0);
  const origin_lon = routeDetails?.origin_lon ?? (params.origin_lon ? Number(params.origin_lon) : 0);
  const destination_lat =
    routeDetails?.destination_lat ?? (params.destination_lat ? Number(params.destination_lat) : 0);
  const destination_lon =
    routeDetails?.destination_lon ?? (params.destination_lon ? Number(params.destination_lon) : 0);

  // Fetch old posts from the API when the component mounts.
  async function fetchOldPosts() {
    try {
      const response = await fetch('https://comgu20-production.up.railway.app/api/route_posts');
      if (!response.ok) {
        console.error('Error fetching posts:', response.status);
        return;
      }
      const data = await response.json();
      // Reverse the array so that addPost (which prepends) maintains the API’s descending order
      data.reverse().forEach((post: any) => {
        // Transform API fields to match your Post type
        const transformedPost: Post = {
          ...post,
          destination_lat: post.dest_lat,
          destination_lon: post.dest_lon,
          // If API response is missing these fields, fallback to our current values
          location: post.location || location,
          destination: post.destination || destination,
        };
        addPost(transformedPost, 'postsuggestions');
      });
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  useEffect(() => {
    fetchOldPosts();
  }, []);

  useEffect(() => {
    fetchOldPosts();
  }, [location, destination]);

  // Handle post submission
  const handlePostSubmit = (formData: { content: string }) => {
    const newPost = {
      ...formData,
      location,
      destination,
      origin_lat,
      origin_lon,
      destination_lat,
      destination_lon,
    };
    addPost(newPost, 'postsuggestions');
    setModalVisible(false);
  };

  const handleVote = async (id: number, action: VoteType) => {
    if (selectedVotes[id] === action) {
      const success = await sendVoteRequest(id.toString(), action);
      if (success) {
        // Maintain current vote highlight.
      }
    } else {
      const success = await sendVoteRequest(id.toString(), action);
      if (success) {
        setSelectedVotes(prev => ({ ...prev, [id]: action }));
      }
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
  
        await response.json();
        // Re-fetch posts after voting to update the view.
        fetchOldPosts();
        Alert.alert('Success', 'Your vote has been registered.');
        return true;
      } catch (error) {
        console.error('Vote error:', error);
        Alert.alert('Error', 'There was a problem sending your vote.');
        return false;
      }
    };
  

  // Navigate to Route Finder if needed.
  const handleGoToRouteFinder = () => {
    router.push('/route');
  };

  const handlePostButtonPress = () => {
    const isLoggedIn = !!authToken;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setModalVisible(true);
  };

  const handlePostPress = (postId: number, action: VoteType) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
   
    handleVote(postId, action);
  };

   const sortedPosts = useMemo(() => {
      return [...contextPosts].sort((a, b) => {
        switch (selectedOption) {
          case 'Time':
            return (new Date(b.created_at ?? 0).getTime() || 0) - (new Date(a.created_at ?? 0).getTime() || 0);
          case 'Popularity':
            return (b.votes ?? 0) - (a.votes ?? 0);
          default:
            return 0;
        }
      });
    }, [contextPosts, selectedOption]);

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

  return (
    <ScrollView style={styles.maincontainer}>
      <Text style={styles.sectionTitle}>Discover Experiences</Text>

      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems: 'center', marginTop: 10}}>
             <View style={{ zIndex: 1000 }}>
               <Dropdown options={dropdownOptions} onSelect={handleOptionSelect} defaultValue="Time" />
             </View>
             <TouchableOpacity onPress={handlePostButtonPress} style={styles.postbutton}>
       <Text style={styles.postButtonText}>Post</Text>
     </TouchableOpacity>
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

 {isLoading && (
        <ActivityIndicator size="large" color="#6366F1" style={styles.loadingIndicator} />
      )}
        <View style={{ marginBottom: 200 }}>
          <View style={styles.postsContainer}>
            {sortedPosts.map((post, index) => (
              <View key={`${post.id}-${index}`} style={styles.containerpost}>
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
                  <Text style={styles.postLocation}>From: {post.location}</Text>
                  <Text style={styles.postDestination}>To: {post.destination}</Text>
                  
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
                                 
                               <TouchableOpacity
                   style={[
                     styles.arrowup,
                     post.id && selectedVotes[post.id] === 'upvote' ? { backgroundColor: '#22C55E' } : undefined
                   ]}
                   onPress={() => post.id && handlePostPress(post.id, 'upvote')}
                 >
                   <AntDesign
                     name="arrowup"
                     size={13}
                     color={post.id && selectedVotes[post.id] === 'upvote' ? '#fff' : '#22C55E'}
                   />
                 </TouchableOpacity>
                 <Text style={styles.arrowupnum}>{post.votes}</Text>
                 <TouchableOpacity
                   style={[
                     styles.arrowdown,
                     post.id && selectedVotes[post.id] === 'downvote' ? { backgroundColor: '#C52222' } : undefined
                   ]}
                   onPress={() => post.id && handlePostPress(post.id, 'downvote')}
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
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  
  maincontainer: {flexDirection: 'column', backgroundColor: '#F9FAFB', width: '100%', padding: 15,},
  containerpost: { borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#C7D2FE', padding: 12, elevation: 4, marginBottom: 20, width: '100%', borderWidth: 1},
  suggestordetails: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 2, justifyContent: "space-between" },
  profile: {width: 36,height: 36,borderRadius: 24,backgroundColor: '#6366f1',alignItems: 'center',justifyContent: 'center',marginRight: 16,},
  username: {fontSize: 12,color: '#6B7280',},
  initial: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  suggestorname: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  suggestorusername: { fontSize: 11, color: '#6B7280' },
  suggestor: { flexDirection: 'column' },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
  },
  experience: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  sectionTitle: { color: '#44457D', fontWeight: '500', fontSize: 18,textAlign: 'center'},
  postbutton: {backgroundColor: '#6366F1',paddingHorizontal: 14,paddingVertical: 6,borderRadius: 10,justifyContent: 'center',alignItems: 'center'},
  postButtonText: {color: 'white',fontSize: 12, },
  loadingIndicator: {
    marginVertical: 20,
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
  postsContainer: {
    marginTop: 10,
  },
  postTimestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  postContent: {
    fontSize: 16,
    marginBottom: 4,
  },
  cert: {
    color: '#22c55e',
    fontWeight: '500',
    fontSize: 11,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postLocation: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  postDestination: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
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
});


 
