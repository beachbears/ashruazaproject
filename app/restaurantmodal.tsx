import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Image,
  Linking,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Placeholder image
const placeholderImage = "https://via.placeholder.com/150";
const formatCuisine = (cuisine: string | undefined) => {
  if (!cuisine) return "Not specified";
  return cuisine
    .split(/[_;]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(', ');
};
interface Restaurant {
  name: string;
  latitude: number;
  longitude: number;
  cuisine?: string;
  address?: string;
  opening_hours?: string;
  amenity?: string;
  phone?: string;
  website?: string;
  image_url?: string;
  distance?: number; // Added distance in km from API
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  onView?: (restaurant: { latitude: number; longitude: number; name: string }) => void;
  onGoHere?: (restaurant: Restaurant) => void;
}

const ModalComponent: React.FC<ModalProps> = ({
  visible,
  onClose,
  restaurants,
  onView,
  onGoHere,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showCategories, setShowCategories] = useState(false);

  // Handle website and phone linking
  const handleWebsitePress = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
    });
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const categories = [
    "All",
    "Restaurant",
    "Cafe",
    "Fast Food",
    "Pub",
    "Bar",
    "Ice Cream",
    "Food Court",
    "Biergarten",
  ];

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setShowCategories(false);
  };

  const filteredSpots = selectedCategory === "All"
    ? restaurants
    : restaurants.filter(
      (spot) => spot.amenity?.toLowerCase() === selectedCategory.toLowerCase()
    );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nearby Dining Spots</Text>

          {/* Category Dropdown */}
          <View style={styles.controlsContainer}>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategories(!showCategories)}
              >
                <Ionicons
                  name={showCategories ? "chevron-up-outline" : "chevron-down-outline"}
                  size={16}
                  color="#6366F1"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.dropdownButtonText}>
                  {selectedCategory}
                </Text>
              </TouchableOpacity>
              {showCategories && (
                <View style={[styles.dropdownOverlay, { zIndex: 10001 }]}>
                  <ScrollView style={{ maxHeight: 160 }}>
                    {categories.map((cat, index) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                          onPress={() => handleSelectCategory(cat)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              isSelected && styles.dropdownItemTextSelected,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Restaurant List */}
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }} style={styles.scrollArea}>
            {filteredSpots.length > 0 ? (
              filteredSpots.map((spot, idx) => (
                <View key={idx} style={styles.spotCard}>
                  {onView && (
                    <View style={styles.restaurantHeader}>
                      <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>{spot.name}</Text>
                        <Text style={styles.restaurantCuisine}>
                          {formatCuisine(spot.cuisine)}
                        </Text>
                        {spot.distance !== undefined && (
                          <Text style={styles.distanceText}>
                            {spot.distance.toFixed(2)} km away
                          </Text>
                        )}
                      </View>
                      <View style={styles.buttonGroup}>
                        <TouchableOpacity
                          style={styles.viewButton}
                          onPress={() =>
                            onView({
                              latitude: spot.latitude,
                              longitude: spot.longitude,
                              name: spot.name,
                            })
                          }
                        >
                          <Text style={styles.viewButtonText}>View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.goHereButton}
                          onPress={() => onGoHere?.(spot)}
                        >
                          <Text style={styles.goHereButtonText}>Go Here</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Detailed Information */}
                  <View style={styles.detailsContainer}>
                    {!onView && (
                      <>
                        <Text style={styles.spotName}>{spot.name}</Text>
                        {spot.distance !== undefined && (
                          <Text style={styles.distanceText}>
                            {spot.distance.toFixed(2)} km away
                          </Text>
                        )}
                      </>
                    )}
                    <View style={styles.amenityPill}>
                      <Text style={styles.amenityText}>
                        {spot.amenity ? spot.amenity.charAt(0).toUpperCase() + spot.amenity.slice(1) : "Unknown"}
                      </Text>
                    </View>
                    {spot.address && (
                      <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color="#44457D" />
                        <Text style={styles.sectionValue}>{spot.address}</Text>
                      </View>
                    )}
                    {spot.cuisine && (
                      <View style={styles.infoRow}>
                        <Ionicons name="restaurant-outline" size={16} color="#44457D" />
                        <Text style={styles.sectionValue}>{spot.cuisine}</Text>
                      </View>
                    )}
                    {spot.opening_hours && (
                      <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color="#44457D" />
                        <Text style={styles.sectionValue}>
                          {spot.opening_hours === "Hours not specified"
                            ? "Not available"
                            : spot.opening_hours}
                        </Text>
                      </View>
                    )}
                    {(spot.phone || spot.website) && (
                      <View style={styles.contactSection}>
                        <Text style={styles.sectionTitle}>
                          <Ionicons name="call-outline" size={16} color="#44457D" /> Contact
                        </Text>
                        {spot.phone && (
                          <TouchableOpacity
                            onPress={() => spot.phone && handlePhonePress(spot.phone)} // Type guard ensures spot.phone is string
                          >
                            <Text style={styles.websiteText}>{spot.phone}</Text>
                          </TouchableOpacity>
                        )}
                        {spot.website && (
                          <TouchableOpacity
                            onPress={() => spot.website && handleWebsitePress(spot.website)} // Type guard ensures spot.website is string
                          >
                            <Text style={styles.websiteText}>Visit Website</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noResultsText}>No dining spots found.</Text>
            )}
          </ScrollView>

          {/* Close Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalComponent;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    minHeight: 500,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10,
    color: "#1F2937",
  },
  controlsContainer: {
    marginBottom: 10,
  },
  dropdownContainer: {
    alignSelf: "flex-start",
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E7FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  dropdownButtonText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "bold",
  },
  dropdownOverlay: {
    position: "absolute",
    top: 40,
    left: 0,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    width: 200,
    maxHeight: 200,
    paddingVertical: 5,
    ...Platform.select({ android: { elevation: 10000 } }),
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  dropdownItemSelected: {
    backgroundColor: "#6366F1",
  },
  dropdownItemText: {
    fontSize: 12,
    color: "#374151",
  },
  dropdownItemTextSelected: {
    color: "#fff",
  },
  scrollArea: {
    maxHeight: 400,
  },
  spotCard: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  restaurantCuisine: {
    fontSize: 12,
    color: "#6B7280",
  },
  distanceText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  viewButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  viewButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  goHereButton: {
    backgroundColor: "#10B981",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  goHereButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  detailsContainer: {
    marginTop: 8,
  },
  spotName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  amenityPill: {
    backgroundColor: "#E0E7FF",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 11,
    color: "#44457D",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#44457D",
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 12,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  contactSection: {
    marginTop: 8,
  },
  websiteText: {
    color: "#6366F1",
    textDecorationLine: "underline",
    fontSize: 12,
    marginTop: 4,
  },
  noResultsText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  closeButtonText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "bold",
  },
});