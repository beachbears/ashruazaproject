import React, { useState } from 'react';
import {Modal,View,TextInput,TouchableOpacity,Text,ScrollView, StyleSheet} from 'react-native';

interface Post {
  location: string;
  destination: string;  
  content: string;
  origin_lat: number;
  origin_lon: number;
  destination_lat: number;
  destination_lon: number;
}

 

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: Post) => void;
  location: string;
  destination: string;
  origin_lat: number; // Use underscores to match the data
  origin_lon: number; // Use underscores to match the data
  destination_lat: number;   // Use underscores to match the data
  destination_lon: number;   // Use underscores to match the data
  authToken: string;
  userEmail: string;
  userPassword: string;
}
 

export default function PostModal({ visible, onClose, onSubmit, location, destination, origin_lat, origin_lon, destination_lon, destination_lat }: PostModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this line

  const handleSubmit = () => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true); // Set loading state
  
    const newPost: Post = {
      content: content,
      origin_lat: origin_lat,
      origin_lon: origin_lon,
      destination_lon: destination_lon,
      destination_lat: destination_lat,
      location: location,
      destination: destination,
    };
  
    onSubmit(newPost); // Call the onSubmit callback
    setContent(''); // Reset form fields
    onClose(); // Close the modal
    setIsSubmitting(false); // Reset loading state
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.postContainer}>
          <ScrollView>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={styles.userdetails}>
                <View style={styles.userprofile}>
                  <Text style={styles.userinitial}>AR</Text>
                </View>
                <View style={styles.user}>
                  <Text style={styles.loginusername}>Ash Ruaza</Text>
                  <Text style={styles.username}>@ashruaza</Text>
                </View>
              </View>
            </View> 
            <View style={styles.userdetails}>
              <Text style={styles.username}>From: {location}</Text>
              <Text style={styles.username}>To: {destination}</Text>
            </View>

            <TextInput
              placeholder={"Your Experiences\n\nE.g. We started our journey at the Intramuros gates, aiming to explore the historic walled city. We initially struggled with finding parking, but a guard directed us to a nearby lot. The cobblestone streets were enchanting but tricky to navigate without a map. A tricycle driver offered a short tour, which made it easier to locate iconic spots like Fort Santiago and San Agustin Church. Getting lost led us to a quaint café serving authentic Filipino dishes."}
              value={content}
              onChangeText={setContent}
              multiline
              style={styles.input}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
  style={styles.submitButton}
  onPress={handleSubmit}
  disabled={isSubmitting} // Disable button during submission
>
  <Text style={styles.buttonText}>
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </Text>
</TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
 

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  postContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  userdetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userprofile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userinitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  user: {
    flexDirection: 'column',
  },
  loginusername: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  closeText: {
    textAlign: 'center',
    color: '#000',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
  },
});


 
















