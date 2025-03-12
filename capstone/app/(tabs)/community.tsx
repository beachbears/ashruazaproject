import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostModal from '../postmodal';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { usePostContext, type Post } from '../../contexts/PostContext';
import { useRouteContext } from '../../contexts/RouteContext';

export default function CommunityPage() {
  const { posts, addPost } = usePostContext();
  const { routeDetails } = useRouteContext();
  const { authToken } = React.useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const params = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);

  // Use routeDetails if available; otherwise, try URL params or fall back to default names.
  const location =
    routeDetails?.location ||
    (params.location ? decodeURIComponent(params.location as string) : 'Unknown Origin');
  const destination =
    routeDetails?.destination ||
    (params.destination ? decodeURIComponent(params.destination as string) : 'Unknown Destination');
  const origin_lat = routeDetails?.origin_lat ?? (params.origin_lat ? Number(params.origin_lat) : 0);
  const origin_lon = routeDetails?.origin_lon ?? (params.origin_lon ? Number(params.origin_lon) : 0);
  const destination_lat =
    routeDetails?.destination_lat ?? (params.destination_lat ? Number(params.destination_lat) : 0);
  const destination_lon =
    routeDetails?.destination_lon ?? (params.destination_lon ? Number(params.destination_lon) : 0);

  // Fetch old posts from the API when the component mounts.
  useEffect(() => {
    async function fetchOldPosts() {
      try {
        const response = await fetch('https://comgu20-production.up.railway.app/api/route_posts');
        if (!response.ok) {
          console.error('Error fetching posts:', response.status);
          return;
        }
        const data = await response.json();
        // Reverse the array so that addPost (which prepends) maintains the API’s descending order
        data.reverse().forEach((post: any) => {
          // Transform API fields to match your Post type
          const transformedPost: Post = {
            ...post,
            destination_lat: post.dest_lat,
            destination_lon: post.dest_lon,
            // If API response is missing these fields, fallback to our current values
            location: post.location || location,
            destination: post.destination || destination,
          };
          addPost(transformedPost, 'postsuggestions');
        });
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }
    fetchOldPosts();
  }, []);

  // Handle post submission
  const handlePostSubmit = (formData: { content: string }) => {
    const newPost = {
      ...formData,
      location,
      destination,
      origin_lat,
      origin_lon,
      destination_lat,
      destination_lon,
    };
    addPost(newPost, 'postsuggestions');
    setModalVisible(false);
  };

  // Navigate to Route Finder if needed.
  const handleGoToRouteFinder = () => {
    router.push('/route');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Community Page</Text>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Create Post</Text>
      </TouchableOpacity>

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

      <View style={styles.postsContainer}>
        {posts.map((post, index) => (
          <View key={`${post.id}-${index}`} style={styles.postContainer}>
            <Text style={styles.postContent}>Content: {post.content}</Text>
            <Text style={styles.postLocation}>From: {post.location}</Text>
            <Text style={styles.postDestination}>To: {post.destination}</Text>
            {post.user && (
              <Text style={styles.postUser}>
                User: {post.user.firstname} {post.user.lastname} ({post.user.username})
              </Text>
            )}
            <Text style={styles.postVotes}>Votes: {post.votes ?? 0}</Text>
            <Text style={styles.postDate}>Created at: {post.created_at}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  postsContainer: {
    marginTop: 24,
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  postContent: {
    fontSize: 16,
    marginBottom: 4,
  },
  postLocation: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  postDestination: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  postUser: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  postVotes: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  postDate: {
    fontSize: 12,
    color: '#888',
  },
});