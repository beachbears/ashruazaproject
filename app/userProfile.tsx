import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AuthContext } from '../contexts/AuthContext';
import axiosInstance from '@/axiosConfig';
import { router } from 'expo-router';
import { Post, usePostContext } from '@/contexts/PostContext';

interface DropdownProps {
  options: string[];
  onSelect?: (option: string) => void;
  defaultValue?: string;
}

interface PostItemProps {
  post: Post;
  onVote: (id: number, action: VoteType) => void;
  onReport: (id: number) => void;
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

interface Profile {
  id: number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

const PostItem = React.memo<PostItemProps>(
  ({ post, onVote, onReport }) => {
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

    const voteStatus: VoteType | undefined =
      post.user_vote === 1 ? 'upvote' : post.user_vote === -1 ? 'downvote' : undefined;

    const selectedVote = post.user_vote === 1 ? 'upvote' : post.user_vote === -1 ? 'downvote' : undefined;
    return (
      <View style={styles.containerpost}>
        <View style={styles.suggestordetails}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <View style={styles.profile}>
              <Text style={styles.initial}>
                {post.user?.firstname && post.user?.lastname
                  ? `${post.user.firstname[0].toUpperCase()}${post.user.lastname[0].toUpperCase()}`
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
          </View>
        </View>
        <Text style={styles.postLocation}>
          <Text style={styles.boldText}>From:</Text> {post.location || 'Unknown Location'}
        </Text>
        <Text style={styles.postDestination}>
          <Text style={styles.boldText}>To:</Text> {post.destination || 'Unknown Destination'}
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
                selectedVote === 'upvote' ? { backgroundColor: '#22C55E' } : undefined,
              ]}
              onPress={() => post.id && onVote(post.id, 'upvote')}
            >
              <AntDesign
                name="arrowup"
                size={13}
                color={selectedVote === 'upvote' ? '#fff' : '#22C55E'}
              />
            </TouchableOpacity>
            <Text style={styles.arrowupnum}>{post.votes}</Text>
            <TouchableOpacity
              style={[
                styles.arrowdown,
                selectedVote === 'downvote' ? { backgroundColor: '#C52222' } : undefined,
              ]}
              onPress={() => post.id && onVote(post.id, 'downvote')}
            >
              <AntDesign
                name="arrowdown"
                size={13}
                color={selectedVote === 'downvote' ? '#fff' : '#C52222'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.post === nextProps.post &&
    // prevProps.selectedVote === nextProps.selectedVote &&
    prevProps.onVote === nextProps.onVote &&
    prevProps.onReport === nextProps.onReport
);

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
  const { posts: contextPosts, updatePost, handleUpvote, handleDownvote, setPosts } = usePostContext();

  const dropdownOptions = ['Popularity', 'Time'];
  // const profilePosts = useMemo(() =>
  //   contextPosts.filter(post => post.user?.email === profile?.email),
  //   [contextPosts, profile]
  // );

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const renderAvatar = () => {
    const initialFirstName = profile?.firstname ? profile.firstname.charAt(0).toUpperCase() : 'U';
    const initialLastName = profile?.lastname ? profile.lastname.charAt(0).toUpperCase() : 'U';
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{initialFirstName}{initialLastName}</Text>
      </View>
    );
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Fetch profile data
      const profileResponse = await axiosInstance.get('/api/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setProfile(profileResponse.data);

      // Fetch user's route posts
      const routePostsResponse = await axiosInstance.get('/api/profile/route_posts', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const fetchedPosts: Post[] = routePostsResponse.data.map((post: any) => ({
        ...post,
        pendingVote: false,
      }));
      setRoutePosts(fetchedPosts);
      setUserPostIds(fetchedPosts.map((p) => p.id));

      // Merge fetchedPosts into contextPosts
      setPosts((prevPosts) => {
        const existingIds = new Set(prevPosts.map((p) => p.id));
        const newPosts = fetchedPosts.filter((p) => !existingIds.has(p.id));
        const updatedPosts = prevPosts.map((p) => {
          const fetchedPost = fetchedPosts.find((fp) => fp.id === p.id);
          return fetchedPost ? { ...p, ...fetchedPost } : p;
        });
        return [...updatedPosts, ...newPosts];
      });

      // Fetch feedbacks
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
      if (err.response?.data?.detailed_errors) {
        setError(err.response.data.detailed_errors.join(', '));
      } else {
        setError('Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

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

      if (action === 'upvote') {
        newUserVote = currentUserVote === 1 ? 0 : 1; // Toggle off if already upvoted
      } else {
        newUserVote = currentUserVote === -1 ? 0 : -1; // Toggle off if already downvoted
      }

      voteDelta = newUserVote - currentUserVote;

      // Optimistic update
      updatePost({
        ...post,
        user_vote: newUserVote,
        votes: (post.votes || 0) + voteDelta,
        pendingVote: true,
      });

      try {
        const result = await sendVoteRequest(id.toString(), action);
        if (result) {
          // Update with server's response
          updatePost({
            ...post,
            votes: result.votes,
            user_vote: result.user_vote,
            pendingVote: false,
          });
        } else {
          // Revert if no result from server
          updatePost({
            ...post,
            user_vote: currentUserVote,
            votes: (post.votes || 0) - voteDelta,
            pendingVote: false,
          });
        }
      } catch (error) {
        console.error('Vote sync error:', error);
        // Revert on error
        updatePost({
          ...post,
          user_vote: currentUserVote,
          votes: (post.votes || 0) - voteDelta,
          pendingVote: false,
        });
      }
    },
    [authToken, contextPosts, updatePost, router]
  );

  const sendVoteRequest = async (postId: string, action: 'upvote' | 'downvote') => {
    try {
      const response = await axiosInstance.post(
        `/api/route_posts/${postId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Vote error:', error);
      throw error;
    }
  };

  const handleReport = async (id: number) => {
    console.log(`Report post with id ${id}`);
  };

  const handleOptionSelect = useCallback((option: string) => {
    setSelectedOption(option);
  }, []);

  // Update sortedPosts calculation
  const sortedPosts = useMemo(() => {
    const userPosts = contextPosts.filter((p: Post) => userPostIds.includes(p.id));
    return userPosts.sort((a, b) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      switch (selectedOption) {
        case 'Time':
          return bDate - aDate;
        case 'Popularity':
          return (b.votes || 0) - (a.votes || 0);
        default:
          return 0;
      }
    });
  }, [contextPosts, userPostIds, selectedOption]);

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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
            accessibilityLabel="Save Changes"
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setIsEditing(false)}
            accessibilityLabel="Cancel"
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  } else {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>{renderAvatar()}</View>
          <Text style={styles.userName}>{profile?.username || 'Username not set'}</Text>
          <Text style={styles.userEmail}>{profile?.email || 'Email not set'}</Text>
          {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
          <View style={styles.profileContent}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.infoText}>First Name: {profile?.firstname || 'Not set'}</Text>
            <Text style={styles.infoText}>Last Name: {profile?.lastname || 'Not set'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
            accessibilityLabel="Edit Profile"
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/changePassword')}
            accessibilityLabel="Change Password"
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Experiences</Text>
            <View style={styles.headerContainer}>
              <Dropdown options={dropdownOptions} onSelect={handleOptionSelect} defaultValue="Time" />
            </View>
            <FlatList
              data={sortedPosts}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <PostItem post={item} onVote={handleVote} onReport={handleReport} />
              )}
              ListEmptyComponent={
                <Text style={styles.noDataText}>You haven't posted any experiences yet.</Text>
              }
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Feedbacks</Text>
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <View key={feedback.id} style={styles.itemContainer}>
                  <Text style={styles.itemText}>Rating: {feedback.rating}</Text>
                  <Text style={styles.itemDescription}>{feedback.content || 'No comment'}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>You haven't posted any feedbacks yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    width: '100%',
  },
  formContainer: {
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: '#6366F1',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 20,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  profileContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 5,
  },
  label: {
    fontSize: 14, // Match community's label fontSize
    fontWeight: '500',
    color: '#44457D', // Add this line to match the community's color
    marginTop: 8 // Adjust as needed
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#1F2937',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
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
  suggestordetails: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    justifyContent: 'space-between',
  },
  profile: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  initial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
  postTimestamp: {
    marginTop: -8,
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  postLocation: {
    fontSize: 12,
    color: '#44457D',
    marginTop: 14,
    marginBottom: 6,
    fontWeight: '400',
  },
  postDestination: {
    fontSize: 12,
    color: '#44457D',
    marginBottom: 16,
    fontWeight: '400',
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cert: {
    color: '#22c55e',
    fontWeight: '500',
    fontSize: 11,
  },
  arrowcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
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
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  section: {
    width: '100%',
    marginTop: 20,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 14,
    color: '#718096',
    marginTop: 5,
  },
  noDataText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
});

export default UserProfile;