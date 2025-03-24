import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { AuthContext } from '../contexts/AuthContext';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, route_post_id: number) => void;
  route_post_id: number;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  visible,
  onClose,
  onSubmit,
  route_post_id,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [items, setItems] = useState([
    { label: 'Spam', value: 'spam' },
    { label: 'Inappropriate Content', value: 'inappropriate_content' },
    { label: 'Incorrect Information', value: 'incorrect_information' },
    { label: 'Harassment', value: 'harassment' },
  ]);

  const [modalHeight, setModalHeight] = useState('30%');
  useEffect(() => {
    if (open) {
      setModalHeight('60%'); // Taasan ang height kapag open ang dropdown
    } else {
      setModalHeight('30%'); // Balik sa original height
    }
  }, [open]);

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (!visible) setSelectedReason('');
  }, [visible]);

  const handleSubmit = () => {
    if (!isLoggedIn) return alert('Please login to report');
    if (!selectedReason) return alert('Please select a reason');
    
    onSubmit(selectedReason, route_post_id);
    
    onClose();
  };
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.PostContainer}>
          <Text style={styles.modalText}>Select a reason to report this post:</Text>
          <DropDownPicker
        open={open}
        value={selectedReason}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedReason}
        setItems={setItems}
        placeholder="Select a report reason"
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
    minHeight: '34%',
    maxHeight: '80%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
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
    fontSize: 14,
    color: '#44457D',
    fontWeight: '500',
    marginBottom: 30
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#44457D',
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    
  },
  dropdownContainer: {
    borderColor: '#44457D',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 16,
    color: '#44457D',
  },
});

export default ModalComponent;