import React, { useState } from "react";
import { Linking } from "react-native"; // Added as requested

import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Linking as RNLinking,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  restaurants: Array<{
    name: string;
    latitude: number;
    longitude: number;
    cuisine: string;
    address: string;
    opening_hours: string;
    amenity: string;
    phone?: string;
    website?: string;
    image_url?: string;
  }>;
}

const ModalComponent: React.FC<ModalProps> = ({
  visible,
  onClose,
  restaurants,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Update the filtered spots to handle all required fields
  const filteredSpots = selectedCategory
    ? restaurants.filter(
        (spot) => spot.amenity?.toLowerCase() === selectedCategory.toLowerCase()
      )
    : restaurants;

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

          {/* Dropdown Container */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategories(!showCategories)}
            >
              <Ionicons
                name={
                  showCategories ? "chevron-up-outline" : "chevron-down-outline"
                }
                size={16}
                color="#6366F1"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.dropdownButtonText}>
                {selectedCategory ? selectedCategory : "Select Category"}
              </Text>
            </TouchableOpacity>

            {/* Dropdown Overlay */}
            {showCategories && (
              <View style={styles.dropdownOverlay}>
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
                  {/* Top Row */}
                  <View style={styles.topRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.spotName}>{spot.name}</Text>
                    </View>
                    <View style={styles.amenityPill}>
                      <Text style={styles.amenityText}>
                        {spot.amenity || "Restaurant"}
                      </Text>
                    </View>
                  </View>

                  {/* Address */}
                  <Text style={styles.sectionTitle}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#44457D"
                    />{" "}
                    Address
                  </Text>
                  <Text style={styles.sectionValue}>{spot.address}</Text>

                  {/* Cuisine */}
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

                  {/* Contact Section */}
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

                  {/* Hours */}
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
    overflow: "visible", // allow overlay to show
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10,
  },

  /********** DROPDOWN **********/
  dropdownContainer: {
    marginBottom: 10,
    alignSelf: "flex-start",
    position: "relative",
    zIndex: 1000,
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
    zIndex: 10000,
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

  // New styles added
  cuisinePill: {
    backgroundColor: "#E0E7FF",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
