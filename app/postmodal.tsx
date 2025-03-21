import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { usePostContext, type Post } from './../contexts/PostContext';
import { AuthContext, AuthContextType } from './../contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: Post) => void;
  location: string;
  destination: string;
  origin_lat: number;
  origin_lon: number;
  destination_lat: number;
  destination_lon: number;
  authToken: string;
  userEmail: string;
  userPassword: string;
  isFromCommunity?: boolean; // New prop: if true, location/destination are editable
}

export default function PostModal({
  visible,
  onClose,
  onSubmit,
  location: initialLocation,
  destination: initialDestination,
  origin_lat,
  origin_lon,
  destination_lat,
  destination_lon,
  authToken,
  userEmail,
  userPassword,
  isFromCommunity = false,
}: PostModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local state for location and destination so they can be edited if needed.
  const [location, setLocation] = useState(initialLocation);
  const [destination, setDestination] = useState(initialDestination);

  // Reset local state when modal opens/closes or when initial values change.
  useEffect(() => {
    setLocation(initialLocation);
    setDestination(initialDestination);
  }, [initialLocation, initialDestination, visible]);

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (!content.trim()) {
      Alert.alert("Error", "Please enter some content before submitting.");
      return;
    }
    setIsSubmitting(true);
    const newPost: Post = {
      content,
      origin_lat,
      origin_lon,
      destination_lon,
      destination_lat,
      location,
      destination,
    };

    onSubmit(newPost);
    setContent('');
    onClose();
    setIsSubmitting(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.postContainer}>
          <ScrollView>
            <Text style={styles.label}>From:</Text>
            <TextInput
              placeholder="From: E.g. Glori Bayan"
              value={location}
              onChangeText={isFromCommunity ? setLocation : undefined}
              style={[styles.input, !isFromCommunity && styles.disabledInput]}
              editable={isFromCommunity}
            />

            <Text style={styles.label}>To:</Text>
            <TextInput
              placeholder="To: E.g. Intramuros"
              value={destination}
              onChangeText={isFromCommunity ? setDestination : undefined}
              style={[styles.input, !isFromCommunity && styles.disabledInput]}
              editable={isFromCommunity}
            />
 
            <Text style={styles.exp}>Your Experiences:</Text>
            <TextInput
              placeholder={"Type here...\n\n\n\n"}
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
                disabled={isSubmitting}
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
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    width: '90%',
    minHeight: '40%',
    maxHeight: '90%',
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#44457D',
    width: '100%',
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
    marginTop: 14,
  },
  exp:   {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
    marginTop: 20,
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
  
  disabledInput: {
    backgroundColor: '#E5E7EB', // Gray out to indicate non-editable field
  },
});


 



 








