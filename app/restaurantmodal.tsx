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
  amenity?: string;
  cuisine?: string;
  address?: string;
  opening_hours?: string;
  phone?: string;
  website?: string;
  image_url?: string;
  distance?: number;
  brand?: string;
  takeaway?: string;
  delivery?: string;
  payment?: string;
  wheelchair?: string;
  facebook?: string;
  email?: string;
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
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [showCategories, setShowCategories] = useState(false);
  // Payment processing helper
  const getAcceptedPaymentMethods = (paymentData: string): string => {
    try {
      // Parse the JSON string into an object
      const paymentObj = JSON.parse(paymentData);
      // Extract methods where the value is "yes" or "only"
      const accepted = Object.entries(paymentObj)
        .filter(([key, value]) =>
          value && ["yes", "only"].includes(value.toString().toLowerCase())
        )
        .map(([key]) => key.replace(/^payment:/, "")); // Remove the "payment:" prefix
      return accepted.join(", ");
    } catch (error) {
      console.error("Error parsing payment data:", error);
      return "";
    }
  };


  // Handle website and phone linking
  const handleWebsitePress = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
    });
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };
  type Category =
    | "All"
    | "Restaurant"
    | "Cafe"
    | "Fast Food"
    | "Pub"
    | "Bar"
    | "Ice Cream"
    | "Food Court"
    | "Biergarten";

  const categoryMapping: Record<Category, string> = {
    "All": "all",
    "Restaurant": "restaurant",
    "Cafe": "cafe",
    "Fast Food": "fast_food",
    "Pub": "pub",
    "Bar": "bar",
    "Ice Cream": "ice_cream",
    "Food Court": "food_court",
    "Biergarten": "biergarten"
  };

  const categories: Category[] = [
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


  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setShowCategories(false);
  };

  const filteredSpots = selectedCategory === "All"
    ? restaurants // Return all items if "All" is selected
    : restaurants.filter(
      (spot) => spot.amenity?.toLowerCase() === categoryMapping[selectedCategory].toLowerCase()
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
                  {/* Header with Image, Name, Cuisine, Distance, and Buttons */}
                  {onView && (
                    <View style={styles.restaurantHeader}>
                      {/* <Image
                        source={{ uri: spot.image_url || placeholderImage }}
                        style={styles.restaurantImage}
                      /> */}
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
                        {spot.amenity
                          ? spot.amenity.charAt(0).toUpperCase() + spot.amenity.slice(1)
                          : "Unknown"}
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
                        <Text style={styles.sectionValue}>{formatCuisine(spot.cuisine)}</Text>
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
                    {/* New Fields */}
                    {spot.brand && (
                      <View style={styles.infoRow}>
                        <Ionicons name="business-outline" size={16} color="#44457D" />
                        <Text style={styles.sectionValue}>Brand: {spot.brand}</Text>
                      </View>
                    )}
                    {spot.takeaway !== null && spot.takeaway !== undefined && (
                      <View style={styles.infoRow}>
                        <Ionicons name="bag-handle-outline" size={16} color="#44457D" />
                        <Text style={styles.sectionValue}>
                          Takeaway: {spot.takeaway ? "Yes" : "No"}
                        </Text>
                      </View>
                    )}
                    {spot.delivery && (
                      <View style={styles.infoRow}>
                        <Ionicons name="bicycle-outline" size={16} color="#44457D" />
                        <Text style={styles.sectionValue}>Delivery: {spot.delivery}</Text>
                      </View>
                    )}
                    {spot.payment && spot.payment !== "{}" && (
                      <View style={styles.infoRow}>
                        <Ionicons name="card-outline" size={16} color="#44457D" />
                        <Text style={styles.sectionValue}>
                          Payment: {getAcceptedPaymentMethods(spot.payment) || "Not specified"}
                        </Text>
                      </View>
                    )}
                    {spot.wheelchair && (
                      <View style={styles.infoRow}>
                        <Ionicons name="accessibility-outline" size={16} color="#44457D" />
                        <Text style={styles.sectionValue}>Wheelchair: {spot.wheelchair}</Text>
                      </View>
                    )}
                    {/* Enhanced Contact Section */}
                    {(spot.phone || spot.website || spot.facebook || spot.email) && (
                      <View style={styles.contactSection}>
                        <Text style={styles.sectionTitle}>
                          <Ionicons name="call-outline" size={16} color="#44457D" /> Contact
                        </Text>
                        {spot.phone && (
                          <TouchableOpacity
                            onPress={() => spot.phone && handlePhonePress(spot.phone)}
                          >
                            <Text style={styles.websiteText}>{spot.phone}</Text>
                          </TouchableOpacity>
                        )}
                        {spot.website && (
                          <TouchableOpacity
                            onPress={() => spot.website && handleWebsitePress(spot.website)}
                          >
                            <Text style={styles.websiteText}>Visit Website</Text>
                          </TouchableOpacity>
                        )}
                        {spot.facebook && (
                          <TouchableOpacity
                            onPress={() => spot.facebook && handleWebsitePress(spot.facebook)}
                          >
                            <Text style={styles.websiteText}>Facebook</Text>
                          </TouchableOpacity>
                        )}
                        {spot.email && (
                          <TouchableOpacity
                            onPress={() => Linking.openURL(`mailto:${spot.email}`)}
                          >
                            <Text style={styles.websiteText}>{spot.email}</Text>
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