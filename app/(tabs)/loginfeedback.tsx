import React, { useState, useEffect, useContext } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  LogBox,
  ActivityIndicator,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeedbackComponent from '../feedbackmodal'; // Your modal component
import axiosInstance from '../../axiosConfig'; // Update path as needed

LogBox.ignoreLogs(['textShadow*', 'shadow*']);

type FeedbackItem = {
  id: number;
  content: string;
  rating: number;
  user?: {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    initials?: string;
    handle?: string;
  };
  deleted?: boolean;
};

const Feedback: React.FC = () => {
  const router = useRouter();
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const { authToken } = useContext(AuthContext) as AuthContextType;

  // Load feedback from AsyncStorage on mount
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const storedFeedback = await AsyncStorage.getItem('feedbackData');
        if (storedFeedback) {
          setFeedbackData(JSON.parse(storedFeedback));
        }
      } catch (error) {
        // console.error('Error loading feedback:', error);
      }
    };
    loadFeedback();
  }, []);

  // Fetch feedback from API on mount
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoadingFeedback(true);
        const response = await axiosInstance.get('/api/feedbacks');
        if (response.data) {
          setFeedbackData(response.data);
        }
      } catch (error) {
        // console.error('Error fetching feedback:', error);
      } finally {
        setLoadingFeedback(false);
      }
    };
    fetchFeedback();
  }, []);

  // Save feedback to AsyncStorage when feedbackData changes
  useEffect(() => {
    const storeFeedback = async () => {
      try {
        await AsyncStorage.setItem('feedbackData', JSON.stringify(feedbackData));
      } catch (error) {
        // console.error('Error storing feedback:', error);
      }
    };
    storeFeedback();
  }, [feedbackData]);

  // Function to get token from AsyncStorage
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (
        token &&
        token.trim() !== '' &&
        token.trim().toLowerCase() !== 'uu@gmail.com' &&
        token.trim().toLowerCase() !== 'null' &&
        token.trim().toLowerCase() !== 'undefined'
      ) {
        return token;
      }
      return null;
    } catch (error) {
      // console.error('Error retrieving token:', error);
      return null;
    }
  };

  // Function to post feedback
  const postFeedback = async (feedbackPayload: { content: string; rating: number }) => {
    const token = await getToken();
    if (!token) {
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axiosInstance.post('/api/feedbacks', { feedback: feedbackPayload }, config);
      return response.data;
    } catch (error) {
      // console.error('Error posting feedback:', error);
    }
  };

  // Handle feedback submission
  const handleSubmit = async (text: string, rating: number) => {
    if (!text.trim()) return;
    const token = await getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    const feedbackPayload = { content: text, rating };
    const createdFeedback = await postFeedback(feedbackPayload);
    if (createdFeedback) {
      setFeedbackData(prev => [createdFeedback, ...prev]);
    }
    setModalVisible(false);
  };

  // Handle feedback button press
  const handleFeedbackPress = () => {
    const isLoggedIn = !!authToken;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setModalVisible(true);
  };

  // New FeedbackItem component with updated styles
  const FeedbackItem: React.FC<{ feedback: FeedbackItem }> = ({ feedback }) => {
    const getInitials = (firstname: string | undefined, lastname: string | undefined, username: string | undefined) => {
      // const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
      // const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
      const userNameInitial = username ? username.charAt(0).toUpperCase() : '';
      // return firstInitial + lastInitial;
      return userNameInitial;
    };

    const initial = getInitials(feedback.user?.firstname, feedback.user?.lastname, feedback.user?.username);
    const displayName = feedback.user?.username || 'User';
    const displayEmail = feedback.user?.email || 'user@gmail.com';

    return (
      <View style={styles.postContainer}>
        <View style={styles.suggestorInfo}>
          <View style={styles.profile}>
            <Text style={styles.initial}>{initial || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.suggestorName}>{displayName}</Text>
            <Text style={styles.suggestorUsername}>{displayEmail}</Text>
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

  return (
    <ScrollView style={styles.maincontainer}>
      <Text style={styles.headerText}>Feedback</Text>
      <Text style={styles.descriptionText}>
        We value your input on Kommutsera. Your feedback will help us to improve. Please share your thoughts and suggestions to make Kommutsera even better!
      </Text>
      <View style={styles.ButtonContainer}>
        <TouchableOpacity style={styles.Button} onPress={handleFeedbackPress}>
          <Text style={styles.ButtonText}>Submit Feedback + </Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginBottom: 150 }}>
        {feedbackData.map(feedback => (
          <FeedbackItem key={feedback.id} feedback={feedback} />
        ))}
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FeedbackComponent
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmit}
        />
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: 'column',
    padding: 20,
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
  headerText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#44457D',
    textAlign: 'center',
    marginTop: 6,
    marginVertical: 10
  },
  descriptionText: {
    color: '#44457D',
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 16,
  },
  ButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  Button: {
    width: 150,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  // New styles for FeedbackItem
  postContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
});