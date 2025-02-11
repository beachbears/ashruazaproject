import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

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
  timestamp?: number;
  vehicles: VehicleType[];
}

const vehicleIcons: Record<VehicleType, JSX.Element> = {
  "Jeep": <MaterialCommunityIcons name="jeepney" size={24} color="#4F46E5" />,
  "E-jeep": <FontAwesome5 name="bus" size={20} color="#4F46E5" />,
  "Bus": <FontAwesome5 name="bus-alt" size={22} color="#4F46E5" />,
  "UV Exp.": <FontAwesome5 name="car" size={22} color="#4F46E5" />,
};

const RouteUserScreen: React.FC<{ post: PostItem; onBack: () => void }> = ({ post, onBack }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.userDetails}>
        <View style={styles.circle}>
          <Text style={styles.userinitial}>{post.userinitial}</Text>
        </View>
        <View>
          <Text style={styles.username}>{post.loginusername}</Text>
          <Text style={styles.email}>{post.username}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Location: {post.location}</Text>
        <Text style={styles.label}>Destination: {post.destination}</Text>
        <Text style={styles.label}>Fare: {post.fare}</Text>
        <Text style={styles.label}>Description: {post.description}</Text>
        <Text style={styles.label}>Your Experience: {post.suggestiontextbox}</Text>
      </View>

      <Text style={styles.label}>Vehicles:</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  backButton: { padding: 10, alignSelf: 'flex-start' },
  backText: { fontSize: 16, color: '#007bff' },
  userDetails: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  userinitial: { fontSize: 16, fontWeight: 'bold', color: '#6366F1' },
  username: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#6B7280' },
  detailsContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  vehiclesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  vehicleItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, backgroundColor: '#F3F4F6', padding: 8, borderRadius: 5 },
  vehicleText: { marginLeft: 5, fontSize: 16, color: '#333' },
});

export default RouteUserScreen;
