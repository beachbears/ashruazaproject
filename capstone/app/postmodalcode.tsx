import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

// Define Vehicle Types
const VEHICLE_TYPES: VehicleType[] = ["Jeep", "E-jeep", "Bus", "UV Exp."];

type VehicleType = "Jeep" | "E-jeep" | "Bus" | "UV Exp.";

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
  timestamp: number;
  vehicles: VehicleType[];
}

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newPost: PostItem) => void;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ visible, onClose, onSubmit }) => {
  const [location, setLocation] = useState('');
  const [fare, setFare] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleType[]>([]);

  const toggleVehicle = (vehicle: VehicleType) => {
    setSelectedVehicles(prev => prev.includes(vehicle)
      ? prev.filter(v => v !== vehicle)
      : [...prev, vehicle]
    );
  };

  const handleSubmit = () => {
    if (!location || !destination || !description) return; // Prevent empty submissions

    const newPost: PostItem = {
      id: Date.now(),
      upvotes: 0,
      downvotes: 0,
      userinitial: 'AR',
      loginusername: 'Ashley Ruaza',
      username: '@ashruaza',
      location,
      fare: parseFloat(fare) || 0,
      destination,
      description,
      suggestiontextbox: suggestion,
      timestamp: Date.now(),
      vehicles: selectedVehicles,
    };

    onSubmit(newPost);
    setLocation('');
    setFare('');
    setDestination('');
    setDescription('');
    setSuggestion('');
    setSelectedVehicles([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
        <TextInput placeholder="Fare" value={fare} onChangeText={setFare} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Destination" value={destination} onChangeText={setDestination} style={styles.input} />

        <View style={styles.vehicleTypes}>
          {VEHICLE_TYPES.map(vehicle => (
            <TouchableOpacity key={vehicle} style={styles.vehicleItem} onPress={() => toggleVehicle(vehicle)}>
              <FontAwesome5 
                name={vehicle === "UV Exp." ? "car" : vehicle === "Bus" ? "bus-alt" : "bus"} 
                size={24} 
                color={selectedVehicles.includes(vehicle) ? "gray" : "#4F46E5"} 
              />
              <Text style={styles.vehicleText}>{vehicle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
        <TextInput placeholder="Your Experience" value={suggestion} onChangeText={setSuggestion} multiline style={styles.input} />

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  vehicleTypes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginVertical: 10,
  },
  vehicleItem: {
    alignItems: 'center',
    padding: 10,
  },
  vehicleText: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#C52222',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ModalComponent;
