import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { usePostContext, type Post } from './../contexts/PostContext';
import axios from 'axios';

interface LocationSuggestion {
  name: string;
  lat: number;
  lon: number;
}

async function geocodeAddress(address: string): Promise<LocationSuggestion[]> {
  try {
    const { data } = await axios.get<LocationSuggestion[]>(
      'https://comgu20-production.up.railway.app/api/locations/search',
      { params: { term: address } }
    );
    return data?.map((item: any) => ({
      name: item.label,
      lat: parseFloat(item.latitude),
      lon: parseFloat(item.longitude),
    })) || [];
  } catch (err) {
    console.error('Geocoding error:', err);
    return [];
  }
}

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: Post) => void;
  location: string;
  destination: string;
  origin_lat: number;
  origin_lon: number;
  destination_lat: number;
  destination_lon: number;
  authToken: string;
  userEmail: string;
  userPassword: string;
  isFromCommunity?: boolean;
}

export default function PostModal({
  visible,
  onClose,
  onSubmit,
  location: initialLocation,
  destination: initialDestination,
  origin_lat,
  origin_lon,
  destination_lat,
  destination_lon,
  isFromCommunity = false,
}: PostModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Community search state
  const [localLocation, setLocalLocation] = useState(initialLocation);
  const [localDestination, setLocalDestination] = useState(initialDestination);
  const [currentOriginCoords, setCurrentOriginCoords] = useState({ lat: origin_lat, lon: origin_lon });
  const [currentDestinationCoords, setCurrentDestinationCoords] = useState({ lat: destination_lat, lon: destination_lon });
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);

  // Keep local state in sync with props
  useEffect(() => {
    setLocalLocation(initialLocation);
    setLocalDestination(initialDestination);
    setCurrentOriginCoords({ lat: origin_lat, lon: origin_lon });
    setCurrentDestinationCoords({ lat: destination_lat, lon: destination_lon });
  }, [visible, initialLocation, initialDestination]);

  // Location search handler
  useEffect(() => {
    let active = true;
    if (isFromCommunity && localLocation.length > 2) {
      geocodeAddress(localLocation).then(results => {
        if (active) setLocationSuggestions(results);
      });
    }
    return () => { active = false; };
  }, [localLocation, isFromCommunity]);

  // Destination search handler
  useEffect(() => {
    let active = true;
    if (isFromCommunity && localDestination.length > 2) {
      geocodeAddress(localDestination).then(results => {
        if (active) setDestinationSuggestions(results);
      });
    }
    return () => { active = false; };
  }, [localDestination, isFromCommunity]);

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (!content.trim()) {
      Alert.alert("Error", "Please enter some content before submitting.");
      return;
    }

    const newPost: Post = {
      content,
      origin_lat: isFromCommunity ? currentOriginCoords.lat : origin_lat,
      origin_lon: isFromCommunity ? currentOriginCoords.lon : origin_lon,
      destination_lat: isFromCommunity ? currentDestinationCoords.lat : destination_lat,
      destination_lon: isFromCommunity ? currentDestinationCoords.lon : destination_lon,
      location: isFromCommunity ? localLocation : initialLocation,
      destination: isFromCommunity ? localDestination : initialDestination,
    };

    setIsSubmitting(true);
    onSubmit(newPost);
    setContent('');
    onClose();
    setIsSubmitting(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.postContainer}>
          <ScrollView>
            {/* Location Section */}
            <Text style={styles.label}>From:</Text>
            {isFromCommunity ? (
              <>
                <TextInput
                  placeholder="From: E.g. Glori Bayan"
                  value={localLocation}
                  onChangeText={setLocalLocation}
                  style={styles.input}
                  editable={true}
                />
                {locationSuggestions.length > 0 && (
                  <View style={styles.suggestionContainer}>
                    {locationSuggestions.map((s, i) => (
                      <TouchableOpacity 
                        key={i} 
                        onPress={() => {
                          setLocalLocation(s.name);
                          setCurrentOriginCoords({ lat: s.lat, lon: s.lon });
                          setLocationSuggestions([]);
                        }} 
                        style={styles.suggestionItem}
                      >
                        <Text>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <TextInput
                value={initialLocation}
                style={[styles.input, styles.disabledInput]}
                editable={false}
              />
            )}

            {/* Destination Section */}
            <Text style={styles.label}>To:</Text>
            {isFromCommunity ? (
              <>
                <TextInput
                  placeholder="To: E.g. Intramuros"
                  value={localDestination}
                  onChangeText={setLocalDestination}
                  style={styles.input}
                  editable={true}
                />
                {destinationSuggestions.length > 0 && (
                  <View style={styles.suggestionContainer}>
                    {destinationSuggestions.map((s, i) => (
                      <TouchableOpacity 
                        key={i} 
                        onPress={() => {
                          setLocalDestination(s.name);
                          setCurrentDestinationCoords({ lat: s.lat, lon: s.lon });
                          setDestinationSuggestions([]);
                        }} 
                        style={styles.suggestionItem}
                      >
                        <Text>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <TextInput
                value={initialDestination}
                style={[styles.input, styles.disabledInput]}
                editable={false}
              />
            )}

            {/* Original Content Section */}
            <Text style={styles.exp}>Your Experiences:</Text>
            <TextInput
              placeholder={"Type here...\n\n\n\n"}
              value={content}
              onChangeText={setContent}
              multiline
              style={styles.input}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Text>
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
  locationText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#44457D',
    width: '100%',
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
    marginTop: 14,
  },
  exp:   {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
    marginTop: 20,
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
  
  disabledInput: {
    backgroundColor: '#E5E7EB', // Gray out to indicate non-editable field
  },
  suggestionContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    maxHeight: 150,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});


 



 








