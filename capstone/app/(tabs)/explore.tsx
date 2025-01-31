import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView, KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

interface PostModalProps {
  closeModal: () => void; // Define the closeModal prop
}

const PostModal: React.FC<PostModalProps> = ({ closeModal }) => {
  return (
    
    <Modal
      animationType="slide"
      transparent={true}
      visible={true} // You can manage this state in the parent component
      onRequestClose={closeModal}
      presentationStyle="overFullScreen"
     
    >
 <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  > 

      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
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
              style={styles.location}
              placeholder="Location: E.g. Glori Bayan, Novaliches, Bayan Glori"
              placeholderTextColor="#666"
              autoFocus
            />

            <TextInput
              style={styles.fare}
              placeholder="Fare: E.g. 150.00"
              placeholderTextColor="#666"
              autoFocus
            />

            <TextInput
              style={styles.destination}
              placeholder="Destination: E.g. Intramuros, Manila"
              placeholderTextColor="#666"
              autoFocus
            />

            <View style={styles.vehicleTypes}>
              <View style={styles.vehicleItem}>
                <MaterialCommunityIcons name="jeepney" size={27} color="#4F46E5" />
                <Text style={styles.vehicleText}>Jeep</Text>
              </View>
              <View style={styles.vehicleItem}>
                <View style={{ paddingBottom: 2, paddingTop: 2 }}>
                  <FontAwesome5 name="bus" size={22} color="#4F46E5" />
                </View>
                <Text style={styles.vehicleText}>Modern jeep</Text>
              </View>
              <View style={styles.vehicleItem}>
                <FontAwesome5 name="bus-alt" size={24} color="#4F46E5" style={{ paddingTop: 2.5 }} />
                <Text style={styles.vehicleText}>Bus</Text>
              </View>
              <View style={styles.vehicleItem}>
                <FontAwesome6 name="train-subway" size={22} color="#4F46E5" style={{ paddingTop: 5 }} />
                <Text style={styles.vehicleText}>Train</Text>
              </View>
              <View style={styles.vehicleItem}>
                <FontAwesome5 name="car" size={22} color="#4F46E5" style={{ paddingTop: 4 }} />
                <Text style={styles.vehicleText}>UV Exp.</Text>
              </View>
            </View>

            <Text style={{ color: '#44457D', fontWeight: '400', fontSize: 14 }}>Route Overview</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginVertical: 10 }}>
              <View style={styles.geton}>
                <Text style={{ color: '#44457D', fontSize: 13, fontWeight: '400' }}>Get On</Text>
              </View>
              <TouchableOpacity style={styles.floatingButton}>
                <Text style={styles.floatingButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.description}
              placeholder="Your description here..."
              placeholderTextColor="#666"
              autoFocus
            />

            <TextInput
              style={styles.suggestiontextbox}
              placeholder="Your experiences"
              placeholderTextColor="#666"
              multiline={true}
              autoFocus
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
      </KeyboardAvoidingView>
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



  modalContainer: {
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    width: '90%',
    height: 'auto',
    minHeight: '40%',
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
  },
  userdetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  vehicleTypes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 4,
    marginTop: 10,
    marginBottom: 26,
  },
  vehicleItem: {
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: 9,
    color: '#6B7280',
    marginVertical: 4,
  },
  geton: {
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    padding: 4,
    borderColor: '#C7D2FE',
    borderWidth: 1,
    width: 80,
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
  description: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
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
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    width: '100%',
    gap: 8,
  },
  cancelButton: {
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
  cancelText: {
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

export default PostModal;