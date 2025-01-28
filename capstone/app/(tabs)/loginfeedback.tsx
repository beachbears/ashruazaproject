import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

type FeedbackItem = { id: number; upvotes: number; downvotes: number; };

const guestfeedback: React.FC = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([
    { id: 1, upvotes: 11, downvotes: 4 },
    { id: 2, upvotes: 8, downvotes: 2 },
    { id: 3, upvotes: 15, downvotes: 3 },
    { id: 4, upvotes: 0, downvotes: 0 },
  ]);

  const handleUpvote = (id: number): void => {
    setFeedbackData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item));
  };

  const handleDownvote = (id: number): void => {
    setFeedbackData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, downvotes: item.downvotes + 1 } : item));
  };

  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <ScrollView style={styles.maincontainer}>
      <Text style={styles.headerText}>Our Feedback</Text>
      <Text style={styles.descriptionText}>
        We value your input on <Text style={styles.boldText}>Kommutsera</Text>. Your feedback will help us to improve. Please
        share your thoughts and suggestions to make <Text style={styles.boldText}>Kommutsera</Text> even better!
      </Text>

      {feedbackData.map((feedback) => (
        <View key={feedback.id} style={styles.feedbackcontainer}>
          <View style={styles.suggestordetails}>
            <View style={styles.profile}>
              <Text style={styles.initial}>NN</Text>
            </View>
            <View style={styles.suggestor}>
              <Text style={styles.suggestorname}>User {feedback.id}</Text>
              <Text style={styles.suggestorusername}>@username{feedback.id}</Text>
            </View>
          </View>

          <Text style={styles.usersuggestion}>
            Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a
            shrine to national hero José Rizal. Apaka angas bbossing!
          </Text>

          <View style={styles.arrowcontainer}>
            <TouchableOpacity style={styles.arrowup} onPress={() => handleUpvote(feedback.id)}>
              <AntDesign name="arrowup" size={15} color="#22C55E" />
              <Text style={[styles.num, { color: '#22C55E' }]}>{feedback.upvotes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.arrowdown} onPress={() => handleDownvote(feedback.id)}>
              <AntDesign name="arrowdown" size={15} color="#C52222" />
              <Text style={[styles.num, { color: '#C52222' }]}>{feedback.downvotes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 300, marginBottom: 100 }}>
        <TouchableOpacity style={styles.floatingButton} onPress={toggleModal}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.userdetails}>
                <View style={styles.userprofile}>
                  <Text style={styles.userinitial}>AR</Text>
                </View>
                <View style={styles.user}>
                  <Text style={styles.loginusername}>Ash Ruaza </Text>
                  <Text style={styles.username}>@ashleyruaza</Text>
                </View>
              </View>
              
              <Text style={styles.modalText}>Tell us your experience using Kommutsera</Text>
              
              <TextInput 
                style={styles.suggestiontextbox} 
                placeholder="Type here..." 
                placeholderTextColor="#666"
                multiline={true}
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  onPress={toggleModal} 
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={toggleModal}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  maincontainer: { flexDirection: 'column', padding: 30, backgroundColor: '#F9FAFB', width: '100%' },
  feedbackcontainer: { borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#EEF2FF', padding: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, marginBottom: 18, },
  suggestordetails: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 11 },
  profile: { width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', },
  initial: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  suggestor: { flexDirection: 'column' },
  suggestorname: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  suggestorusername: { fontSize: 11, color: '#6B7280' },
  usersuggestion: { fontSize: 11, color: '#6B7280', flexWrap: 'wrap', marginLeft: 50, marginBottom: 10 },
  arrowup: { borderWidth: 1, borderColor: '#ABEBA2', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', },
  num: { marginLeft: 6, fontSize: 12, fontWeight: '600' },
  arrowdown: { borderWidth: 1, borderColor: '#EBA2A2', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', },
  arrowcontainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  headerText: { fontSize: 20, fontWeight: '600', color: '#44457D', marginTop: 30, textAlign: 'center' },
  descriptionText: { color: '#44457D', textAlign: 'center', marginBottom: 30, fontSize: 13 },
  boldText: { fontWeight: 'bold' },
  floatingButton: { position: 'relative', width: 40, height: 40, borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 4, elevation: 6, marginTop: 30 },
  floatingButtonText: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold', },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', height: '100%' },
  modalContainer: {paddingVertical: 16,backgroundColor: 'white',borderRadius: 10,paddingHorizontal: 20,width: '90%',height: 'auto',minHeight: '40%',justifyContent: 'space-between'},
  modalText: { fontSize: 11, color: '#6B7280', flexWrap: 'wrap', paddingTop: 20, paddingBottom: 6 },
  buttonContainer: {flexDirection: 'row',alignItems: 'center',justifyContent: 'flex-end',marginTop: 'auto',width: '100%',gap: 8},
  cancelButton: {borderRadius: 10,backgroundColor: '#FFFFFF',width: 80,height: 36,alignItems: 'center',justifyContent: 'center'},
  submitButton: {borderRadius: 10,backgroundColor: '#22C55E',width: 80,height: 36,alignItems: 'center',justifyContent: 'center'},
  cancelText: { color: '#6366F1', fontSize: 13, fontWeight: '700' },
  submitText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  userdetails: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', height: 50, gap: 11, },
  userprofile: { width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', },
  userinitial: { color: '#fff', fontSize: 11, fontWeight: '800', },
  user: { flexDirection: 'column' },
  loginusername: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  username: { fontSize: 11, color: '#6B7280' },
  suggestiontextbox: {backgroundColor: '#EEF2FF',borderWidth: 1,borderColor: '#C7D2FE',borderRadius: 8,padding: 8,fontSize: 11,color: '#374151',marginVertical: 8,width: '100%',height: 120,textAlignVertical: 'top',},
});

export default guestfeedback;