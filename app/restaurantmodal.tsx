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

// A placeholder image if restaurant.image_url is not provided.
const placeholderImage = "https://via.placeholder.com/150";

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
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  onView?: (restaurant: {
    latitude: number;
    longitude: number;
    name: string;
  }) => void;
  // New prop added here
  onGoHere?: (restaurant: Restaurant) => void;
  // Optional user location for distance calculation
  userLocation?: UserLocation;
}

const ModalComponent: React.FC<ModalProps> = ({
  visible,
  onClose,
  restaurants,
  onView,
  onGoHere,
  userLocation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Replace sort dropdown state with selectedSortOption only.
  const [selectedSortOption, setSelectedSortOption] =
    useState<string>("Nearest");

  // Function to open website URLs
  const handleWebsitePress = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
    });
  };

  // Function to handle phone number press
  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // List of categories
  const categories = [
    "Restaurant",
    "Cafe",
    "Fast Food",
    "Pub",
    "Bar",
    "Ice Cream",
    "Food Court",
    "Biergarten",
  ];

  // Category selection handler
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setShowCategories(false);
  };

  // Function to calculate distance between two coordinates using the haversine formula.
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Filter spots based on selected category (if provided)
  let filteredSpots = selectedCategory
    ? restaurants.filter(
      (spot) => spot.amenity?.toLowerCase() === selectedCategory.toLowerCase()
    )
    : restaurants;

  // Sort the filtered spots based on selected sort option if userLocation is provided.
  if (userLocation && selectedSortOption) {
    filteredSpots = filteredSpots.slice().sort((a, b) => {
      const distA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.latitude,
        a.longitude
      );
      const distB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.latitude,
        b.longitude
      );
      return selectedSortOption === "Nearest" ? distA - distB : distB - distA;
    });
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nearby Restaurant</Text>

          {/* Controls Container: Category dropdown and Sort toggle side by side */}
          <View style={styles.controlsContainer}>
            {/* Category Dropdown */}
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategories(!showCategories)}
              >
                <Ionicons
                  name={
                    showCategories
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={16}
                  color="#6366F1"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.dropdownButtonText}>
                  {selectedCategory ? selectedCategory : "Select Category"}
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
                          style={[
                            styles.dropdownItem,
                            isSelected && styles.dropdownItemSelected,
                          ]}
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

            {/* Sort Toggle Container */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedSortOption === "Nearest" && styles.toggleButtonActive,
                ]}
                onPress={() => setSelectedSortOption("Nearest")}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedSortOption === "Nearest" &&
                    styles.toggleButtonTextActive,
                  ]}
                >
                  Nearest
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedSortOption === "Furthest" &&
                  styles.toggleButtonActive,
                ]}
                onPress={() => setSelectedSortOption("Furthest")}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedSortOption === "Furthest" &&
                    styles.toggleButtonTextActive,
                  ]}
                >
                  Furthest
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Restaurant List */}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            style={[styles.scrollArea, { maxHeight: 300 }]}
          >
            {error ? (
              <Text style={{ color: "red", marginTop: 20 }}>{error}</Text>
            ) : (
              filteredSpots.map((spot, idx) => (
                <View key={idx} style={styles.spotCard}>
                  {/* New header section when onView prop is provided */}
                  {onView && (
                    <View style={styles.restaurantItem}>
                      <Image
                        source={{ uri: spot.image_url || placeholderImage }}
                        style={styles.restaurantImage}
                      />
                      <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>{spot.name}</Text>
                        <Text style={styles.restaurantCuisine}>
                          {spot.cuisine || "Not specified"}
                        </Text>
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
                        {/* Add Go Here button */}
                        <TouchableOpacity
                          style={styles.goHereButton}
                          onPress={() => onGoHere?.(spot)}
                        >
                          <Text style={styles.goHereButtonText}>Go Here</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Original Details */}
                  <View style={styles.topRow}>
                    <View style={{ flex: 1 }}>
                      {!onView && (
                        <Text style={styles.spotName}>{spot.name}</Text>
                      )}
                    </View>
                    <View style={styles.amenityPill}>
                      <Text style={styles.amenityText}>
                        {spot.amenity || "Restaurant"}
                      </Text>
                    </View>
                  </View>

                  {spot.address && (
                    <>
                      <Text style={styles.sectionTitle}>
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color="#44457D"
                        />{" "}
                        Address
                      </Text>
                      <Text style={styles.sectionValue}>{spot.address}</Text>
                    </>
                  )}

                  <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                    <Ionicons
                      name="restaurant-outline"
                      size={16}
                      color="#44457D"
                    />{" "}
                    Cuisine
                  </Text>
                  <Text style={styles.sectionValue}>
                    {spot.cuisine || "Not specified"}
                  </Text>

                  <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                    <Ionicons name="call-outline" size={16} color="#44457D" />{" "}
                    Contact
                  </Text>
                  <Text style={styles.sectionValue}>
                    Phone:{" "}
                    {spot.phone ? (
                      <TouchableOpacity
                        onPress={() =>
                          spot.phone && handlePhonePress(spot.phone)
                        }
                      >
                        <Text style={styles.websiteText}>{spot.phone}</Text>
                      </TouchableOpacity>
                    ) : (
                      "Not available"
                    )}
                  </Text>
                  {spot.website && (
                    <TouchableOpacity
                      onPress={() =>
                        spot.website && handleWebsitePress(spot.website)
                      }
                      style={{ marginTop: 4 }}
                    >
                      <Text style={styles.websiteText}>Visit Website</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                    <Ionicons name="time-outline" size={16} color="#44457D" />{" "}
                    Hours
                  </Text>
                  <Text style={styles.sectionValue}>
                    {spot.opening_hours === "Hours not specified"
                      ? "Opening hours not available"
                      : spot.opening_hours}
                  </Text>
                </View>
              ))
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
  /********** BACKDROP **********/
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  /********** CONTAINER **********/
  modalContainer: {
    width: "95%",
    minHeight: 500,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    overflow: "visible",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  /********** DROPDOWN **********/
  dropdownContainer: {
    marginBottom: 10,
    alignSelf: "flex-start",
    position: "relative",
    flex: 1,
    marginRight: 8,
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
    flexShrink: 1,
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
    ...Platform.select({
      android: { elevation: 10000 },
    }),
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  dropdownItemSelected: {
    backgroundColor: "#6366F1",
    borderBottomColor: "#6366F1",
  },
  dropdownItemText: {
    fontSize: 12,
    color: "#374151",
    flexWrap: "wrap",
  },
  dropdownItemTextSelected: {
    color: "#fff",
  },

  /********** TOGGLE BUTTONS **********/
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#E0E7FF",
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: "#6366F1",
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6366F1",
  },
  toggleButtonTextActive: {
    color: "#fff",
  },

  /********** SCROLL AREA **********/
  scrollArea: {
    zIndex: 0,
  },

  /********** SPOT CARD **********/
  spotCard: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  spotName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  amenityPill: {
    backgroundColor: "#E0E7FF",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "center",
  },
  amenityText: {
    fontSize: 11,
    color: "#44457D",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#44457D",
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 2,
    lineHeight: 18,
    minHeight: 18,
  },
  websiteText: {
    color: "#6366F1",
    textDecorationLine: "underline",
    fontSize: 12,
  },

  /********** FOOTER **********/
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

  /********** UPDATED STYLES FOR VIEW MODE **********/
  restaurantItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
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
    fontWeight: "500",
    color: "#333",
  },
  restaurantCuisine: {
    color: "#666",
    fontSize: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
    marginLeft: "auto",
    alignItems: "center",
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
});
