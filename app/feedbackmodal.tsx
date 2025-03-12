import { APP_NAME } from '@/constants';
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { AuthContext } from '../contexts/AuthContext'; // adjust path as needed

interface FeedbackItem {
  id: number;
  upvotes: number;
  downvotes: number;
  content: string;
  userName: string;
  userHandle: string;
  initials: string;
  rating: number;
}

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string, rating: number) => void;
  onNewFeedback?: (newFeedback: FeedbackItem) => void;
}

/**
 * A modal for collecting user feedback (text + star rating).
 * This version uses AuthContext to determine the user's identity.
 * If no user is logged in, it uses default Guest values.
 */
const ModalComponent: React.FC<ModalComponentProps> = ({
  visible,
  onClose,
  onSubmit,
  onNewFeedback,
}) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const suggestionInputRef = useRef<TextInput>(null);

  // Access user data from AuthContext
  const { isLoggedIn, userName, userHandle, userInitials } = useContext(AuthContext);

  // Focus the text input when the modal becomes visible
  useEffect(() => {
    if (visible && suggestionInputRef.current) {
      setTimeout(() => {
        suggestionInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleStarPress = (rating: number) => {
    setSelectedStars(rating);
  };

  /**
   * Submits the feedback:
   * - Uses user data from AuthContext if available; otherwise defaults to Guest values.
   * - Calls `onNewFeedback` and `onSubmit` with the feedback data.
   */
  const handleSubmit = () => {
    if (suggestion.trim()) {
      const newFeedback: FeedbackItem = {
        id: Date.now(),
        upvotes: 0,
        downvotes: 0,
        // Use user data if logged in; else fallback to Guest
        initials: isLoggedIn && userInitials ? userInitials : 'G',
        userName: isLoggedIn && userName ? userName : 'Guest',
        userHandle: isLoggedIn && userHandle ? userHandle : '@guest',
        content: suggestion,
        rating: selectedStars,
      };

      onNewFeedback?.(newFeedback);
      onSubmit(suggestion, selectedStars);

      // Reset fields and close modal
      setSuggestion('');
      setSelectedStars(0);
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.PostContainer}>
          {/* User details area - display logged in user info or default Guest info */}
          <View style={styles.userdetails}>
            <View style={styles.userprofile}>
              <Text style={styles.userinitial}>
                {isLoggedIn && userInitials ? userInitials : 'G'}
              </Text>
            </View>
            <View style={styles.user}>
              <Text style={styles.loginusername}>
                {isLoggedIn && userName ? userName : 'Guest'}
              </Text>
              <Text style={styles.username}>
                {isLoggedIn && userHandle ? userHandle : '@guest'}
              </Text>
            </View>
          </View>

          <Text style={styles.modalText}>Rate your experience</Text>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                <AntDesign
                  name="star"
                  size={20}
                  color={star <= selectedStars ? '#FFD700' : '#D3D3D3'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalText}>
            Tell us your experience using {APP_NAME}
          </Text>
          <TextInput
            ref={suggestionInputRef}
            style={styles.suggestiontextbox}
            placeholder="Type here..."
            placeholderTextColor="#666"
            multiline
            value={suggestion}
            onChangeText={setSuggestion}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
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

export default ModalComponent;

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
    alignItems: 'center',
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
    width: 60,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  cancelText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '700',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalText: {
    fontSize: 11,
    color: '#686A9C',
    flexWrap: 'wrap',
    fontWeight: '500',
    paddingBottom: 6,
  },
});
