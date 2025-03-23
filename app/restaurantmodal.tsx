import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  restaurants: Array<{
    name: string;
    latitude: number;
    longitude: number;
    cuisine?: string;
    image_url?: string;
    address?: string;
    opening_hours?: string;
  }>;
}

const ModalComponent: React.FC<ModalProps> = ({
  visible,
  onClose,
  restaurants, // Receive restaurants directly
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Filter restaurants based on the selected category using the cuisine property.
  const filteredSpots = selectedCategory
    ? restaurants.filter(
        (spot) =>
          (spot.cuisine || "Not specified").toLowerCase() ===
          selectedCategory.toLowerCase()
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
                        Cuisine: {spot.cuisine || "Not specified"}
                      </Text>
                    </View>
                  </View>

                  {/* Middle Row: Two Columns */}
                  <View style={styles.middleRow}>
                    {/* Left Column */}
                    <View style={styles.leftColumn}>
                      <Text style={styles.sectionTitle}>
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color="#44457D"
                        />{" "}
                        Address
                      </Text>
                      <Text style={styles.sectionValue}>
                        {spot.address || "No address provided"}
                      </Text>

                      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                        <Ionicons
                          name="information-circle-outline"
                          size={16}
                          color="#44457D"
                        />{" "}
                        Details
                      </Text>
                      <Text style={styles.sectionValue}>
                        Opening Hours: {spot.opening_hours || "Not available"}
                      </Text>
                    </View>

                    {/* Right Column */}
                    <View style={styles.rightColumn}>
                      {/* Placeholder for additional details or actions */}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.directionsButton}>
                      <Text style={styles.directionsButtonText}>
                        Get Directions
                      </Text>
                    </TouchableOpacity>
                  </View>
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
    marginLeft: 10,
    alignSelf: "flex-start",
  },
  amenityText: {
    fontSize: 11,
    color: "#44457D",
  },
  middleRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  leftColumn: {
    flex: 1,
    marginRight: 10,
  },
  rightColumn: {
    flex: 1,
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
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#1751b3",
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  directionsButton: {
    flex: 1,
    backgroundColor: "#197814",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  directionsButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
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
});
