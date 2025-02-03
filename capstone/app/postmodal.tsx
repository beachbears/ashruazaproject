import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, TextInput, Button, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

interface PostItem {
  id: number;
  upvotes: number;
  downvotes: number;
  userinitial: string;
  loginusername: string;
  username: string;
  location: string;
  fare: number;
  destination: string;
  description: string;
  suggestiontextbox: string;
}

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (inputText: string) => void;
  onNewPost: (newPost: PostItem) => void;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ visible, onClose, onSubmit, onNewPost }) => {
  const [location, setLocation] = useState<string>('');
  const [fare, setFare] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');
  const locationInputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (destination.trim()) {
      const newPost: PostItem = {
        id: Date.now(),
        upvotes: 0,
        downvotes: 0,
        userinitial: "AR",
        loginusername: "Ashley Ruaza",
        username: "@ashruza",
        location: location,
        fare: parseFloat(fare) || 0,
        destination: destination,
        description: description,
        suggestiontextbox: suggestion,
      };
      onNewPost(newPost);
      setLocation('');
      setFare('');
      setDestination('');
      setDescription('');
      setSuggestion('');
      onSubmit(suggestion);
      onClose();
    }
  };

  useEffect(() => {
    if (visible && locationInputRef.current) {
      setTimeout(() => {
        locationInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.PostContainer}>
          <ScrollView>
            <View style={styles.userdetails}>
              <View style={styles.userprofile}>
                <Text style={styles.userinitial}>AR</Text>
              </View>
              <View style={styles.user}>
                <Text style={styles.loginusername}>Ash Ruaza</Text>
                <Text style={styles.username}>@ashleyruaza</Text>
              </View>
            </View>
            <TextInput
              ref={locationInputRef}
              style={styles.location}
              placeholder="Location: E.g. Glori Bayan"
              placeholderTextColor="#666"
              value={location}
              onChangeText={setLocation}
            />
            <TextInput
              style={styles.fare}
              placeholder="Fare: E.g. 150.00"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={fare}
              onChangeText={setFare}
            />
            <TextInput
              style={styles.destination}
              placeholder="Destination: E.g. Intramuros"
              placeholderTextColor="#666"
              value={destination}
              onChangeText={setDestination}
            />

            <View style={styles.vehicleTypes}>

                              <TouchableOpacity style={styles.vehicleItem}>
                                <MaterialCommunityIcons name="jeepney" size={27} color="#4F46E5" />
                                <Text style={styles.vehicleText}>Jeep</Text>
                              </TouchableOpacity>

                              <TouchableOpacity style={styles.vehicleItem}>
                                <View style={styles.modernJeepIcon}>
                                  <FontAwesome5 name="bus" size={22} color="#4F46E5" />
                                </View>
                                <Text style={styles.vehicleText}>E-jeep</Text>
                              </TouchableOpacity>

                              <TouchableOpacity style={styles.vehicleItem}>
                                <FontAwesome5 name="bus-alt" size={24} color="#4F46E5" style={styles.busIcon} />
                                <Text style={styles.vehicleText}>Bus</Text>
                              </TouchableOpacity>

                              <TouchableOpacity style={styles.vehicleItem}>
                                <FontAwesome6 name="train-subway" size={22} color="#4F46E5" style={styles.trainIcon} />
                                <Text style={styles.vehicleText}>Train</Text>
                              </TouchableOpacity>

                              <TouchableOpacity style={styles.vehicleItem}>
                                <FontAwesome5 name="car" size={23} color="#4F46E5" style={styles.carIcon} />
                                <Text style={styles.vehicleText}>UV Exp.</Text>
                              </TouchableOpacity>
                            </View>

  <Text style={styles.routeOverviewText}>Route Overview</Text>
  
                  <View style={styles.getOnContainer}>
                    <View style={styles.geton}>
                      <Text style={styles.getOnText}>Get On</Text>
                    </View>
                    <TouchableOpacity style={styles.floatingButton}>
                      <Text style={styles.floatingButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
  

            <TextInput
              style={styles.description}
              placeholder="Your description here..."
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={styles.suggestiontextbox}
              placeholder="Your experiences"
              placeholderTextColor="#666"
              multiline={true}
              value={suggestion}
              onChangeText={setSuggestion}
            />
            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
  <Text style={styles.closeText}>Close</Text>
</TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
  <Text style={styles.submitText}>Submit</Text>
</TouchableOpacity>


            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  PostContainer: {
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
    marginBottom: 20,
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
  location: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  fare: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  destination: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  description: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  suggestiontextbox: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
    width: '100%',
    height: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
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
  },
  vehicleText: {
    fontSize: 9,
    color: '#6B7280',
    marginVertical: 4,
  },
  modernJeepIcon: {
    paddingBottom: 2,
    paddingTop: 2,
  },
  busIcon: {
    paddingTop: 2.5,
  },
  trainIcon: {
    paddingTop: 5,
  },
  carIcon: {
    paddingTop: 4,
  },
  routeOverviewText: {
    color: '#44457D',
    fontWeight: '400',
    fontSize: 14,
  },
  getOnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  geton: {
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    padding: 4,
    borderColor: '#C7D2FE',
    borderWidth: 1,
    width: 80,
  },
  getOnText: {
    color: '#44457D',
    fontSize: 13,
    fontWeight: '400',
  },
  floatingButton: {
    width: 30,
    height: 30,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 6,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
  },
  closeButton: {
    borderRadius: 10,
    width: 70,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    borderRadius: 10,
    backgroundColor: '#22C55E',
    width: 80,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#6366F1',
    fontSize: 13,
    fontWeight: '700',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ModalComponent;
