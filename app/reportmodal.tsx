import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../contexts/AuthContext'; // Adjust path as needed

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, route_post_id: number) => void; // Ensure correct naming
  route_post_id: number; // Pass post ID properly
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  visible,
  onClose,
  onSubmit,
  route_post_id, // Ensure correct naming
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');

  const { isLoggedIn } = useContext(AuthContext); // Get user auth state

  useEffect(() => {
    if (!visible) {
      setSelectedReason('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!isLoggedIn) {
      alert('Only logged-in users can report posts.');
      return;
    }

    if (!selectedReason) {
      alert('Please select a reason before submitting.');
      return;
    }

    onSubmit(selectedReason, route_post_id);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.PostContainer}>
          <Text style={styles.modalText}>Select a reason to report this post:</Text>
          <Picker selectedValue={selectedReason} onValueChange={(itemValue) => setSelectedReason(itemValue)}>
            <Picker.Item label="Select a reason" value="" />
            <Picker.Item label="Spam" value="spam" />
            <Picker.Item label="Inappropriate Content" value="inappropriate_content" />
            <Picker.Item label="Incorrect Information" value="incorrect_information" />
            <Picker.Item label="Harassment" value="harassment" />
          </Picker>

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
    minHeight: '30%',
    maxHeight: '80%',
    justifyContent: 'space-between',
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
    fontWeight: '500',
    paddingBottom: 6,
  },
});
