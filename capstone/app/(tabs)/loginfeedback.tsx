import React, { useState, useContext } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import FeedbackComponent from '../feedbackmodal';
import { APP_NAME } from '@/constants';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LogBox } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../AuthContext'; // Update path as needed
import axiosInstance from '../../axiosConfig'; // Update path as needed

LogBox.ignoreLogs(['textShadow*', 'shadow*']);

type FeedbackItem = {
  id: number;
  text: string;
  userName: string;
  userHandle: string;
  initials: string;
  rating: number;
};

const Feedback: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, userName } = useContext(AuthContext);

  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([
    {
      id: 1,
      text: "Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to national hero José Rizal. Apaka angas bbossing!",
      userName: "Ashley",
      userHandle: "@ashruaza",
      initials: "AR",
      rating: 5,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  // Post new feedback to your Rails backend using axiosInstance.
  const postFeedback = async (feedback: FeedbackItem) => {
    try {
      const response = await axiosInstance.post('/api/feedbacks', feedback);
      return response.data;
    } catch (error) {
      console.error("Error posting feedback", error);
    }
  };

  // When a user submits feedback, use the user's name from context.
  const handleSubmit = async (text: string, rating: number) => {
    if (text.trim() && userName) {
      // Compute initials from userName (e.g., "John Doe" => "JD")
      const initials = userName.split(' ').map((word: any[]) => word[0]).join('').toUpperCase();
      // Generate a simple user handle based on the user's name.
      const handle = '@' + userName.toLowerCase().replace(/\s+/g, '');
      
      const newFeedback: FeedbackItem = {
        id: feedbackData.length + 1, // Alternatively, use the backend-provided ID
        text,
        userName: userName,
        userHandle: handle,
        initials: initials,
        rating,
      };
      setFeedbackData([newFeedback, ...feedbackData]);
      setModalVisible(false);
      await postFeedback(newFeedback);
    }
  };

  const handleNewFeedback = (newFeedback: FeedbackItem) => {
    setFeedbackData((prevFeedbackData) => [...prevFeedbackData, newFeedback]);
  };

  // Check if the user is logged in; if not, route to login page.
  // If logged in, open the modal.
  const handleFeedbackPress = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setModalVisible(true);
  };

  const FeedbackCard: React.FC<{ feedback: FeedbackItem }> = ({ feedback }) => (
    <View style={styles.feedbackcontainer}>
      <View style={styles.suggestordetails}>
        <View style={styles.profile}>
          <Text style={styles.initial}>{feedback.initials}</Text>
        </View>
        <View style={styles.suggestor}>
          <Text style={styles.suggestorname}>{feedback.userName}</Text>
          <Text style={styles.suggestorusername}>{feedback.userHandle}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginLeft: 48, marginVertical: 3, gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <AntDesign 
            key={star} 
            name="star" 
            size={14} 
            color={star <= feedback.rating ? "#FFD700" : "#D3D3D3"} 
          />
        ))}
      </View>
      <Text style={styles.usersuggestion}>{feedback.text}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.maincontainer}>
      <Text style={styles.headerText}>Our Feedback</Text>
      <Text style={styles.descriptionText}>
        We value your input on <Text style={styles.boldText}>{APP_NAME}</Text>. Your feedback will help us to improve.
        Please share your thoughts and suggestions to make <Text style={styles.boldText}>{APP_NAME}</Text> even better!
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FeedbackComponent
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmit}
          onNewFeedback={handleNewFeedback}
        />
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  maincontainer: { flexDirection: 'column', padding: 20, backgroundColor: '#F9FAFB', width: '100%' },
  feedbackcontainer: { borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#EEF2FF', padding: 12, elevation: 4, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)", marginBottom: 15 },
  suggestordetails: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 11 },
  profile: { width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  suggestor: { flexDirection: 'column' },
  suggestorname: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  suggestorusername: { fontSize: 11, color: '#6B7280' },
  usersuggestion: { fontSize: 11, color: '#6B7280', flexWrap: 'wrap', marginLeft: 50, marginBottom: 10 },
  arrowup: { borderWidth: 1, borderColor: '#ABEBA2', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' },
  num: { marginLeft: 6, fontSize: 12, fontWeight: '600' },
  arrowdown: { borderWidth: 1, borderColor: '#EBA2A2', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' },
  arrowcontainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  headerText: { fontSize: 20, fontWeight: '600', color: '#44457D', textAlign: 'center', marginTop: -20 },
  descriptionText: { color: '#44457D', textAlign: 'center', fontSize: 13 },
  boldText: { fontWeight: 'bold' },
  ButtonContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginTop: 10 },
  Button: { width: 120, height: 25, borderRadius: 5, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  ButtonText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { paddingVertical: 16, backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 20, width: '90%', height: 'auto', minHeight: '40%', justifyContent: 'space-between' },
  modalText: { fontSize: 11, color: '#6B7280', flexWrap: 'wrap', paddingTop: 20, paddingBottom: 6 },
  buttonContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 'auto', width: '100%', gap: 8 },
  cancelButton: { borderRadius: 10, backgroundColor: '#FFFFFF', width: 80, height: 36, alignItems: 'center', justifyContent: 'center' },
  submitButton: { borderRadius: 10, backgroundColor: '#22C55E', width: 80, height: 36, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#6366F1', fontSize: 13, fontWeight: '700' },
  submitText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  userdetails: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', height: 50, gap: 11 },
  userprofile: { width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  userinitial: { color: '#fff', fontSize: 11, fontWeight: '800' },
  user: { flexDirection: 'column' },
  loginusername: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  username: { fontSize: 11, color: '#6B7280' },
  suggestiontextbox: { backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 8, padding: 8, fontSize: 11, color: '#374151', marginVertical: 8, width: '100%', height: 120, textAlignVertical: 'top' },
});

export default Feedback;
