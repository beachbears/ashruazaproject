import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList } from 'react-native';
import ModalComponent from './postmodal';
import RouteUserScreen from './routeuser';

// Define VehicleType to match RouteUserScreen
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
  vehicles: VehicleType[]; // Ensure vehicles match the expected type
}

const RouteDropdown = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  const handleSubmitPost = (newPost: PostItem) => {
    // Ensure vehicles match the allowed values
    const validatedVehicles: VehicleType[] = newPost.vehicles.filter((v) =>
      ["Jeep", "E-jeep", "Bus", "UV Exp."].includes(v)
    ) as VehicleType[];

    setPosts([...posts, { ...newPost, vehicles: validatedVehicles }]);
    setModalVisible(false);
  };

  const handleSelectPost = (post: PostItem) => setSelectedPost(post);
  const handleGoBack = () => setSelectedPost(null);

  if (selectedPost) {
    return <RouteUserScreen post={selectedPost} onBack={handleGoBack} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOpenModal} style={styles.addButton}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postContainer}
            onPress={() => handleSelectPost(item)}
          >
            <Text style={styles.postTitle}>{item.username} ({item.userinitial})</Text>
            <Text style={styles.postDescription}>📍 {item.location} → {item.destination}</Text>
            <Text style={styles.postDescription}>💰 Fare: ₱{item.fare.toFixed(2)}</Text>
            <Text style={styles.postDescription}>🚗 Vehicles: {item.vehicles.join(', ')}</Text>
            <Text style={styles.postDescription}>📝 {item.description}</Text>
            <Text style={styles.postSuggestion}>💡 {item.suggestiontextbox}</Text>
            <Text style={styles.postTimestamp}>⏳ {new Date(item.timestamp).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />

      <ModalComponent 
        visible={isModalVisible} 
        onClose={handleCloseModal} 
        onSubmit={handleSubmitPost} 
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addButton: { backgroundColor: '#4F46E5', padding: 12, borderRadius: 5, alignSelf: 'center', marginBottom: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  postContainer: { backgroundColor: '#f5f5f5', padding: 12, marginVertical: 5, borderRadius: 5 },
  postTitle: { fontSize: 16, fontWeight: 'bold' },
  postDescription: { fontSize: 14, color: '#555' },
  postSuggestion: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  postTimestamp: { fontSize: 10, color: '#999', marginTop: 5, textAlign: 'right' }
});

export default RouteDropdown;
