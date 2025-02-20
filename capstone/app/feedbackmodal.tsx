import { APP_NAME } from '@/constants';
import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, TextInput,  StyleSheet, TouchableOpacity, Text,} from 'react-native';


interface FeedbackItem {
        id: number;
        upvotes: number;
        downvotes: number;
        text: string;
        userName: string;
        userHandle: string;
        initials: string;
}
interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (inputText: string) => void;
  onNewFeedback: (newPost: FeedbackItem) => void;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ visible, onClose, onSubmit, onNewFeedback }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const suggestionInputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (suggestion.trim()) {
      const newFeedback: FeedbackItem = {
        id: Date.now(),
        upvotes: 0,
        downvotes: 0,
        initials: "AR",
        userName: "Ashley Ruaza",
        userHandle: "@ashruza",
        text: suggestion,
      };
      onNewFeedback(newFeedback);
      setSuggestion('');
      onSubmit(suggestion);
      onClose();
    }
  };

  useEffect(() => {
    if (visible && suggestionInputRef.current) {
      setTimeout(() => {
        suggestionInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.PostContainer}>
      
            
           
                   
                        <View style={styles.userdetails}>
                          <View style={styles.userprofile}>
                            <Text style={styles.userinitial}>AR</Text>
                          </View>
                          <View style={styles.user}>
                            <Text style={styles.loginusername}>Ash Ruaza</Text>
                            <Text style={styles.username}>@ashleyruaza</Text>
                          </View>
                        </View>
            
                        <Text style={styles.modalText}>Tell us your experience using {APP_NAME}</Text>
            
                        <TextInput
                          style={styles.suggestiontextbox}
                          placeholder="Type here..."
                          placeholderTextColor="#666"
                          multiline
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
  modalText: { fontSize: 11, color: '#6B7280', flexWrap: 'wrap', paddingBottom: 6 },
  
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
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.2)",
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
