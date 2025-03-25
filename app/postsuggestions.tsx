import React, { useMemo, useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import PostModal from './postmodal';
import { AuthContext, AuthContextType } from './../contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Post } from '@/contexts/PostContext';
import ModalComponent from './reportmodal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const dropdownOptions = ['Popularity', 'Time'];
type VoteType = 'upvote' | 'downvote';

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

export default function PostSuggestions() {
  const params = useLocalSearchParams();
  const initialPosts = useMemo(() => {
    try {
      return params.posts ? JSON.parse(params.posts as string) : [];
    } catch (error) {
      console.error("Error parsing posts:", error);
      return [];
    }
  }, [params.posts]);

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedOption, setSelectedOption] = useState<string>('Time');
  const { authToken } = useContext(AuthContext) as AuthContextType;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVotes, setSelectedVotes] = useState<{ [key: number]: VoteType }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const router = useRouter();
  const location = decodeURIComponent(params.location as string);
  const destination = decodeURIComponent(params.destination as string);
  const origin_lat = Number(params.origin_lat);
  const origin_lon = Number(params.origin_lon);
  const destination_lat = Number(params.destination_lat);
  const destination_lon = Number(params.destination_lon);

  useEffect(() => {
    if (params.source === 'community') {
      setModalVisible(true);
    }
  }, [params.source]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `https://comgu20-production.up.railway.app/api/routes/find?origin_lat=${origin_lat}&origin_lon=${origin_lon}&destination_lat=${destination_lat}&destination_lon=${destination_lon}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch posts');
        const { posts } = await response.json();
        setPosts(posts.map((p: { id: any; content: any; user: any; votes: any; status: any; comments_count: any; created_at: any; }) => ({
          id: p.id,
          content: p.content,
          user: p.user,
          votes: p.votes ?? 0,
          status: p.status,
          comments_count: p.comments_count,
          created_at: p.created_at,
        })));
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts(); // Initial fetch
    const interval = setInterval(fetchPosts, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [origin_lat, origin_lon, destination_lat, destination_lon, authToken]);

  const handleVote = async (id: number, action: VoteType) => {
    if (!authToken) {
      router.push('/login');
      return;
    }

    const currentPost = posts.find((p) => p.id === id);
    if (!currentPost) return;

    const previousVote = selectedVotes[id];
    const previousVotes = currentPost.votes ?? 0;

    setSelectedVotes((prev) => ({ ...prev, [id]: action }));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, votes: previousVotes + (action === 'upvote' ? 1 : -1) }
          : post
      )
    );

    try {
      const success = await sendVoteRequest(id.toString(), action);
      if (!success) {
        setSelectedVotes((prev) => ({ ...prev, [id]: previousVote }));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === id ? { ...post, votes: previousVotes } : post
          )
        );
      }
    } catch (error) {
      console.error('Vote error:', error);
      setSelectedVotes((prev) => ({ ...prev, [id]: previousVote }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, votes: previousVotes } : post
        )
      );
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
      if (!response.ok) throw new Error('Failed to send vote');
      await response.json();
      return true;
    } catch (error) {
      console.error('Vote error:', error);
      return false;
    }
  };

  const handlePostSubmit = async (formData: Post) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const requestBody = {
        route_post: {
          content: formData.content,
          origin_address: location,
          destination_address: destination,
          origin_lat: origin_lat,
          origin_lon: origin_lon,
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
      if (!response.ok) throw new Error('Failed to create post');
      const responseData = await response.json();
      const newPost: Post = {
        id: responseData.id || Date.now(),
        content: responseData.content || formData.content,
        user: responseData.user || { username: 'anonymous' },
        votes: responseData.votes || 0,
        status: responseData.status || 'pending review',
        comments_count: responseData.comments_count || 0,
        created_at: responseData.created_at || new Date().toISOString(),
        location: '',
        destination: '',
        origin_lat: 0,
        origin_lon: 0,
        destination_lat: 0,
        destination_lon: 0
      };
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setModalVisible(false);
    } catch (error) {
      console.error('Post submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReportModal = (postId: number) => {
    if (!authToken) {
      router.push('/login');
      return;
    }
    setSelectedPostId(postId);
    setIsModalVisible(true);
  };

  const closeReportModal = () => {
    setIsModalVisible(false);
    setSelectedPostId(null);
  };

  const handleReportSubmit = async (reason: string) => {
    if (!authToken || !selectedPostId) return;
    try {
      const response = await fetch('https://comgu20-production.up.railway.app/api/reports', {
        method: 'POST',
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
      if (!response.ok) throw new Error('Failed to submit report');
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const sortedPosts = useMemo(() => {
    return posts.slice().sort((a, b) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return selectedOption === 'Time' ? bDate - aDate : (b.votes ?? 0) - (a.votes ?? 0);
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

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending review': return { backgroundColor: '#fef9c3', borderColor: '#fef9c3' };
      case 'community approved': return { backgroundColor: '#dbeafe', borderColor: '#dbeafe' };
      case 'flagged': return { backgroundColor: '#fee2e2', borderColor: '#fee2e2' };
      case 'admin approved': return { backgroundColor: '#dcfce7', borderColor: '#dcfce7' };
      default: return {};
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'flagged': return { color: '#b31b1b' };
      case 'admin approved': return { color: '#166534' };
      case 'pending review': return { color: '#a44d0e' };
      case 'community approved': return { color: '#4f40af' };
      default: return {};
    }
  };

  return (
    <View style={styles.maincontainer}>
      <FlatList
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={21}
        removeClippedSubviews={true}
        data={sortedPosts}
        keyExtractor={(post) => post.id ? post.id.toString() : ''}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Discover Experiences</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
              <Dropdown options={dropdownOptions} onSelect={setSelectedOption} />
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.postbutton}>
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.locationText}><Text style={styles.boldText}>From:</Text> {location}</Text>
              <Text style={styles.locationText}><Text style={styles.boldText}>To:</Text> {destination}</Text>
            </View>
          </>
        }
        renderItem={({ item: post }) => (
          <View style={styles.containerpost}>
            <View style={styles.suggestordetails}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <View style={styles.profile}>
                  <Text style={styles.initial}>
                    {post.user?.firstname && post.user?.lastname
                      ? post.user.firstname[0].toUpperCase() + post.user.lastname[0].toUpperCase()
                      : 'G'}
                  </Text>
                </View>
                <View style={styles.suggestor}>
                  <Text style={styles.suggestorname}>
                    {post.user?.firstname && post.user?.lastname
                      ? `${post.user.firstname} ${post.user.lastname}`
                      : 'Guest'}
                  </Text>
                  <Text style={styles.suggestorusername}>{post.user?.email}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.postTimestamp}>
                  {post.created_at ? timeAgo(new Date(post.created_at).getTime()) : 'Unknown time'}
                </Text>
                <TouchableOpacity onPress={() => post.id && openReportModal(post.id)}>
                  <MaterialIcons name="report" size={20} color="#C52222" />
                </TouchableOpacity>
              </View>
            </View>
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
                  onPress={() => post.id && handleVote(post.id, 'upvote')}
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
        )}
        contentContainerStyle={{ paddingBottom: 200 }}
        ListEmptyComponent={
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading posts...</Text>
          </View>
        }
      />
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
        isFromCommunity={false}
      />
      {isModalVisible && selectedPostId !== null && (
        <ModalComponent
          visible={isModalVisible}
          onClose={closeReportModal}
          onSubmit={handleReportSubmit}
          route_post_id={selectedPostId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#44457D',
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  boldText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
  },
  maincontainer: {
    flexDirection: 'column',
    backgroundColor: '#F9FAFB',
    width: '100%',
    padding: 15,
    height: '100%'
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
    fontWeight: 700
  },
  detailsContainer: {
    marginBottom: 16,
    flexDirection: 'column',
    paddingHorizontal: 10,
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#44457D',
    width: '100%',
    marginTop: -6
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
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
  postTimestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: -8,
    marginBottom: 2,
    textAlign: 'right',
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 16,
  },
  sectionTitle: {
    color: '#44457D',
    fontWeight: '500',
    fontSize: 23,
    textAlign: 'center'
  },
  cert: {
    fontWeight: '500',
    fontSize: 11,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  experience: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  }
});