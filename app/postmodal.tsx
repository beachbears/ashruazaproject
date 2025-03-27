import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Post } from '@/contexts/PostContext';

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
  onSubmit: (formData: Post) => void; // Changed from Post to NewPost
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
  const [localLocation, setLocalLocation] = useState(initialLocation);
  const [localDestination, setLocalDestination] = useState(initialDestination);
  const [currentOriginCoords, setCurrentOriginCoords] = useState({ lat: origin_lat, lon: origin_lon });
  const [currentDestinationCoords, setCurrentDestinationCoords] = useState({ lat: destination_lat, lon: destination_lon });
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  useEffect(() => {
    setLocalLocation(initialLocation);
    setLocalDestination(initialDestination);
    setCurrentOriginCoords({ lat: origin_lat, lon: origin_lon });
    setCurrentDestinationCoords({ lat: destination_lat, lon: destination_lon });
    setLocationSuggestions([]);
    setDestinationSuggestions([]);
    setSelectedLocation(null);
    setSelectedDestination(null);
  }, [visible, initialLocation, initialDestination, origin_lat, origin_lon, destination_lat, destination_lon]);

  useEffect(() => {
    if (!isFromCommunity || !localLocation || localLocation === selectedLocation) {
      setLocationSuggestions([]);
      return;
    }
    let active = true;
    geocodeAddress(localLocation).then(results => {
      if (active) setLocationSuggestions(results);
    });
    return () => { active = false; };
  }, [localLocation, isFromCommunity, selectedLocation]);

  useEffect(() => {
    if (!isFromCommunity || !localDestination || localDestination === selectedDestination) {
      setDestinationSuggestions([]);
      return;
    }
    let active = true;
    geocodeAddress(localDestination).then(results => {
      if (active) setDestinationSuggestions(results);
    });
    return () => { active = false; };
  }, [localDestination, isFromCommunity, selectedDestination]);

  const handleSubmit = () => {
    if (isSubmitting || !content.trim()) {
      if (!content.trim()) Alert.alert("Error", "Please enter some content before submitting.");
      return;
    }
    const newPost = {
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
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="always">
            {/* Location Section */}
            <Text style={styles.label}>From:</Text>
            {isFromCommunity ? (
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Type here..."
                  value={localLocation}
                  onChangeText={setLocalLocation}
                  style={styles.input}
                  editable={isFromCommunity}
                  multiline={false}
                />
                {localLocation && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setLocalLocation('');
                      setLocationSuggestions([]);
                    }}
                  >
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                )}
                {localLocation && locationSuggestions.length > 0 && (
                  <ScrollView style={styles.suggestionList} nestedScrollEnabled keyboardShouldPersistTaps="always">
                    {locationSuggestions.map((s, i) => (
                      <TouchableOpacity
                        key={`${s.name}-${i}`}
                        onPress={() => {
                          setLocalLocation(s.name);
                          setSelectedLocation(s.name);
                          setCurrentOriginCoords({ lat: s.lat, lon: s.lon });
                          setLocationSuggestions([]);
                        }}
                        style={styles.suggestionItem}
                      >
                        <Text style={styles.suggestionText}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ) : (
              <TextInput value={initialLocation} editable={false} style={styles.disabledInput} />
            )}

            {/* Destination Section */}
            <Text style={styles.label}>To:</Text>
            {isFromCommunity ? (
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Type here..."
                  value={localDestination}
                  onChangeText={setLocalDestination}
                  style={styles.input}
                  editable={isFromCommunity}
                  multiline={false}
                />
                {localDestination && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setLocalDestination('');
                      setDestinationSuggestions([]);
                    }}
                  >
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                )}
                {localDestination && destinationSuggestions.length > 0 && (
                  <ScrollView style={styles.suggestionList} nestedScrollEnabled keyboardShouldPersistTaps="always">
                    {destinationSuggestions.map((s, i) => (
                      <TouchableOpacity
                        key={`${s.name}-${i}`}
                        onPress={() => {
                          setLocalDestination(s.name);
                          setSelectedDestination(s.name);
                          setCurrentDestinationCoords({ lat: s.lat, lon: s.lon });
                          setDestinationSuggestions([]);
                        }}
                        style={styles.suggestionItem}
                      >
                        <Text style={styles.suggestionText}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ) : (
              <TextInput value={initialDestination} editable={false} style={styles.disabledInput} />
            )}

            {/* Content Section */}
            <Text style={styles.label}>Your Experiences:</Text>
            <TextInput
              placeholder="Type here..."
              value={content}
              onChangeText={setContent}
              multiline
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            />

            {/* Buttons */}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D',
    marginBottom: 4,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#374151',
    paddingRight: 40,
    height: 40, // Fixed height for "From" and "To"
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 10,
  },
  suggestionList: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 250,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  suggestionText: {
    color: '#444',
    fontSize: 14,
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#E5E7EB',
    height: 40, // Consistent height for disabled inputs
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
  },
  submitButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#22C55E',
  },
  closeText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});