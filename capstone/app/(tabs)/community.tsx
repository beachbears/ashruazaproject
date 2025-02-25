import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { usePostContext } from '../PostContext';
import PostModal from '../postmodal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const VEHICLE_TYPES: VehicleType[] = ["Jeep", "E-jeep", "Bus", "UV Exp.", "Train"];
type VehicleType = "Jeep" | "E-jeep" | "Bus" | "UV Exp." | "Train";


interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (post: Post) => void;
}

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

const vehicleIcons: Record<VehicleType, JSX.Element> = {
  "Jeep": <MaterialCommunityIcons name="jeepney" size={24} color="#4F46E5" />,
  "E-jeep": <FontAwesome5 name="bus" size={20} color="#4F46E5" />,
  "Bus": <FontAwesome5 name="bus-alt" size={22} color="#4F46E5" />,
  "UV Exp.": <FontAwesome5 name="car" size={22} color="#4F46E5" />,
  "Train": <FontAwesome6 name="train-subway" size={24} color="#4F46E5" />
};

export default function Community() {
  const { posts, addPost } = usePostContext(); // Access posts and addPost function
  const [modalVisible, setModalVisible] = useState(false);

  // Function to submit post from Community
  const handlePostSubmit = (newPost: Post) => {
    addPost(newPost, 'community'); // Save the post in 'community'
    setModalVisible(false);
  };

  return (
    <View>
      <Text>Community Page</Text>

      {/* Display ALL submitted posts */}
      {posts.map((post, index) => (
        <View key={index} style={{ padding: 10, backgroundColor: '#ddd', marginBottom: 5 }}>
          <Text>{post.location} ➝ {post.destination}</Text>
          <Text>Fare: ₱{post.fare}</Text>
          <Text>Description: {post.description}</Text>
            <View style={styles.vehiclesContainer}>
                         {post.vehicles?.length > 0 ? (
                           post.vehicles.map((vehicle, index) => (
                             <View key={index} style={styles.vehicleItem}>
                               {vehicleIcons[vehicle]}
                               <Text style={styles.vehicleText}>{vehicle}</Text>
                             </View>
                           ))
                         ) : (
                           <Text style={styles.vehicleText}>No vehicles selected</Text>
                         )}
                       </View>
        </View>
      ))}

      {/* Button to open modal */}
      <Button title="Create Post" onPress={() => setModalVisible(true)} />

      {/* Post Modal */}
      <PostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handlePostSubmit} // Ensures new posts are added to 'community'
      />
    </View>
  );
}

const styles = StyleSheet.create({
vehiclesContainer: {  flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#EEF2FF', borderRadius: 8, padding: 4, marginTop:10},
vehicleItem: { alignItems: 'center', marginTop: 4},
vehicleText: {fontSize: 11, color: '#44457D', marginVertical: 4,},
});
