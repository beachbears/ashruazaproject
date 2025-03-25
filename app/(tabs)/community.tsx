import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostModal from '../postmodal';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { usePostContext, type Post } from '../../contexts/PostContext';
import { useRouteContext } from '../../contexts/RouteContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import ModalComponent from '../reportmodal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


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
   

  const { posts: contextPosts, addPost,  setPosts,
    handleUpvote,
    handleDownvote,
    updatePost } = usePostContext();
  const { routeDetails } = useRouteContext();
  const { authToken } = React.useContext(AuthContext) as AuthContextType;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVotes, setSelectedVotes] = useState<{ [key: number]: VoteType }>({});
  const authContext = useContext(AuthContext) as AuthContextType | null;
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null); // vote id
  const [isModalVisible, setIsModalVisible] = useState(false); // report
  const [modalVisible, setModalVisible] = useState(false); // post
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const router = useRouter();
  const params = useLocalSearchParams();

   

const location = Array.isArray(params.location) 
? decodeURIComponent(params.location[0])
: params.location 
  ? decodeURIComponent(params.location)
  : '';

const destination = Array.isArray(params.destination)
? decodeURIComponent(params.destination[0])
: params.destination
  ? decodeURIComponent(params.destination)
  : '';

  
  const originCoords = {
    lat: Number(params.origin_lat) || 0,
    lon: Number(params.origin_lon) || 0
  };
  
  const destinationCoords = {
    lat: Number(params.destination_lat) || 0,
    lon: Number(params.destination_lon) || 0
  };
  
 
  
  const closeReportModal = () => {
    setIsModalVisible(false);
    setSelectedPostId(null); // Reset after closing
  };

  if (!authContext) return null; // Prevents errors if context is null
  const { isLoggedIn, userName, userHandle, userInitials, } = authContext;
  const [selectedOption, setSelectedOption] = useState<string>('Time'); // dropdown

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  // Use routeDetails if available; otherwise, try URL params or fall back to default names.
  const origin_address =
    routeDetails?.location ||
    (params.origin_address ? decodeURIComponent(params.origin_address as string) : 'Unknown Origin');
  const destination_address =
    routeDetails?.destination ||
    (params.destination_address ? decodeURIComponent(params.destination_address as string) : 'Unknown Destination');
  const origin_lat = routeDetails?.origin_lat ?? (params.origin_lat ? Number(params.origin_lat) : 0);
  const origin_lon = routeDetails?.origin_lon ?? (params.origin_lon ? Number(params.origin_lon) : 0);
  const destination_lat =
    routeDetails?.destination_lat ?? (params.destination_lat ? Number(params.destination_lat) : 0);
  const destination_lon =
    routeDetails?.destination_lon ?? (params.destination_lon ? Number(params.destination_lon) : 0);

  // Fetch old posts from the API when the component mounts.
 // Modify fetchOldPosts to properly sync with context:
 const fetchOldPosts = async () => {
  try {
    const response = await fetch('https://comgu20-production.up.railway.app/api/route_posts');
    if (!response.ok) return;
    
    const data = await response.json();
    
    const transformedPosts: Post[] = data.map((post: any) => ({
      ...post,
      // Map API fields to your Post interface
      location: post.origin_address || origin_address,
      destination: post.destination_address || destination_address,
      origin_lat: post.origin_lat,
      origin_lon: post.origin_lon,
      destination_lat: post.dest_lat,
      destination_lon: post.dest_lon,
      created_at: post.created_at,
      timestamp: new Date(post.created_at).getTime(),
    }));
    setPosts(transformedPosts);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

// Add polling effect
useEffect(() => {
  const interval = setInterval(fetchOldPosts, 5000); // Every 5 seconds
  return () => clearInterval(interval);
}, []);
 
 const handlePostSubmit = async (formData: Post) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const requestBody = {
        route_post: {
          content: formData.content,
          origin_address: formData.location,  // Use formData values
          destination_address: formData.destination,
          origin_lat: formData.origin_lat,
          origin_lon: formData.origin_lon,
          dest_lat: formData.destination_lat,
          dest_lon: formData.destination_lon,
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

      await response.json();
      fetchOldPosts();
      setModalVisible(false);
    } catch (error) {
      console.error('Post submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: number, action: VoteType) => {
    if (!authToken) {
      router.push('/login');
      return;
    }
  
    const previousVote = selectedVotes[id];
    const previousVotesCount = contextPosts.find(p => p.id === id)?.votes || 0;
  
    try {
      // API call
      const success = await sendVoteRequest(id.toString(), action);
      
      if (!success) {
        // Revert if failed
        setSelectedVotes(prev => ({ ...prev, [id]: previousVote }));
        updatePost({
          id,
          votes: previousVotesCount,
        } as Post);
      }
    } catch (error) {
      setSelectedVotes(prev => ({ ...prev, [id]: previousVote }));
      updatePost({
        id,
        votes: previousVotesCount,
      } as Post);
    }
  };
  
  // Modify sendVoteRequest to remove the fetchOldPosts call:
  const sendVoteRequest = async (postId: string, action: VoteType) => {
    try {
      const response = await fetch(`https://comgu20-production.up.railway.app/api/route_posts/${postId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      return response.ok;
    } catch (error) {
      console.error('Vote error:', error);
      return false;
    }
  };

  const handleReportSubmit = async (reason: string) => {
    if (!isLoggedIn || !selectedPostId) {
      Alert.alert("Error", "You must be logged in to report a post.");
      return;
    }
  
    const API_URL = "https://comgu20-production.up.railway.app/api/reports";  
    console.log("Submitting report to:", API_URL); // ✅ Debugging API URL
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          report: {
            reason: reason,
            route_post_id: selectedPostId,
          },
        }),
      });
  
      console.log("Raw response status:", response.status); // ✅ Check response status
  
      if (!response.ok) {
        const errorText = await response.text(); // Read error message
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
  
      const text = await response.text();
      console.log("Raw response:", text); // ✅ Debugging server response
  
      const data = JSON.parse(text); // Convert response to JSON
      console.log("Report submitted:", data);
  
      Alert.alert("Success", data.message);
      closeReportModal();
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
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
  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case "pending review":
        return { backgroundColor: "#fef9c3", borderColor: "#fef9c3" };
      case "community approved":
        return { backgroundColor: "#dbeafe", borderColor: "#dbeafe" };
      case "flagged":
        return { backgroundColor: "#fee2e2", borderColor: "#fee2e2" };
      case "admin approved":
        return { backgroundColor: "#dcfce7", borderColor: "#dcfce7" };
      default:
        return {};
    }
  };

   const getStatusTextColor = (status: string) => {
    switch(status.toLowerCase()) {
      case "flagged":
        return { color: "#b31b1b" };
      case "admin approved":
        return { color: "#166534" };
      case "pending review":
        return { color: "#a44d0e" };
      case "community approved":
        return { color: "#4f40af" };
      default:
        return {};
    }
  };
 
  const handlePostButtonPress = () => {
    const isLoggedIn = !!authToken;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setModalVisible(true);
  };

  const openReportModal = (postId: number) => {
    const isLoggedIn = !!authToken;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setSelectedPostId(postId);
    setIsModalVisible(true);
  };
   
  return (
    <ScrollView style={styles.maincontainer}>
      <Text style={styles.sectionTitle}>Discover Experiences</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3, marginBottom: 12 }}>
        <View style={{ zIndex: 1000 }}>
          <Dropdown options={dropdownOptions} onSelect={handleOptionSelect} defaultValue="Time" />
        </View>
          <TouchableOpacity onPress={handlePostButtonPress} style={styles.postbutton}>
                  <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
      </View>
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
                <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.postTimestamp}>
                {post.created_at ? timeAgo(new Date(post.created_at).getTime()) : 'Unknown time'}
              </Text>
               <TouchableOpacity onPress={() => post.id && openReportModal(post.id)}>
               <MaterialIcons name="report" size={20} color="#C52222" />
              </TouchableOpacity>
              
              </View>
              </View>
              
           {/* In your post rendering section - Fixed syntax and logic */}
<Text style={styles.postLocation}>
 <Text style={styles.boldText}>From:</Text> {post.location || (params.location ? decodeURIComponent(params.location as string) : 'Unknown Location')}
</Text>
<Text style={styles.postDestination}>
<Text style={styles.boldText}>To:</Text> {post.destination || (params.destination ? decodeURIComponent(params.destination as string) : 'Unknown Destination')}
</Text>

              <View style={{ flexDirection: 'column', gap: 8 }}>
                <Text style={styles.label}>Experiences</Text>
                <Text style={styles.experience}>{post.content}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={styles.content}>
                    <View style={[styles.badge, getStatusStyle(post.status || '')]}>
                                    <Text style={[styles.cert, getStatusTextColor(post.status || '')]}>{post.status}</Text>
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

      <PostModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onSubmit={handlePostSubmit}
              location={Array.isArray(location) ? location.join(', ') : location}
              destination={Array.isArray(destination) ? destination.join(', ') : destination}
              origin_lat={origin_lat}
              origin_lon={origin_lon}
              destination_lat={destination_lat}
              destination_lon={destination_lon}
              authToken={authToken}
              userEmail={''}
              userPassword={''}
              isFromCommunity={true} 
            />
       
      {isModalVisible && selectedPostId !== null && (
  <ModalComponent
    visible={isModalVisible}
    onClose={closeReportModal}
    onSubmit={handleReportSubmit}
    route_post_id={selectedPostId} // ✅ Now properly set
  />
)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  maincontainer: { flexDirection: 'column', backgroundColor: '#F9FAFB', width: '100%', padding: 15, },
  containerpost: { borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#C7D2FE', padding: 12, elevation: 4, marginBottom: 20, width: '100%', borderWidth: 1 },
  suggestordetails: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 2, justifyContent: "space-between" },
  profile: { width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 16, },
  username: { fontSize: 12, color: '#6B7280', },
  initial: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  suggestorname: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  suggestorusername: { fontSize: 11, color: '#6B7280' },
  suggestor: { flexDirection: 'column' },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
    marginTop: 8
  },
  boldText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
  },
  experience: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionTitle: { color: '#44457D', fontWeight: '500', fontSize: 20, textAlign: 'center', marginBottom: 20 },
  postbutton: { backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  postButtonText: { color: 'white', fontSize: 12, fontWeight: 600 },
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
    marginTop: -8,
    fontSize: 10,
    color: '#999',
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
    fontSize: 12,
    color: '#44457D',
    marginTop: 14,
    marginBottom: 6,
    fontWeight: 400
  },
  postDestination: {
    fontSize: 12,
    color: '#44457D',
    marginBottom: 16,
    fontWeight: 400
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


