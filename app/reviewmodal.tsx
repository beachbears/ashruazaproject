import { LogBox, Platform, Linking } from 'react-native';
LogBox.ignoreLogs([
  '"textShadow*" style props are deprecated. Use "textShadow".',
  '"shadow*" style props are deprecated. Use "boxShadow".'
]);

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NearbySpot {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  trivia?: string;
  image_url?: string;
  link?: string;
  feedbacks?: string | string[];
}

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  originCoords?: Coordinates;
  destinationCoords?: Coordinates;
  onSpotsFetched?: (spots: NearbySpot[]) => void;
  nearbySpots?: NearbySpot[];
  onSpotSelect?: (spot: NearbySpot) => void;
  onSpotView?: (spot: NearbySpot) => void; // New prop for viewing details
}

interface RouteData {
  name: string;
  description: string;
  trivia: string;
  image_url: string;
  link?: string;
  feedbacks?: string[];
  latitude: number;
  longitude: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  originCoords,
  destinationCoords,
  onSpotsFetched,
  nearbySpots,
  onSpotSelect,
  onSpotView
}) => {
  const [routeData, setRouteData] = useState<RouteData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // When nearbySpots is provided by the parent, use them directly.
  useEffect(() => {
    if (visible && nearbySpots) {
      const formattedData = nearbySpots.map(spot => ({
        name: spot.name,
        description: spot.description,
        trivia: spot.trivia || 'Interesting fact',
        image_url: spot.image_url || 'https://via.placeholder.com/300x200.png?text=No+Image',
        link: spot.link,
        feedbacks: Array.isArray(spot.feedbacks)
          ? spot.feedbacks
          : (typeof spot.feedbacks === 'string' ? spot.feedbacks.split(';') : []),
        latitude: spot.latitude,
        longitude: spot.longitude
      }));
      setRouteData(formattedData);
    }
  }, [visible, nearbySpots]);

  // Only fetch route data if nearbySpots is not provided.
  useEffect(() => {
    if (visible && !nearbySpots && originCoords && destinationCoords) {
      fetchRouteData();
    }
  }, [visible, originCoords, destinationCoords, nearbySpots]);

  const fetchRouteData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!originCoords || !destinationCoords) {
        throw new Error('Missing coordinates');
      }
      const url = `https://comgu20-production.up.railway.app/api/routes/find?origin_lat=${originCoords.latitude}&origin_lon=${originCoords.longitude}&destination_lat=${destinationCoords.latitude}&destination_lon=${destinationCoords.longitude}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch route data');

      const data = await response.json();
      console.log('Fetched route data:', data);

      if (data.nearby_spots?.length) {
        const formattedData: RouteData[] = data.nearby_spots.map((spot: any) => ({
          name: spot.name,
          description: spot.description,
          trivia: spot.trivia || 'Interesting fact about this location',
          image_url: spot.image_url || 'https://via.placeholder.com/300x200.png?text=No+Image',
          link: spot.link,
          feedbacks: typeof spot.feedbacks === 'string'
            ? [spot.feedbacks]
            : (Array.isArray(spot.feedbacks) ? spot.feedbacks : []),
          latitude: spot.latitude,
          longitude: spot.longitude
        }));
        setRouteData(formattedData);
        if (onSpotsFetched) {
          onSpotsFetched(data.nearby_spots);
        }
      } else {
        setError('No nearby attractions found');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : error ? (
              <Text style={{ color: 'red' }}>{error}</Text>
            ) : routeData ? (
              routeData.map((item, index) => (
                <View key={index} style={styles.attractionCard}>
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.attractionImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/300x200.png?text=Loading...' }}
                  />
                  <Text style={styles.attractionName}>{item.name}</Text>
                  <Text style={styles.attractionDescription}>
                    {item.description || 'No description available.'}
                  </Text>

                  {/* Conditionally render the Official Website button if item.link exists */}
                  {item.link && (
                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => Linking.openURL(item.link!)}
                    >
                      <Text 
                        style={styles.linkText} 
                        numberOfLines={1} 
                        ellipsizeMode="tail"
                      >
                        Official Website
                      </Text>
                      <Ionicons name="open-outline" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                  )}
                  <View style={styles.actionButtonsContainer}>
                    {!item.link && (
                      <>
                        <TouchableOpacity
                          style={styles.viewButton}
                          onPress={() => onSpotView?.(item)}
                        >
                          <Text 
                            style={styles.viewText} 
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                          >
                            View
                          </Text>
                          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.goHereButton}
                          onPress={() => onSpotSelect?.(item)}
                        >
                          <Text 
                            style={styles.goHereText} 
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                          >
                            Go here
                          </Text>
                          <Ionicons name="navigate" size={18} color="#3B82F6" />
                        </TouchableOpacity>
                      </>
                    )}
                    {item.link && (
                      <>
                        <TouchableOpacity
                          style={styles.viewButton}
                          onPress={() => onSpotView?.(item)}
                        >
                          <Text 
                            style={styles.viewText} 
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                          >
                            View
                          </Text>
                          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.goHereButton}
                          onPress={() => onSpotSelect?.(item)}
                        >
                          <Text 
                            style={styles.goHereText} 
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                          >
                            Go here
                          </Text>
                          <Ionicons name="navigate" size={18} color="#3B82F6" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  <View style={styles.feedbackContainer}>
                    <Text style={styles.sectionTitle}>Visitor Feedback</Text>
                    {item.feedbacks && item.feedbacks.length > 0 ? (
                      item.feedbacks.map((feedback, index) => (
                        <View key={index} style={styles.feedbackItem}>
                          <Ionicons name="chatbubble-ellipses" size={14} color="#4B5563" />
                          <Text style={styles.feedbackText}>{feedback}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.feedbackText}>No feedback available.</Text>
                    )}
                  </View>
                  <View style={styles.triviaContainer}>
                    <View style={styles.triviaHeader}>
                      <Ionicons name="sparkles-sharp" size={14} color="#21de6b" />
                      <Text style={styles.triviaTitle}> Trivia & Facts</Text>
                    </View>
                    <Text style={styles.triviafacts}>{item.trivia}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text>No data available</Text>
            )}
          </ScrollView>
          <View style={styles.buttonContainer}>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: '90%',
    height: '90%'
  },
  scrollContent: {
    paddingBottom: 20,
  },
  attractionCard: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FBFCFF',
  },
  attractionImage: {
    height: 200,
    width: '100%',
    borderRadius: 10,
    marginBottom: 10,
  },
  attractionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44457D',
    marginBottom: 5,
  },
  attractionDescription: {
    fontSize: 12,
    color: '#686A9C',
    marginBottom: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    width: '100%',
  },
  linkText: {
    color: '#3B82F6',
    fontWeight: '500'
  },
  goHereButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    width: '48%',
  },
  goHereText: {
    color: '#3B82F6',
    fontWeight: '500'
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    width: '48%',
  },
  viewText: {
    color: '#3B82F6',
    fontWeight: '500'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  feedbackContainer: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12
  },
  feedbackItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 8
  },
  feedbackText: {
    color: '#4B5563',
    fontSize: 14,
    flex: 1
  },
  triviaContainer: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#21de6b',
    backgroundColor: '#f0fae5',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  triviaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  triviaTitle: {
    fontWeight: '600',
    color: '#21de6b'
  },
  triviafacts: {
    fontSize: 12,
    color: '#4F6355'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  closeButton: {
    backgroundColor: '#E0E7FF',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#6366F1',
    fontWeight: 'bold',
    fontSize: 12
  },
});

export default ReviewModal;
