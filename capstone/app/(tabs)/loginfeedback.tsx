import React, { useState, useContext, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  LogBox,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FeedbackComponent from '../feedbackmodal'; // Your modal component
import { AuthContext, AuthContextType  } from "../../contexts/AuthContext"; // Ensure the path is correct

import axiosInstance from '../../axiosConfig';       // Update path as needed

LogBox.ignoreLogs(['textShadow*', 'shadow*']    );

// Define your FeedbackItem type
type FeedbackItem = {
  id: number;
  content: string;
  userName: string;     // e.g. "John Doe"
  userHandle: string;   // e.g. "@johndoe"
  initials: string;     // e.g. "JD"
  rating: number;
};

const Feedback: React.FC = () => {
  const router = useRouter();
  const authContext = useContext(AuthContext) as AuthContextType | null;

  if (!authContext) return null; // Prevents errors if context is null
  
  const { isLoggedIn, userName, userHandle, userInitials, authToken } = authContext;

  // Start with an empty array for a dynamic page
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // ---------------------------------------------
  // 1. Load feedback from AsyncStorage on mount
  // ---------------------------------------------
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

  // --------------------------------------------------
  // 2. Persist feedback to AsyncStorage on each change
  // --------------------------------------------------
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

  // Send new feedback to your backend using axiosInstance
  const postFeedback = async (feedback: FeedbackItem) => {
    try {
      const response = await axiosInstance.post('/api/feedbacks', feedback);
      return response.data;
    } catch (error) {
      console.error('Error posting feedback:', error);
    }
  };

  // ---------------------------------------------
  // 3. Handle feedback submission
  // ---------------------------------------------
  const handleSubmit = async (text: string, rating: number) => {
    // Only submit if there's text and user is logged in
    if (text.trim() && userName) {
      // Generate user initials, e.g. "John Doe" => "JD"
      const initials = userName
        .split(' ')
        .map((word: string) => word[0])
        .join('')
        .toUpperCase();

      // Generate a simple user handle (e.g., '@johndoe')
      const handle = '@' + userName.toLowerCase().replace(/\s+/g, '');

      const newFeedback: FeedbackItem = {
        id: Date.now(), // or use feedbackData.length + 1, or server ID
        content: text,
        userName,
        userHandle: handle,
        initials,
        rating,
      };

      // Update local state (this also triggers persistence)
      setFeedbackData((prev) => [newFeedback, ...prev]);
      setModalVisible(false);

      // Post to backend (optional)
      await postFeedback(newFeedback);
    }
  };

  // Open the feedback modal if logged in; otherwise, navigate to login
  const handleFeedbackPress = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setModalVisible(true);
  };

  // ---------------------------------------------
  // 4. Render a single feedback item
  // ---------------------------------------------
  const FeedbackCard: React.FC<{ feedback: FeedbackItem }> = ({ feedback }) => (
    <View style={styles.feedbackcontainer}>
      <View style={styles.suggestordetails}>
        <View style={styles.profile}>
          <Text style={styles.initial}>{feedback.initials}</Text>
        </View>
        <View style={styles.suggestor}>
          {/* Show first name in bold */}
          <Text style={styles.suggestorname}>
            {feedback.userName.split(' ')[0]}
          </Text>
          {/* Show handle prefixed with '@' */}
          <Text style={styles.suggestorusername}>{feedback.userHandle}</Text>
        </View>
      </View>
      {/* Render rating stars */}
      <View style={{ flexDirection: 'row', marginLeft: 48, marginVertical: 3, gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <AntDesign
            key={star}
            name="star"
            size={14}
            color={star <= feedback.rating ? '#FFD700' : '#D3D3D3'}
          />
        ))}
      </View>
      <Text style={styles.usersuggestion}>{feedback.content}</Text>
    </View>
  );

  // ---------------------------------------------
  // 5. Page Layout
  // ---------------------------------------------
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

      {/* Render existing feedback */}
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
});