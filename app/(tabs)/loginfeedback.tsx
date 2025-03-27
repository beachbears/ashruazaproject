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


  // Load feedback mula sa AsyncStorage on mount
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

  // Fetch feedback mula sa API on mount
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

  // I-save ang feedback sa AsyncStorage kapag nagbago ang feedbackData
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

  // Function para kunin ang token mula sa AsyncStorage, kasama ang guest check.
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // console.log('getToken - Retrieved token:', token);
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

  // Function para mag-post ng feedback, sine-check muna ang token.
  const postFeedback = async (feedbackPayload: { content: string; rating: number }) => {
    const token = await getToken();
    // console.log('postFeedback - token:', token);
    if (!token) {
      // console.error('Walang valid token. Hindi naka-login.');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axiosInstance.post(
        '/api/feedbacks',
        { feedback: feedbackPayload },
        config
      );
      return response.data;
    } catch (error) {
      // console.error('Error posting feedback:', error);
    }
  };

  // Kapag nagsubmit ng feedback, sine-check muna ang token bago iproseso.
  const handleSubmit = async (text: string, rating: number) => {
    if (!text.trim()) return;
    const token = await getToken();
    // console.log('handleSubmit - token:', token);
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


  const handleFeedbackPress = () => {
    const isLoggedIn = !!authToken;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setModalVisible(true);
  };

  const FeedbackCard: React.FC<{ feedback: FeedbackItem }> = ({ feedback }) => {
    const displayName = feedback.user?.username || 'User';
    const displayEmail = feedback.user?.email || 'user@gmail.com';
    const getInitials = (firstname: string | undefined, lastname: string | undefined) => {
      const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
      const lastInitials = lastname ? lastname.substring(0, 1).toUpperCase() : '';
      return firstInitial + lastInitials;
    };

    return (
      <View style={styles.feedbackcontainer}>
        <View style={styles.suggestordetails}>
          <View style={styles.profile}>
            <Text style={styles.initial}>
              {getInitials(feedback.user?.firstname, feedback.user?.lastname)}
            </Text>
          </View>
          <View style={styles.suggestor}>
            <Text style={styles.suggestorname}>{displayName}</Text>
            <Text style={styles.suggestorusername}>{displayEmail}</Text>
          </View>
        </View>
        {feedback.deleted ? (
          <Text style={styles.deletedMessage}>Feedback deleted by admin.</Text>
        ) : (
          <>
            <View style={{ flexDirection: 'row', marginLeft: 48, marginVertical: 10 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <AntDesign
                  key={star}
                  name="star"
                  size={14}
                  color={star <= feedback.rating ? '#FFD700' : '#D3D3D3'}
                />
              ))}
            </View>
            <Text style={styles.usersuggestion}>{feedback.content}</Text>
          </>
        )}
      </View>
    );
  };



  return (
    <ScrollView style={styles.maincontainer}>
      <Text style={styles.headerText}>Feedback</Text>
      <Text style={styles.descriptionText}>
        We value your input on Kommutsera. Your feedback will help us to improve. Please share your thoughts and suggestions to make  Kommutsera even better!
      </Text>
      <View style={styles.ButtonContainer}>
        <TouchableOpacity style={styles.Button} onPress={handleFeedbackPress}>
          <Text style={styles.ButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginBottom: 150 }}>
        {feedbackData.map(feedback => (
          <FeedbackCard key={feedback.id} feedback={feedback} />
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
  feedbackcontainer: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF2FF',
    padding: 12,
    elevation: 4,
    marginBottom: 15,
  },
  suggestordetails: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    gap: 11,
  },
  profile: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
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
  usersuggestion: {
    fontSize: 11,
    color: '#6B7280',
    flexWrap: 'wrap',
    marginLeft: 50,
    marginBottom: 10,
  },
  deletedMessage: {
    marginLeft: 50,
    fontSize: 11,
    color: 'red',
    fontStyle: 'italic',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#44457D',
    textAlign: 'center',
    marginTop: -10,
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
    width: 120,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});