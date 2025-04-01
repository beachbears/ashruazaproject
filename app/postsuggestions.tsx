import React, { useMemo, useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import PostModal from './postmodal';
import { AuthContext, AuthContextType } from './../contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Post } from '@/contexts/PostContext';
import ModalComponent from './reportmodal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PostOptionsMenu from './PostOptionsMenu';
import DeleteModal from './deleteModal';
import Foundation from '@expo/vector-icons/Foundation';

const dropdownOptions = ['Popularity', 'Time'];
type VoteType = 'upvote' | 'downvote';

interface DropdownProps {
  options: string[];
  onSelect?: (option: string) => void;
  defaultValue?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect, defaultValue = 'Sort by' }) => {
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
      return [];
    }
  }, [params.posts]);

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedOption, setSelectedOption] = useState<string>('Time');
  const { authToken } = useContext(AuthContext) as AuthContextType;
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);

  const router = useRouter();
  const location = decodeURIComponent(params.location as string);
  const destination = decodeURIComponent(params.destination as string);
  const origin_lat = Number(params.origin_lat);
  const origin_lon = Number(params.origin_lon);
  const destination_lat = Number(params.destination_lat);
  const destination_lon = Number(params.destination_lon);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://comgu20-production.up.railway.app/api/route_posts/nearby?origin_lat=${origin_lat}&origin_lon=${origin_lon}&dest_lat=${destination_lat}&dest_lon=${destination_lon}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch posts');
        const postsData = await response.json();
        setPosts((prevPosts) => {
          const updatedPosts = postsData.map((p: any) => {
            const existingPost = prevPosts.find((ep) => ep.id === p.id);
            if (existingPost && existingPost.pendingVote) {
              return existingPost;
            }
            return {
              id: p.id,
              content: p.content,
              user: p.user,
              votes: p.votes ?? 0,
              status: p.status,
              comments_count: p.comments_count,
              created_at: p.created_at,
              user_vote: p.user_vote ?? 0,
              pendingVote: false,
            };
          });
          return updatedPosts;
        });
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, [origin_lat, origin_lon, destination_lat, destination_lon, authToken]);

  const handleVote = async (id: number, action: VoteType) => {
    if (!authToken) {
      router.push('/login');
      return;
    }

    const post = posts.find((p) => p.id === id);
    if (!post || post.pendingVote) return;

    const currentUserVote = post.user_vote || 0;
    let newUserVote: number;
    let voteDelta: number;

    if (action === 'upvote') {
      newUserVote = currentUserVote === 1 ? 0 : 1;
    } else {
      newUserVote = currentUserVote === -1 ? 0 : -1;
    }
    voteDelta = newUserVote - currentUserVote;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, votes: (p.votes || 0) + voteDelta, user_vote: newUserVote, pendingVote: true }
          : p
      )
    );

    try {
      const result = await sendVoteRequest(id.toString(), action);
      if (result) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, votes: result.votes, user_vote: result.user_vote ?? 0, pendingVote: false }
              : p
          )
        );
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, votes: (p.votes || 0) - voteDelta, user_vote: currentUserVote, pendingVote: false }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Vote sync error:', error);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, votes: (p.votes || 0) - voteDelta, user_vote: currentUserVote, pendingVote: false }
            : p
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
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Vote error:', error);
      return null;
    }
  };

  const handlePostSubmit = async (formData: Post) => {
    if (!authToken) {
      router.push('/login');
      return;
    }
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
        destination_lon: 0,
        user_vote: responseData.user_vote ?? 0,
      };
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating post:', error);
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
    if (!authToken || !selectedPostId) {
      Alert.alert('Error', 'You must be logged in to report a post.');
      return;
    }
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
      const data = await response.json();
      Alert.alert('Success', data.message || 'Report submitted successfully');
      setIsModalVisible(false);
      setSelectedPostId(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
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

  const openDeleteModal = (postId: number) => {
    setPostIdToDelete(postId);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setPostIdToDelete(null);
  };


  const handleDeleteConfirm = async () => {
    if (!postIdToDelete) return;
    try {
      const response = await fetch(
        `https://comgu20-production.up.railway.app/api/route_posts/${postIdToDelete}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (!response.ok) throw new Error('Delete failed');
      setPosts((prev) => prev.filter((p) => p.id !== postIdToDelete));
      Alert.alert('Success', 'Post deleted successfully.');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post. Please try again.');
    } finally {
      closeDeleteModal();
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
            <View style={styles.detailsContainer}>
            <Foundation name="lightbulb" size={24} color="#B8860B" />
                   <Text style={styles.labeltext}>What's on your mind? Share route tips or browse experiences from commuterss within 1km of your route.</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Dropdown options={dropdownOptions} onSelect={setSelectedOption} />
              <TouchableOpacity
                onPress={() => {
                  if (!authToken) {
                    router.push('/login');
                  } else {
                    setModalVisible(true);
                  }
                }}
                style={styles.postbutton}
              >
                <Text style={styles.postButtonText}>Create New Post +</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.details}>
              <Text style={styles.locationText}><Text style={styles.boldText}>From:</Text> {location}</Text>
              <Text style={styles.locationText}><Text style={styles.boldText}>To:</Text> {destination}</Text>
            </View>
          </>
        }
        renderItem={({ item: post }) => (
          <View style={styles.postContainer}>
            <View style={styles.suggestorDetails}>
              <View style={styles.suggestorInfo}>
                <View style={styles.profile}>
                  <Text style={styles.initial}>
                    {post.user?.firstname && post.user?.lastname
                      ? post.user.username[0].toUpperCase()
                      : 'G'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.suggestorName}>
                    {post.user?.firstname && post.user?.lastname
                      ? `${post.user.username}`
                      : 'Guest'}
                  </Text>
                  <Text style={styles.suggestorUsername}>{post.user?.email}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Text style={styles.postTimestamp}>
                  {post.created_at ? timeAgo(new Date(post.created_at).getTime()) : 'Unknown time'}
                </Text>
                <PostOptionsMenu
                  post={post}
                  onReport={openReportModal}
                  onDelete={() => post.id !== undefined ? openDeleteModal(post.id) : null}
                />
              </View>
            </View>
            <View style={styles.experienceContainer}>
              <Text style={styles.label}>Experience</Text>
              <Text style={styles.experience}>{post.content}</Text>
            </View>
            <View style={styles.postFooter}>
              <View style={[styles.badge, getStatusStyle(post.status || '')]}>
                <Text style={[styles.cert, getStatusTextColor(post.status || '')]}>{post.status}</Text>
              </View>
              <View style={styles.voteContainer}>
                <TouchableOpacity
                  style={[styles.voteButton, post.user_vote === 1 && styles.voteButtonActiveUp]}
                  onPress={() => post.id && handleVote(post.id, 'upvote')}
                >
                  <AntDesign
                    name="arrowup"
                    size={16}
                    color={post.user_vote === 1 ? '#fff' : '#22C55E'}
                  />
                </TouchableOpacity>
                <Text style={styles.voteCount}>{post.votes}</Text>
                <TouchableOpacity
                  style={[styles.voteButton, post.user_vote === -1 && styles.voteButtonActiveDown]}
                  onPress={() => post.id && handleVote(post.id, 'downvote')}
                >
                  <AntDesign
                    name="arrowdown"
                    size={16}
                    color={post.user_vote === -1 ? '#fff' : '#EF4444'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 200 }}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading posts...</Text>
            </View>
          ) : (
            <View style={{ padding: 20 }}>
              <Text style={{ textAlign: 'center', marginTop: 10 }}>No posts found.</Text>
            </View>
          )
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

      {deleteModalVisible && postIdToDelete !== null && (
        <DeleteModal
          visible={deleteModalVisible}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          route_post_id={postIdToDelete} // Use the correct state
        />
      )}

    </View>
  );
}

// Styles remain unchanged
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
  maincontainer: {
    flexDirection: 'column',
    backgroundColor: '#F9FAFB',
    width: '100%',
    padding: 15,
    height: '100%',
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
    fontWeight: '700',
  },
  detailsContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: "center",
    width: '90%',
    justifyContent: 'space-between',
    gap: 14
  },
  details: {
    flexDirection: 'column',
    width: "100%"
  },
  labeltext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#44457D',
    fontStyle: "italic",
  },
  locationText: {
    fontSize: 14,
    fontWeight: '400',
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
  
  // Post-related styles
  postContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderColor: '#C7D2FE',
    borderWidth: 1,
  },
  suggestorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  suggestorUsername: {
    fontSize: 12,
    color: '#6B7280',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  postLocation: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  postDestination: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '600',
    color: '#1E293B',
  },
  experienceContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  cert: {
    fontSize: 12,
    fontWeight: '500',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voteButtonActiveUp: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  voteButtonActiveDown: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    padding: 12,
    elevation: 4,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  suggestor: {
    flexDirection: 'column',
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
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 4,
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
});