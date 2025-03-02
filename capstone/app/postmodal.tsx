import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const VEHICLE_TYPES: VehicleType[] = ["Jeep", "E-jeep", "Bus", "UV Exp.", "Train"];

type VehicleType = "Jeep" | "E-jeep" | "Bus" | "UV Exp." | "Train";

interface Post {
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

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (post: Post) => void;
}

export default function PostModal({ visible, onClose, onSubmit }: PostModalProps) {
  const [location, setLocation] = useState('');
  const [fare, setFare] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleType[]>([]);
  const [isExperienceOnly, setIsExperienceOnly] = useState(false);

  const toggleVehicle = (vehicle: VehicleType) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicle)
        ? prev.filter(v => v !== vehicle)
        : [...prev, vehicle]
    );
  };

  const handleExperienceToggle = () => {
    setIsExperienceOnly(!isExperienceOnly);
  };

  const handleSubmit = () => {
    if ((!isExperienceOnly && (!location || !destination || !description)) || 
        (isExperienceOnly && !suggestion)) {
      return;
    }

    const newPost: Post = {
      id: Date.now(),
      upvotes: 0,
      downvotes: 0,
      userinitial: 'AR',
      loginusername: 'Ashley Ruaza',
      username: '@ashruaza',
      location: isExperienceOnly ? 'Experience Post' : location,
      fare: isExperienceOnly ? 0 : parseFloat(fare) || 0,
      destination: isExperienceOnly ? 'Experience Post' : destination,
      description: isExperienceOnly ? '' : description,
      suggestiontextbox: suggestion,
      timestamp: Date.now(),
      vehicles: isExperienceOnly ? [] : selectedVehicles,
    };

    onSubmit(newPost);
    setLocation('');
    setFare('');
    setDestination('');
    setDescription('');
    setSuggestion('');
    setSelectedVehicles([]);
    setIsExperienceOnly(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.postContainer}>
          <ScrollView>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' ,  }}> 
            <View style={styles.userdetails}>
              <View style={styles.userprofile}>
                <Text style={styles.userinitial}>AR</Text>
              </View>
              <View style={styles.user}>
                <Text style={styles.loginusername}>Ash Ruaza</Text>
                <Text style={styles.username}>@ashruaza</Text>
              </View>
              </View>
              <TouchableOpacity 
              style={styles.toggleContainer}
              onPress={handleExperienceToggle}
            >
              <View style={[
                styles.toggleCircle,
                isExperienceOnly && styles.toggleCircleActive
              ]}>
              </View>
              <Text style={styles.toggleText}>
                {isExperienceOnly ? 'Switch to Full Post' : 'Experience Only'}
              </Text>
            </TouchableOpacity>
            
            </View>

            

            {!isExperienceOnly && (
              <>
                <TextInput
                  placeholder="Location: E.g. Glori Bayan"
                  value={location}
                  onChangeText={setLocation}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Fare: E.g. 150.00"
                  value={fare}
                  onChangeText={setFare}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Destination: E.g. Intramuros"
                  value={destination}
                  onChangeText={setDestination}
                  style={styles.input}
                />

                <View style={styles.vehicleTypes}>
                  {VEHICLE_TYPES.map(vehicle => (
                    <TouchableOpacity
                      key={vehicle}
                      style={[
                        styles.vehicleItem,
                        
                      ]}
                      onPress={() => toggleVehicle(vehicle)}
                    >
                      {vehicle === "Jeep" ? (
                        <MaterialCommunityIcons
                          name="jeepney"
                          size={26}
                          color={selectedVehicles.includes(vehicle) ? "#4F46E5" : "#64748B"}
                        />
                      ) : vehicle === "Train" ? (
                        <FontAwesome6
                          name="train-subway"
                          size={24}
                          color={selectedVehicles.includes(vehicle) ? "#4F46E5" : "#64748B"}
                        />
                      ) : (
                        <FontAwesome5
                          name={vehicle === "UV Exp." ? "car" : vehicle === "Bus" ? "bus-alt" : "bus"}
                          size={24}
                          color={selectedVehicles.includes(vehicle) ? "#4F46E5" : "#64748B"}
                        />
                      )}
                      <Text style={[
                        styles.vehicleText,
                        { color: selectedVehicles.includes(vehicle) ? "#4F46E5" : "#64748B" }
                      ]}>
                        {vehicle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.routeOverviewText}>Route Overview</Text>
                <TextInput
                  placeholder={"Route Description\n\n"}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  style={styles.input}
                />
              </>
            )}

            <TextInput
              placeholder={"Your Experiences\n\nE.g. We started our journey at the Intramuros gates, aiming to explore the historic walled city. We initially struggled with finding parking, but a guard directed us to a nearby lot. The cobblestone streets were enchanting but tricky to navigate without a map. A tricycle driver offered a short tour, which made it easier to locate iconic spots like Fort Santiago and San Agustin Church. Getting lost led us to a quaint café serving authentic Filipino dishes."}
              
              value={suggestion}
              onChangeText={setSuggestion}
              multiline
              style={styles.input}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  postContainer: {
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
    marginBottom: 10,
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
  input: {
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
    marginBottom: 10,
  },
  vehicleItem: {
    alignItems: 'center',
    padding: 10,
  },
  vehicleText: {
    marginTop: 5,
    fontSize: 9,
    color: '#6B7280',
  },
  
  routeOverviewText: {
    color: '#44457D',
    fontWeight: '400',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  submitButton: {
    padding: 6,
    marginTop: 10,
    width: '22%',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
  },
  closeButton: {      
    padding: 3,
    marginTop: 10,
    width: '20%',
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  closeText: {
    color: '#6366F1',
    fontSize: 13,
    fontWeight: '700',
  },
  experienceToggle: {
    backgroundColor: '#E0E7FF',
    padding: 6,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'flex-end',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  toggleCircle: {
    width: 12,
    height: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4F46E5',
    marginRight: 10,
  },
  toggleCircleActive: {
    backgroundColor: '#4F46E5',
  },
  toggleText: {
    color: '#44457D',
    fontWeight: '500',
    fontSize: 12,
  },
});