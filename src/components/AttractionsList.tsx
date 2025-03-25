// AttractionsList.tsx
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NearbySpot } from '../../src/types';

interface AttractionsListProps {
  nearbySpots: NearbySpot[];
  onSpotSelect?: (spot: NearbySpot) => void;
  onSpotView?: (spot: NearbySpot) => void;
}

const AttractionsList: React.FC<AttractionsListProps> = ({ nearbySpots, onSpotSelect, onSpotView }) => {
  const renderAttractionCard = ({ item }: { item: NearbySpot }) => (
    <View style={styles.attractionCard}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/300x200.png?text=No+Image' }}
        style={styles.attractionImage}
      />
      <Text style={styles.attractionName}>{item.name}</Text>
      <Text style={styles.attractionDescription}>
        {item.description || 'No description available.'}
      </Text>
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onSpotView?.(item)}
        >
          <Text style={styles.viewText}>View</Text>
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.goHereButton}
          onPress={() => onSpotSelect?.(item)}
        >
          <Text style={styles.goHereText}>Go here</Text>
          <Ionicons name="navigate" size={18} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={nearbySpots}
      keyExtractor={(item, index) => item.name + index}
      renderItem={renderAttractionCard}
      contentContainerStyle={styles.scrollContent}
    />
  );
};

const styles = StyleSheet.create({
  attractionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attractionImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  attractionName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  attractionDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  viewText: {
    color: '#3B82F6',
    marginRight: 5,
  },
  goHereButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  goHereText: {
    color: '#3B82F6',
    marginRight: 5,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default AttractionsList;