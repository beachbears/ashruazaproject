import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, FlatList, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostModal from '../postmodal';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { usePostContext, type Post } from '../../contexts/PostContext';
import { useRouteContext } from '../../contexts/RouteContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import ModalComponent from '../reportmodal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PostOptionsMenu from '../PostOptionsMenu';
import DeleteModal from '../deleteModal';
import Foundation from '@expo/vector-icons/Foundation';


const dropdownOptions = ['Popularity', 'Time'];

interface DropdownProps {
  options: string[];
  onSelect?: (option: string) => void;
  defaultValue?: string;
}

interface PostItemProps {
  post: Post;
  onVote: (id: number, action: VoteType) => void;
  onReport: (id: number) => void;
  onDelete: (id: number) => void; // Add this line
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect, defaultValue = 'Select Option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue);

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

const PostItem = React.memo<PostItemProps>(
  ({ post, onVote, onReport, onDelete }) => {
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
        case 'pending review':
          return { backgroundColor: '#fef9c3', borderColor: '#fef9c3' };
        case 'community approved':
          return { backgroundColor: '#dbeafe', borderColor: '#dbeafe' };
        case 'flagged':
          return { backgroundColor: '#fee2e2', borderColor: '#fee2e2' };
        case 'admin approved':
          return { backgroundColor: '#dcfce7', borderColor: '#dcfce7' };
        default:
          return {};
      }
    };

    const getStatusTextColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'flagged':
          return { color: '#b31b1b' };
        case 'admin approved':
          return { color: '#166534' };
        case 'pending review':
          return { color: '#a44d0e' };
        case 'community approved':
          return { color: '#4f40af' };
        default:
          return {};
      }
    };

    const selectedVote = post.user_vote === 1 ? 'upvote' : post.user_vote === -1 ? 'downvote' : undefined;

    return (
      <View style={styles.postContainer}>
        <View style={styles.suggestorDetails}>
          <View style={styles.suggestorInfo}>
            <View style={styles.profile}>
              <Text style={styles.initial}>
                {post.user?.firstname && post.user?.lastname
                  ? `${post.user.username[0].toUpperCase()}`
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
              onReport={() => post.id !== undefined ? onReport(post.id) : null}
              onDelete={() => post.id !== undefined ? onDelete(post.id) : null}
            />
          </View>
        </View>
        <Text style={styles.postLocation}>
          <Text style={styles.boldText}>From:</Text> {post.location || 'Unknown Location'}
        </Text>
        <Text style={styles.postDestination}>
          <Text style={styles.boldText}>To:</Text> {post.destination || 'Unknown Destination'}
        </Text>
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
              style={[styles.voteButton, selectedVote === 'upvote' && styles.voteButtonActiveUp]}
              onPress={() => post.id && onVote(post.id, 'upvote')}
            >
              <AntDesign
                name="arrowup"
                size={16}
                color={selectedVote === 'upvote' ? '#fff' : '#22C55E'}
              />
            </TouchableOpacity>
            <Text style={styles.voteCount}>{post.votes}</Text>
            <TouchableOpacity
              style={[styles.voteButton, selectedVote === 'downvote' && styles.voteButtonActiveDown]}
              onPress={() => post.id && onVote(post.id, 'downvote')}
            >
              <AntDesign
                name="arrowdown"
                size={16}
                color={selectedVote === 'downvote' ? '#fff' : '#EF4444'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.post === nextProps.post &&
    prevProps.onVote === nextProps.onVote &&
    prevProps.onReport === nextProps.onReport &&
    prevProps.onDelete === nextProps.onDelete
);

export default function CommunityPage() {
  const { posts: contextPosts, addPost, setPosts, handleUpvote, handleDownvote, updatePost } = usePostContext();
  const { routeDetails } = useRouteContext();
  const { authToken } = React.useContext(AuthContext) as AuthContextType;
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVotes, setSelectedVotes] = useState<{ [key: number]: VoteType }>({});
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('Time');
  const router = useRouter();


  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);

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

  const fetchOldPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://comgu20-production.up.railway.app/api/route_posts', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      const transformedPosts = data.map((post: any) => {
        const existingPost = contextPosts.find(p => p.id === post.id);
        if (existingPost && existingPost.pendingVote) {
          return existingPost; // Preserve local state if vote is pending
        }
        return {
          ...post,
          location: post.origin_address || routeDetails?.location || location,
          destination: post.destination_address || routeDetails?.destination || destination,
          origin_lat: post.origin_lat,
          origin_lon: post.origin_lon,
          destination_lat: post.dest_lat,
          destination_lon: post.dest_lon,
          created_at: post.created_at,
          timestamp: new Date(post.created_at).getTime(),
          user_vote: post.user_vote,
          pendingVote: false, // Reset for new posts
        };
      });
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   const votes: { [key: number]: VoteType } = {};
  //   contextPosts.forEach((post) => {
  //     if (post.id && post.user_vote !== undefined) {
  //       if (post.user_vote === 1) votes[post.id] = 'upvote';
  //       else if (post.user_vote === -1) votes[post.id] = 'downvote';
  //     }
  //   });
  //   setSelectedVotes(votes);
  // }, [contextPosts]);

  useEffect(() => {
    fetchOldPosts();
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(fetchOldPosts, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  const handlePostSubmit = useCallback(
    async (formData: Post) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const requestBody = {
          route_post: {
            content: formData.content,
            origin_address: formData.location,
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
        if (!response.ok) throw new Error('Failed to create post');
        await response.json();
        await fetchOldPosts();
        setModalVisible(false);
      } catch (error) {
        console.error('Post submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [authToken, isSubmitting]
  );


  const handleVote = useCallback(
    async (id: number, action: 'upvote' | 'downvote') => {
      if (!authToken) {
        router.push('/login');
        return;
      }

      const post = contextPosts.find((p) => p.id === id);
      if (!post || post.pendingVote) return;

      const currentUserVote = post.user_vote || 0;
      let newUserVote: number;
      let voteDelta: number;

      // Determine new vote state
      if (action === 'upvote') {
        newUserVote = currentUserVote === 1 ? 0 : 1;
      } else {
        newUserVote = currentUserVote === -1 ? 0 : -1;
      }

      // Calculate vote change
      voteDelta = newUserVote - currentUserVote;

      // Optimistic update
      updatePost({
        ...post,
        user_vote: newUserVote,
        votes: (post.votes || 0) + voteDelta,
        pendingVote: true
      });

      try {
        const result = await sendVoteRequest(id.toString(), action);
        if (result) {
          // Confirm server's response
          updatePost({
            ...post,
            votes: result.votes,
            user_vote: result.user_vote,
            pendingVote: false
          });
        } else {
          // Revert on failure
          updatePost({
            ...post,
            user_vote: currentUserVote,
            votes: (post.votes || 0) - voteDelta,
            pendingVote: false
          });
        }
      } catch (error) {
        console.error('Vote sync error:', error);
        updatePost({
          ...post,
          user_vote: currentUserVote,
          votes: (post.votes || 0) - voteDelta,
          pendingVote: false
        });
      }
    },
    [authToken, contextPosts, updatePost, router]
  );

  const sendVoteRequest = async (postId: string, action: VoteType) => {
    try {
      const response = await fetch(
        `https://comgu20-production.up.railway.app/api/route_posts/${postId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to send vote');
      const data = await response.json();
      return data; // Expect { id, votes, user_vote, ... }
    } catch (error) {
      console.error('Vote error:', error);
      return null;
    }
  };

  const handleReportSubmit = useCallback(
    async (reason: string) => {
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
            report: { reason, route_post_id: selectedPostId },
          }),
        });
        if (!response.ok) throw new Error('Failed to submit report');
        const data = await response.json();
        Alert.alert('Success', data.message);
        setIsModalVisible(false);
        setSelectedPostId(null);
      } catch (error) {
        console.error('Error submitting report:', error);
        Alert.alert('Error', 'Failed to submit report. Please try again.');
      }
    },
    [authToken, selectedPostId]
  );

  const handlePostButtonPress = useCallback(() => {
    if (!authToken) {
      router.push('/login');
      return;
    }
    setModalVisible(true);
  }, [authToken]);

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


  const handleOptionSelect = useCallback((option: string) => {
    setSelectedOption(option);
  }, []);

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
      <Text style={styles.sectionTitle}>Discover Experiences</Text>
      <View style={styles.headerContainer}>
        <Dropdown options={dropdownOptions} onSelect={handleOptionSelect} defaultValue="Sort by" />
        <TouchableOpacity onPress={handlePostButtonPress} style={styles.postbutton}>
          <Text style={styles.postButtonText}>Create New Post +</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.detailsContainer}>
                  <Foundation name="lightbulb" size={24} color="#B8860B" />
                         <Text style={styles.locationText}>Share route tips or browse experiences from fellow commuters.</Text>
                  </View>
      <FlatList
        contentContainerStyle={{ paddingBottom: 80 }} // Adjust bottom padding as needed
        data={sortedPosts}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onVote={handleVote}
            onReport={openReportModal}
            onDelete={openDeleteModal} // Pass the delete handler
          />
        )}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
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
        origin_lat={routeDetails?.origin_lat ?? (params.origin_lat ? Number(params.origin_lat) : 0)}
        origin_lon={routeDetails?.origin_lon ?? (params.origin_lon ? Number(params.origin_lon) : 0)}
        destination_lat={routeDetails?.destination_lat ?? (params.destination_lat ? Number(params.destination_lat) : 0)}
        destination_lon={routeDetails?.destination_lon ?? (params.destination_lon ? Number(params.destination_lon) : 0)}
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

const styles = StyleSheet.create({
  detailsContainer: {
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: "center",
    width: '90%',
    justifyContent: 'space-between',
    gap: 14
  },
  locationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#44457D',
    fontStyle: "italic",
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  maincontainer: { flex: 1, backgroundColor: '#F9FAFB', padding: 15 },
  containerpost: { borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#C7D2FE', padding: 12, elevation: 4, marginBottom: 20, width: '100%', borderWidth: 1 },
  suggestordetails: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 2, justifyContent: "space-between" },
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
  
  sectionTitle: { color: '#44457D', fontWeight: '500', fontSize: 26, textAlign: 'center' },
  postbutton: { backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  postButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  loadingIndicator: {
    marginVertical: 20,
  },
  postsContainer: {
    marginTop: 10,
  },
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
    borderWidth: 1
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
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  dropdowncontainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
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
    paddingHorizontal: 6,
    paddingVertical: 2
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
    zIndex: 2000,
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
});


