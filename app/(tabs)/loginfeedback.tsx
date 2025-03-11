import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FeedbackComponent from '../feedbackmodal'; // Your modal component
import axiosInstance from '../../axiosConfig';         // Update path as needed

LogBox.ignoreLogs(['textShadow*', 'shadow*']);

type FeedbackItem = {
  id: number;
  content: string;
  userId: string;
  userName: string;
  userHandle: string;
  initials: string;
  rating: number;
  deleted?: boolean;
};

const Feedback: React.FC = () => {
  const router = useRouter();
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Load feedback from AsyncStorage on mount
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const storedFeedback = await AsyncStorage.getItem('feedbackData');
        if (storedFeedback) {
          setFeedbackData(JSON.parse(storedFeedback));
        }
      } catch (error) {
        console.error('Error loading feedback:', error);
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
          console.log("Fetched feedback:", response.data);
          setFeedbackData(response.data);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
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
        console.error('Error storing feedback:', error);
      }
    };
    storeFeedback();
  }, [feedbackData]);

  const postFeedback = async (feedback: FeedbackItem) => {
    try {
      const response = await axiosInstance.post('/api/feedbacks', feedback);
      return response.data;
    } catch (error) {
      console.error('Error posting feedback:', error);
    }
  };

  const handleSubmit = async (text: string, rating: number) => {
    if (!text.trim()) return;
    
    // Kunin ang user details mula sa AsyncStorage; kung wala, gamitin ang default values
    const storedUserName = await AsyncStorage.getItem('userName');
    const storedUserEmail = await AsyncStorage.getItem('userEmail');
    const storedUserId = await AsyncStorage.getItem('userId');

    const userNameToUse = storedUserName || 'DefaultUser';
    const userEmailToUse = storedUserEmail || 'user@gmail.com';
    const userIdToUse = storedUserId || 'defaultUserId';

    // Compute initials at userHandle base sa userNameToUse
    let initials = userNameToUse
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
    if (initials.length < 2 && userNameToUse.length >= 2) {
      initials = userNameToUse.slice(0, 2).toUpperCase();
    }
    const userHandle = userNameToUse.toLowerCase().replace(/\s+/g, '');

    const newFeedback: FeedbackItem = {
      id: Date.now(), // or let backend assign id
      content: text,
      rating,
      userId: userIdToUse,
      userName: userNameToUse,
      userHandle,
      initials,
      deleted: false,
    };

    // Update local state and post the feedback
    setFeedbackData(prev => [newFeedback, ...prev]);
    setModalVisible(false);
    await postFeedback(newFeedback);
  };

  const handleFeedbackPress = () => {
    // Kung wala kang token sa AsyncStorage, ipush sa login
    AsyncStorage.getItem('token').then(token => {
      if (!token) {
        router.push('/login');
      } else {
        setModalVisible(true);
      }
    });
  };

  const FeedbackCard: React.FC<{ feedback: FeedbackItem }> = ({ feedback }) => {
    // Diretso nating gamitin ang naka-save na user details mula sa feedback object
    const displayName = feedback.userName || 'User';
    const displayEmail = feedback.userHandle || 'user@gmail.com';
    const content = feedback.content || 'No content';

    return (
      <View style={styles.feedbackcontainer}>
        <View style={styles.suggestordetails}>
          <View style={styles.profile}>
            <Text style={styles.initial}>{feedback.initials}</Text>
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
            <View style={{ flexDirection: 'row', marginLeft: 48, marginVertical: 3 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <AntDesign
                  key={star}
                  name="star"
                  size={14}
                  color={star <= feedback.rating ? '#FFD700' : '#D3D3D3'}
                />
              ))}
            </View>
            <Text style={styles.usersuggestion}>{content}</Text>
          </>
        )}
      </View>
    );
  };

  if (loadingFeedback) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text>Loading feedback...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.maincontainer}>
      <Text style={styles.headerText}>Feedback</Text>
      <Text style={styles.descriptionText}>
        We appreciate your thoughts! Please submit your feedback below.
      </Text>
      <View style={styles.ButtonContainer}>
        <TouchableOpacity style={styles.Button} onPress={handleFeedbackPress}>
          <Text style={styles.ButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginBottom: 150 }}>
        {feedbackData.map((feedback) => (
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
    fontSize: 20,
    fontWeight: '600',
    color: '#44457D',
    textAlign: 'center',
    marginTop: -20,
  },
  descriptionText: {
    color: '#44457D',
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 10,
  },
  ButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  Button: {
    width: 120,
    height: 25,
    borderRadius: 5,
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
