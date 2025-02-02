import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform} from 'react-native';

interface SamplePostProps {
  visible: boolean;
  closeModal: () => void;
}

const SamplePost: React.FC<SamplePostProps> = ({ visible, closeModal }) => {
  return (
    
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text>This is a sample post modal</Text>
          <TouchableOpacity onPress={closeModal}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
   
  );
};

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: 'column',
    padding: 30,
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
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
});

export default SamplePost;