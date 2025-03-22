import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Details {
  Cuisine?: string;
  Brand?: string;
  Operator?: string;
}

interface Spot {
  name: string;
  alsoKnown?: string;
  amenity: string;
  address: string;
  opening_hours: string;
  payment_methods: string;
  details?: Details;
  features?: string[];
}

const ModalComponent: React.FC<ModalProps> = ({ visible, onClose }) => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For the category dropdown
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setTimeout(() => {
        const dummyData: Spot[] = [
          {
            name: "Dunkin'",
            alsoKnown: "Also known as: Dunkin' Donuts",
            amenity: "Fast food",
            address: "Zabarte Road",
            opening_hours: "24/7",
            payment_methods: "No payment methods specified",
            details: {
              Cuisine: "Donut, Coffee shop",
              Brand: "Dunkin' (Wikidata: Q847743)",
              Operator: "No data",
            },
            features: ["Takeaway", "Drive-Through"],
          },
        ];
        setSpots(dummyData);
        setLoading(false);
      }, 500);
    }
  }, [visible]);

  // Uncomment and adjust this function if you later use real API data
  // const fetchData = async () => {
  //   try {
  //     setError(null);
  //     const response = await fetch("YOUR_API_ENDPOINT");
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch data");
  //     }
  //     const data = await response.json();
  //     setSpots(data);
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setShowCategories(false);
    // Optional: trigger filtering or re-fetch logic based on category.
  };

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
                name={showCategories ? "chevron-up-outline" : "chevron-down-outline"}
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
              </View>
            )}
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }} style={styles.scrollArea}>
            {loading ? (
              <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
            ) : error ? (
              <Text style={{ color: "red", marginTop: 20 }}>{error}</Text>
            ) : (
              spots.map((spot, idx) => (
                <View key={idx} style={styles.spotCard}>
                  {/* Top Row */}
                  <View style={styles.topRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.spotName}>{spot.name}</Text>
                      {spot.alsoKnown && (
                        <Text style={styles.alsoKnown}>{spot.alsoKnown}</Text>
                      )}
                    </View>
                    <View style={styles.amenityPill}>
                      <Text style={styles.amenityText}>
                        Amenity: {spot.amenity}
                      </Text>
                    </View>
                  </View>

                  {/* Middle Row: Two Columns */}
                  <View style={styles.middleRow}>
                    {/* Left Column */}
                    <View style={styles.leftColumn}>
                      <Text style={styles.sectionTitle}>
                        <Ionicons name="location-outline" size={16} color="#44457D" /> Address
                      </Text>
                      <Text style={styles.sectionValue}>{spot.address}</Text>

                      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                        <Ionicons name="information-circle-outline" size={16} color="#44457D" />{" "}
                        Details
                      </Text>
                      <Text style={styles.sectionValue}>
                        Cuisine: {spot.details?.Cuisine}
                      </Text>
                      <Text style={styles.sectionValue}>
                        Brand: {spot.details?.Brand}
                      </Text>
                      <Text style={styles.sectionValue}>
                        Operator: {spot.details?.Operator}
                      </Text>
                    </View>

                    {/* Right Column */}
                    <View style={styles.rightColumn}>
                      <Text style={styles.sectionTitle}>
                        <Ionicons name="time-outline" size={16} color="#44457D" /> Opening Hours
                      </Text>
                      <Text style={styles.sectionValue}>{spot.opening_hours}</Text>

                      <Text style={[styles.sectionValue, { marginTop: 10 }]}>
                        {spot.payment_methods}
                      </Text>
                    </View>
                  </View>

                  {/* Features */}
                  {spot.features && spot.features.length > 0 && (
                    <View style={styles.featuresContainer}>
                      <Text style={styles.sectionTitle}>
                        <Ionicons name="star-outline" size={16} color="#44457D" /> Features
                      </Text>
                      <View style={styles.featuresRow}>
                        {spot.features.map((feature, fidx) => (
                          <View key={fidx} style={styles.featureTag}>
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.directionsButton}>
                      <Text style={styles.directionsButtonText}>Get Directions</Text>
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
  alsoKnown: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
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
  featuresContainer: {
    marginTop: 12,
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  featureTag: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featureText: {
    color: "#6366F1",
    fontSize: 11,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#E0E7FF",
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  directionsButton: {
    flex: 1,
    backgroundColor: "#E0E7FF",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "bold",
  },
  directionsButtonText: {
    color: "#6366F1",
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
