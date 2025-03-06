import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView, StyleSheet
} from 'react-native';
 
interface Post {
  // id: number;
  // upvotes: number;
  // downvotes: number;
  // userinitial: string;
  // loginusername: string;
  // username: string;
  // fare: number;
  // description: string;
  // suggestiontextbox: string;
  // timestamp: number;
  // vehicles: VehicleType[];
  // isExperienceOnly: boolean;
  location: string;         // Add location
  destination: string;  
  content: string;
  origin_lat: number;
  origin_lon: number;
  dest_lat: number;
  dest_lon: number;
}


interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: Post) => void;
  location: string;
  destination: string;
  originLat: number; // Pass origin latitude
  originLon: number; // Pass origin longitude
  destLat: number; // Pass destination latitude
  destLon: number; // Pass destination longitude
  userEmail: string; // Pass user email
  userPassword: string; // Pass user password
  authToken: string; // Pass JWT token for authorization
  // content: string;
  // origin_lat: number;
  // origin_lon: number;
  // dest_lat: number;
  // dest_lon: number;
}


export default function PostModal({ visible, onClose, onSubmit, location, destination, originLat, originLon, destLat, destLon, userEmail, userPassword, authToken }: PostModalProps) {  console.log("Modal Props - Location:", location); // Check console for this
  console.log("Modal Props - Destination:", destination); // Check console for this
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
   
  const handleSubmit = async () => {
    // Construct the payload exactly as the API expects
    const newPost: Post = {
      content: content, // Use the content state from the text input
      origin_lat: originLat, // Use prop instead of hardcoded value
      origin_lon: originLon,
      dest_lat: destLat,
      dest_lon: destLon,
      location: location,  // Include location
      destination: destination,  // Include destination
    };
 
    console.log("New Post Payload:", newPost); // Debugging
 
    try {
      // Send the new post to your backend API
      const response = await fetch('https://comgu20-production.up.railway.app/api/route_posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`, // Include the JWT token
        },
        body: JSON.stringify({
          route_post: newPost, // Match the API's expected parameter name
        }),
      });
 
      if (!response.ok) {
        console.log(response)
        throw new Error('Failed to create post');
      }
 
      const data = await response.json();
      console.log('Post created:', data);
 
      // Call the onSubmit callback (if needed)
      onSubmit(newPost);
 
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    }
 
    // Reset form fields
    setContent('');
 
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
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
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
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    width: '90%',
    minHeight: '40%',
    maxHeight: '90%',
    justifyContent: 'space-between',
  },
  userdetails: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    gap: 11,
    marginBottom: 10,
  },
  userprofile: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userinitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  user: {
    flexDirection: 'column',
  },
  loginusername: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  username: {
    fontSize: 11,
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  vehicleTypes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 4,
    marginTop: 10,
    marginBottom: 10,
  },
  vehicleItem: {
    alignItems: 'center',
    padding: 10,
  },
  vehicleText: {
    marginTop: 5,
    fontSize: 9,
    color: '#6B7280',
  },
 
  routeOverviewText: {
    color: '#44457D',
    fontWeight: '400',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  submitButton: {
    padding: 6,
    marginTop: 10,
    width: '22%',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
  },
  closeButton: {      
    padding: 3,
    marginTop: 10,
    width: '20%',
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  closeText: {
    color: '#6366F1',
    fontSize: 13,
    fontWeight: '700',
  },
  experienceToggle: {
    backgroundColor: '#E0E7FF',
    padding: 6,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'flex-end',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  toggleCircle: {
    width: 12,
    height: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4F46E5',
    marginRight: 10,
  },
  toggleCircleActive: {
    backgroundColor: '#4F46E5',
  },
  toggleText: {
    color: '#44457D',
    fontWeight: '500',
    fontSize: 12,
  },
});


