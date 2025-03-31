import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  route_post_id: number | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirm Delete</Text>
          <Text style={styles.modalMessage}>Are you sure you want to delete this post?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4
  },
  cancelButton: {
    backgroundColor: '#ccc'
  },
  confirmButton: {
    backgroundColor: '#C52222'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16
  }
});

export default DeleteModal;
