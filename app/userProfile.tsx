import React, { useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AuthContext } from '../contexts/AuthContext';
import axiosInstance from '@/axiosConfig';
import { router } from 'expo-router';
import { Post, usePostContext } from '@/contexts/PostContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PostOptionsMenu from './PostOptionsMenu';
import DeleteModal from './deleteModal';

const Tab = createMaterialTopTabNavigator();

// Define interfaces
interface DropdownProps {
  options: string[];
  onSelect?: (option: string) => void;
  defaultValue?: string;
  setDropdownPosition: (position: { x: number; y: number }) => void;
  setDropdownOptions: (options: string[]) => void;
  setOnDropdownSelect: (callback: (option: string) => void) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
}

interface PostItemProps {
  post: Post;
  onVote: (id: number, action: VoteType) => void;
  onReport: (id: number) => void;
  onDelete: (id: number) => void; // Added for delete functionality
}

interface UserProfileTabsProps {
  sortedPosts: Post[];
  feedbacks: any[];
  handleVote: (id: number, action: VoteType) => void;
  handleReport: (id: number) => void;
  handleOptionSelect: (option: string) => void;
  setDropdownPosition: (position: { x: number; y: number }) => void;
  setDropdownOptions: (options: string[]) => void;
  setOnDropdownSelect: (callback: (option: string) => void) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  profile: Profile | null;
  openDeleteModal: (postId: number) => void;
}

interface ProfileSectionProps<T> {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
  emptyText: string;
  header?: React.ReactElement;
}

interface SortingHeaderProps {
  onSelect: (option: string) => void;
  setDropdownPosition: (position: { x: number; y: number }) => void;
  setDropdownOptions: (options: string[]) => void;
  setOnDropdownSelect: (callback: (option: string) => void) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
}

interface Profile {
  id: number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

type VoteType = 'upvote' | 'downvote';

interface FeedbackItemProps {
  feedback: any; // Adjust type based on actual feedback structure if known
  profile: Profile | null;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ feedback, profile }) => {
  const getInitials = (firstname: string | undefined, lastname: string | undefined, username: string | undefined) => {
    // const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
    // const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    const userNameInitial = username ? username.charAt(0).toUpperCase() : '';
    // return firstInitial + lastInitial;
    return userNameInitial;
  };

  const initial = getInitials(profile?.firstname, profile?.lastname, profile?.username);

  return (
    <View style={styles.postContainer}>
      <View style={styles.suggestorInfo}>
        <View style={styles.profile}>
          <Text style={styles.initial}>{initial || 'U'}</Text>
        </View>
        <View>
          <Text style={styles.suggestorName}>{profile?.username || 'User'}</Text>
          <Text style={styles.suggestorUsername}>{profile?.email || 'user@gmail.com'}</Text>
        </View>
      </View>
      {feedback.deleted ? (
        <Text style={styles.feedbackDeletedMessage}>Feedback deleted by admin.</Text>
      ) : (
        <>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <AntDesign
                key={star}
                name="star"
                size={16}
                color={star <= feedback.rating ? '#FFD700' : '#D3D3D3'}
              />
            ))}
          </View>
          <Text style={styles.feedbackContent}>{feedback.content || 'No comment provided'}</Text>
        </>
      )}
    </View>
  );
};

// Dropdown Component (unchanged)
const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSelect,
  defaultValue = 'Select Option',
  setDropdownPosition,
  setDropdownOptions,
  setOnDropdownSelect,
  setIsDropdownOpen,
}) => {
  const dropdownRef = useRef<View>(null);
  const [selectedOption, setSelectedOption] = useState(defaultValue);

  const toggleDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({ x: pageX, y: pageY + height });
        setDropdownOptions(options);
        setOnDropdownSelect(() => (option: string) => {
          setSelectedOption(option);
          if (onSelect) onSelect(option);
          setIsDropdownOpen(false);
        });
        setIsDropdownOpen(true);
      });
    }
  };

  return (
    <View ref={dropdownRef} style={styles.dropdownContainer}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownButton}>
        <Text style={styles.dropdownButtonText}>{selectedOption}</Text>
        <Entypo name="chevron-down" size={20} color="#44457D" />
      </TouchableOpacity>
    </View>
  );
};

// Sorting Header Component (unchanged)
const SortingHeader: React.FC<SortingHeaderProps> = ({
  onSelect,
  setDropdownPosition,
  setDropdownOptions,
  setOnDropdownSelect,
  setIsDropdownOpen,
}) => (
  <View style={styles.sortingHeader}>
    <Text style={styles.sortingLabel}>Sort by:</Text>
    <Dropdown
      options={['Popularity', 'Time']}
      onSelect={onSelect}
      defaultValue="Time"
      setDropdownPosition={setDropdownPosition}
      setDropdownOptions={setDropdownOptions}
      setOnDropdownSelect={setOnDropdownSelect}
      setIsDropdownOpen={setIsDropdownOpen}
    />
  </View>
);

// Profile Section Component (unchanged)
const ProfileSection = <T,>({ data, renderItem, emptyText, header }: ProfileSectionProps<T>) => (
  <FlatList
    data={data}
    renderItem={renderItem}
    ListHeaderComponent={header}
    ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
    contentContainerStyle={styles.listContent}
    showsVerticalScrollIndicator={false}
  />
);

// User Profile Tabs Component (updated)
const UserProfileTabs: React.FC<UserProfileTabsProps> = ({
  sortedPosts,
  feedbacks,
  handleVote,
  handleReport,
  handleOptionSelect,
  setDropdownPosition,
  setDropdownOptions,
  setOnDropdownSelect,
  setIsDropdownOpen,
  profile,
  openDeleteModal
}) => {
  const getInitials = (firstname: string | undefined, lastname: string | undefined) => {
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 16, fontWeight: '600', textTransform: 'none' },
        tabBarIndicatorStyle: { backgroundColor: '#6366F1' },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: { backgroundColor: '#FFFFFF', elevation: 2 },
      }}
    >
      <Tab.Screen name="Experiences">
        {() => (
          <ProfileSection<Post>
            data={sortedPosts}
            renderItem={({ item }) => (
              <PostItem
                post={item}
                onVote={handleVote}
                onReport={handleReport}
                onDelete={openDeleteModal} // Pass onDelete handler
              />
            )}
            emptyText="You haven't posted any experiences yet."
            header={
              <SortingHeader
                onSelect={handleOptionSelect}
                setDropdownPosition={setDropdownPosition}
                setDropdownOptions={setDropdownOptions}
                setOnDropdownSelect={setOnDropdownSelect}
                setIsDropdownOpen={setIsDropdownOpen}
              />
            }
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Feedbacks">
        {() => (
          <ProfileSection<any>
            data={feedbacks}
            renderItem={({ item }) => <FeedbackItem feedback={item} profile={profile} />}
            emptyText="You haven't submitted any feedback yet."
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

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
                {post.user?.username ? `${post.user.username[0].toUpperCase()}` : 'G'}
              </Text>
            </View>
            <View>
              <Text style={styles.suggestorName}>
                {post.user?.username ? `${post.user.username}` : 'Guest'}
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
              onReport={onReport}
              onDelete={onDelete}
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

// Main UserProfile Component
const UserProfile = () => {
  const [userPostIds, setUserPostIds] = useState<number[]>([]);
  const { authToken } = useContext(AuthContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const [routePosts, setRoutePosts] = useState<Post[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState('Time');
  const { posts: contextPosts, updatePost, setPosts } = usePostContext();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [onDropdownSelect, setOnDropdownSelect] = useState<(option: string) => void>(() => { });

  useEffect(() => {
    if (authToken) {
      fetchProfile();
    }
  }, [authToken]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstname: profile.firstname || '',
        lastname: profile.lastname || '',
        username: profile.username || '',
        email: profile.email || '',
      });
      setSuccessMessage(null);
    }
  }, [profile]);

  const openDeleteModal = (postId: number) => {
    setPostIdToDelete(postId);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postIdToDelete) return;
    try {
      const response = await axiosInstance.delete(`/api/route_posts/${postIdToDelete}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setRoutePosts((prev) => prev.filter((p) => p.id !== postIdToDelete));
        setPosts((prev) => prev.filter((p) => p.id !== postIdToDelete));
        setUserPostIds((prev) => prev.filter((id) => id !== postIdToDelete));
        Alert.alert('Success', 'Post deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post. Please try again.');
    } finally {
      setDeleteModalVisible(false);
      setPostIdToDelete(null);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await axiosInstance.get('/api/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setProfile(profileResponse.data);

      const routePostsResponse = await axiosInstance.get('/api/profile/route_posts', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const fetchedPosts: Post[] = routePostsResponse.data.map((post: any) => ({
        ...post,
        location: post.origin_address || 'Unknown Location',
        destination: post.destination_address || 'Unknown Destination',
        pendingVote: false,
      }));
      setRoutePosts(fetchedPosts);
      setUserPostIds(fetchedPosts.map((p) => p.id));

      setPosts((prevPosts) => {
        const existingIds = new Set(prevPosts.map((p) => p.id));
        const newPosts = fetchedPosts.filter((p) => !existingIds.has(p.id));
        const updatedPosts = prevPosts.map((p) => {
          const fetchedPost = fetchedPosts.find((fp) => fp.id === p.id);
          return fetchedPost ? { ...p, ...fetchedPost } : p;
        });
        return [...updatedPosts, ...newPosts];
      });

      const feedbacksResponse = await axiosInstance.get('/api/profile/feedbacks', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setFeedbacks(feedbacksResponse.data);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid email format');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await axiosInstance.patch(
        '/api/profile',
        {
          user: {
            firstname: formData.firstname,
            lastname: formData.lastname,
            username: formData.username,
            email: formData.email,
          },
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setProfile(response.data);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.response?.data?.detailed_errors?.join(', ') || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleVote = useCallback(
    async (id: number, action: VoteType) => {
      if (!authToken) {
        router.push('/login');
        return;
      }

      const post = contextPosts.find((p) => p.id === id);
      if (!post || post.pendingVote) return;

      const currentUserVote = post.user_vote || 0;
      let newUserVote = action === 'upvote' ? (currentUserVote === 1 ? 0 : 1) : (currentUserVote === -1 ? 0 : -1);
      let voteDelta = newUserVote - currentUserVote;

      updatePost({ ...post, user_vote: newUserVote, votes: (post.votes || 0) + voteDelta, pendingVote: true });

      try {
        const response = await axiosInstance.post(
          `/api/route_posts/${id}/${action}`,
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        updatePost({ ...post, votes: response.data.votes, user_vote: response.data.user_vote, pendingVote: false });
      } catch (error) {
        console.error('Vote error:', error);
        updatePost({ ...post, user_vote: currentUserVote, votes: (post.votes || 0) - voteDelta, pendingVote: false });
      }
    },
    [authToken, contextPosts, updatePost]
  );

  const handleReport = async (id: number) => {
    console.log(`Report post with id ${id}`);
  };

  const handleOptionSelect = useCallback((option: string) => {
    setSelectedOption(option);
  }, []);

  const sortedPosts = useMemo(() => {
    const userPosts = contextPosts.filter((p: Post) => userPostIds.includes(p.id));
    return [...userPosts].sort((a, b) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return selectedOption === 'Time' ? bDate - aDate : (b.votes || 0) - (a.votes || 0);
    });
  }, [contextPosts, userPostIds, selectedOption]);

  const renderAvatar = () => {
    const initialUserName = profile?.username ? profile.username.charAt(0).toUpperCase() : 'U';
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{initialUserName}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error && !isEditing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isEditing) {
    return (
      <ScrollView contentContainerStyle={styles.editContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <View style={styles.avatarContainer}>{renderAvatar()}</View>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              placeholder="Enter username"
              accessibilityLabel="Username"
            />
          </View>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              keyboardType="email-address"
              accessibilityLabel="Email"
            />
          </View>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="text-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.firstname}
              onChangeText={(text) => setFormData({ ...formData, firstname: text })}
              placeholder="Enter first name"
              accessibilityLabel="First Name"
            />
          </View>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="text-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.lastname}
              onChangeText={(text) => setFormData({ ...formData, lastname: text })}
              placeholder="Enter last name"
              accessibilityLabel="Last Name"
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileRow}>
          {renderAvatar()}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.username || 'Username not set'}</Text>
            <Text style={styles.userEmail}>{profile?.email || 'Email not set'}</Text>
          </View>
          <View style={styles.profileActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsEditing(true)}
              accessibilityLabel="Edit Profile"
            >
              <MaterialIcons name="edit" size={24} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/changePassword')}
              accessibilityLabel="Change Password"
            >
              <MaterialIcons name="lock" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>
        {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
      </View>
      <UserProfileTabs
        sortedPosts={sortedPosts}
        feedbacks={feedbacks}
        handleVote={handleVote}
        handleReport={handleReport}
        handleOptionSelect={handleOptionSelect}
        setDropdownPosition={setDropdownPosition}
        setDropdownOptions={setDropdownOptions}
        setOnDropdownSelect={setOnDropdownSelect}
        setIsDropdownOpen={setIsDropdownOpen}
        profile={profile}
        openDeleteModal={openDeleteModal}
      />
      {isDropdownOpen && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            onPress={() => setIsDropdownOpen(false)}
            activeOpacity={1}
          />
          <View
            style={[
              styles.dropdownList,
              { top: dropdownPosition.y, left: dropdownPosition.x },
            ]}
          >
            {dropdownOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onDropdownSelect(option)}
                style={styles.option}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {deleteModalVisible && postIdToDelete !== null && (
        <DeleteModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDeleteConfirm}
          route_post_id={postIdToDelete}
        />
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    marginLeft: 12,
    alignItems: 'flex-start',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
  },
  editContainer: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#1F2937',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 24,
  },
  sortingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sortingLabel: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    padding: 8,
    width: 120,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  dropdownButtonText: {
    color: '#44457D',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  option: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 14,
    color: '#44457D',
    textAlign: 'center',
  },
  feedbackContainer: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF2FF',
    padding: 12,
    elevation: 4,
    marginBottom: 15,
  },
  feedbackSuggestorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    gap: 11,
  },
  feedbackProfile: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackInitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  feedbackSuggestor: {
    flexDirection: 'column',
  },
  feedbackSuggestorName: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  feedbackSuggestorUsername: {
    fontSize: 11,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  feedbackContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginTop: 8,
  },
  feedbackDeletedMessage: {
    fontSize: 14,
    color: '#EF4444',
    fontStyle: 'italic',
    marginTop: 12,
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
    elevation: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
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
});

export default UserProfile;