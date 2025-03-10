import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { usePostContext, type Post } from './../contexts/PostContext';
import PostModal from './postmodal';
import { AuthContext, AuthContextType } from './../contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PostSuggestions() {
  const { posts, addPost } = usePostContext();
  const { authToken } = React.useContext(AuthContext) as AuthContextType;
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
   const router = useRouter();
   
  // Retrieve and decode route parameters.
  const params = useLocalSearchParams();
  const location = decodeURIComponent(params.location as string);
  const destination = decodeURIComponent(params.destination as string);
  const origin_lat = Number(params.origin_lat);
  const origin_lon = Number(params.origin_lon);
  const destination_lat = Number(params.destination_lat);
  const destination_lon = Number(params.destination_lon);

  console.log("All Posts:", posts);

  const handlePostSubmit = async (formData: Post) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Build the request payload using the keys your API expects.
      const requestBody = {
        route_post: {
          ...formData,
          location,
          destination,
          origin_lat,
          origin_lon,
          // Send keys that your backend requires.
          dest_lat: destination_lat,
          dest_lon: destination_lon,
        },
      };

      console.log("Request Payload:", JSON.stringify(requestBody, null, 2));
      console.log("Auth Token:", authToken);

      const response = await fetch('https://comgu20-production.up.railway.app/api/route_posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error Response:", errorData);
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();
      console.log("API Response (New Post):", newPost);

      // If the API response is missing location or destination, add them.
      if (!newPost.location) newPost.location = location;
      if (!newPost.destination) newPost.destination = destination;

      addPost(newPost, 'postsuggestions');
      setModalVisible(false);
    } catch (error) {
      console.error('Post submission error:', error);
    } finally {
      setIsSubmitting(false);
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
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.postbutton}>
          <Text style={styles.postButtonText}>+ Add Suggestion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postsContainer}>
        {posts.map((post, index) => (
          <View key={`${post.id}-${index}`} style={styles.containerpost}>
            <View style={styles.detailsContainer}>
              <View style={styles.locationBlock}>
                <Text style={styles.label}>From</Text>
                <Text style={styles.locationText}>{post.location}</Text>
              </View>
              <View style={styles.locationBlock}>
                <Text style={styles.label}>To</Text>
                <Text style={styles.locationText}>{post.destination}</Text>
              </View>
            </View>
            <Text style={styles.postContent}>Content: {post.content}</Text>
            <Text style={styles.postUser}>
              User: {post.user?.firstname} {post.user?.lastname} ({post.user?.username})
            </Text>
            <Text style={styles.postVotes}>Votes: {post.votes ?? 0}</Text>
            <Text style={styles.postDate}>Created at: {post.created_at}</Text>
          </View>
        ))}
      </View>

      <PostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handlePostSubmit}
        location={location}
        destination={destination}
        origin_lat={origin_lat}
        origin_lon={origin_lon}
        destination_lat={destination_lat}
        destination_lon={destination_lon}
        authToken={authToken}
        userEmail={''}
        userPassword={''}
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
  postContent: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  postUser: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  postVotes: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
    color: '#888',
  },
});
