import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { usePostContext, type Post } from './../contexts/PostContext';
import PostModal from './postmodal';
import { AuthContext, AuthContextType } from './../contexts/AuthContext';
import { useLocalSearchParams } from 'expo-router';

export default function PostSuggestions() {
  const { posts, addPost } = usePostContext();
  const { authToken } = React.useContext(AuthContext) as AuthContextType;
  const [modalVisible, setModalVisible] = useState(false);

  // Get and validate route parameters
  const params = useLocalSearchParams();
  
  // Add null checks and decoding
  if (!params.location || !params.destination) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Missing route parameters. Please go back and try again.</Text>
      </View>
    );
  }

  // Decode URL parameters
  const location = decodeURIComponent(params.location as string);
  const destination = decodeURIComponent(params.destination as string);
  
  // Convert coordinate parameters with fallbacks
  const originLat = Number(params.originLat) || 0;
  const originLon = Number(params.originLon) || 0;
  const destLat = Number(params.destLat) || 0;
  const destLon = Number(params.destLon) || 0;

  // Debug logs
  console.log('Route Parameters:', {
    location,
    destination,
    originLat,
    originLon,
    destLat,
    destLon
  });

  const handlePostSubmit = async (formData: Post) => {
    try {
      const response = await fetch('https://comgu20-production.up.railway.app/api/route_posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          route_post: {
            ...formData,
            origin_lat: originLat,
            origin_lon: originLon,
            dest_lat: destLat,
            dest_lon: destLon
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();
      addPost(newPost, 'postsuggestions');
      setModalVisible(false);
    } catch (error) {
      console.error('Post submission error:', error);
    }
  };

  return (  
    <ScrollView style={styles.maincontainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Route Suggestions for</Text>
        <View style={styles.routeHeader}>
          <Text style={styles.routeText}>{location}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.routeText}>{destination}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
          style={styles.postbutton}
        >
          <Text style={styles.postButtonText}>+ Add Suggestion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postsContainer}>
        {posts
          .filter(post => post.category === 'postsuggestions')
          .map((post) => (
            <View key={post.id} style={styles.containerpost}>
              <View style={styles.detailsContainer}>
                <View style={styles.locationBlock}>
                  <Text style={styles.label}>From</Text>
                  <Text style={styles.locationText}>{location}</Text>
                </View>
                <View style={styles.locationBlock}>
                  <Text style={styles.label}>To</Text>
                  <Text style={styles.locationText}>{destination}</Text>
                </View>
              </View>
              <Text style={styles.experience}>{post.content}</Text>
            </View>
          ))}
      </View>

      <PostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handlePostSubmit}
        location={location}
        destination={destination}
        originLat={originLat}
        originLon={originLon}
        destLat={destLat}
        destLon={destLon}
        authToken={authToken}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#DC3545',
    fontSize: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  routeText: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 18,
    color: '#6B7280',
  },
  postbutton: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  postButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  postsContainer: {
    marginBottom: 200,
    gap: 16,
  },
  containerpost: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationBlock: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  experience: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});

 