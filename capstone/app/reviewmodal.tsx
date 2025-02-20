import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ visible, onClose }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
            <Image
                source={require('../assets/images/intramuros.jpg')}
                style={styles.image}
            />
                           
            <View style={styles.label}>
                <Text style={styles.touristspot}>Intramuros</Text>
                <Text style={styles.location}>Manila City</Text>
            </View>
                
            <Text style={styles.description}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to national hero José Rizal. The ornate Manila Cathedral houses bronze carvings and stained glass windows.</Text>

            <View style={[{ flexDirection: 'column', borderWidth: 1, borderColor: '#21de6b', backgroundColor: '#f0fae5', borderRadius: 8, padding: 8, width: '100%', marginTop: 10, marginBottom: 10 }]}>
                <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                    <Ionicons name="sparkles-sharp" size={14} color='#21de6b' />
                    <Text style={[{ fontWeight: '600', color: '#21de6b' }]}> Trivia & Facts</Text>
                </View>
                <Text style={styles.triviafacts}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
            </View>

            <Text style={{ fontSize: 14, color: '#44457D', fontWeight: '700', marginVertical: 12 }}>Tourist Attraction Feedbacks</Text>

            <ScrollView 
                nestedScrollEnabled={true}
                style={styles.scrollBox}
               >
            
                <View style={styles.feedbackbox}>
                    <View style={styles.feedbackcontainer}>
                        <Text style={styles.name}>Juan Dela Cruz</Text>
                        <Text style={styles.feedback}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
                    </View>
                </View>
            
                <View style={styles.feedbackbox}>
                    <View style={styles.feedbackcontainer}>
                        <Text style={styles.name}>Juan Dela Cruz</Text>
                        <Text style={styles.feedback}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
                    </View>
                </View>
            
                <View style={styles.feedbackbox}>
                    <View style={styles.feedbackcontainer}>
                        <Text style={styles.name}>Juan Dela Cruz</Text>
                        <Text style={styles.feedback}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
                    </View>
                </View>
            
                <View style={styles.feedbackbox}>
                    <View style={styles.feedbackcontainer}>
                        <Text style={styles.name}>Juan Dela Cruz</Text>
                        <Text style={styles.feedback}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
                    </View>
                </View>
            
            </ScrollView>

            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 10, borderRadius: 10, width: '90%', height: '90%'},
 
  image: {height: 200, width: '100%', borderRadius: 10,},
  label: {flex: 1, flexDirection: 'column', justifyContent: 'flex-end',   alignItems: 'flex-start', marginLeft: 10, marginBottom: 10 },
  touristspot: {position: 'absolute',bottom: 10, color: 'white',  fontSize: 20,marginBottom: 20,fontWeight: 'bold',textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 1, height: 1 },textShadowRadius: 3,},
  location: {position: 'absolute',bottom: 10, color: 'white', fontSize: 14,fontWeight: '500',textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 1, height: 1 },textShadowRadius: 30,},

  description: { fontSize: 12, color: '#686A9C',},
  triviafacts: { fontSize: 12, color: '#4F6355',},

  scrollBox: {height: 230,  padding: 6, marginBottom: 10},
  feedbackbox: {borderWidth: 1, borderColor: '#C7D2FE', backgroundColor: '#FBFCFF', borderRadius: 14, padding: 8, width: '100%', marginVertical: 5},  
  feedbackcontainer: {flexDirection: 'column'},
  name: {fontSize: 12, color: '#44457D', fontWeight: '700', },
  feedback: { fontSize: 11, color: '#686A9C',},

  closeButton: { backgroundColor: '#E0E7FF', padding: 8, borderRadius: 8, marginTop: 10, width: 60, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#6366F1', fontWeight: 'bold', fontSize: 12, },
});

export default ReviewModal;
