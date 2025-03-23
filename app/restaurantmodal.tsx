import React, { useState, useEffect, useRef } from "react";
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
  latitude: number;
  longitude: number;
}

interface Details {
  Cuisine?: string;
  Brand?: string;
  Operator?: string;
}

export interface Spot {
  name: string;
  alsoKnown?: string;
  amenity: string;
  address: string;
  opening_hours: string;
  payment_methods: string;
  details?: Details;
  features?: string[];
  // Coordinates extracted dynamically from API response
  latitude: number;
  longitude: number;
}

const ModalComponent: React.FC<ModalProps> = ({ visible, onClose, latitude, longitude }) => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For the category dropdown
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // For dropdown position
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const dropdownRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);


  // List of categories kasama ang "All"
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

  useEffect(() => {
    if (visible) {
      setLoading(true);
      const radius = 5; // in kilometers
      const amenities = ["cafe", "restaurant", "fast food", "pub", "bar", "ice cream", "food court", "biergarten"].join(",");
      const page = 1;
      const perPage = 20;
      const url = `https://comgu20-production.up.railway.app/api/sustenance?lat=${latitude}&lon=${longitude}&radius=${radius}&sort=nearest&amenity=${amenities}&page=${page}&per_page=${perPage}`;

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Sample API item:", data.results[0]);
          const mappedData: Spot[] = data.results.map((item: any) => ({
            name: item.name,
            address: item.address.full_address,
            amenity: item.amenity,
            opening_hours: item.metadata.opening_hours || "Not available",
            payment_methods: item.payment_methods || "",
            details: {
              Cuisine: item.metadata.cuisine || "Not specified",
              Brand: item.metadata.contact?.website || "Not specified",
              Operator: item.metadata.contact?.phone || "Not specified",
            },
            features: item.features || [],
            latitude: item.coordinates?.lat,
            longitude: item.coordinates?.lon,
          }));
          console.log("Mapped spots:", mappedData);
          setSpots(mappedData);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [visible, latitude, longitude]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setShowCategories(false);
  };

  // Kung napili ang "All", ipapakita lahat
  const filteredSpots =
    selectedCategory === "All"
      ? spots
      : spots.filter(
          (spot) =>
            spot.amenity.toLowerCase() === selectedCategory?.toLowerCase()
        );

  // Makukuha ang posisyon ng dropdown button
  const onDropdownLayout = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measure((fx: any, fy: any, width: any, height: any, px: any, py: any) => {
        setDropdownPosition({ x: px, y: py, width, height });
      });
    }
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
              ref={dropdownRef}
              onLayout={onDropdownLayout}
              style={styles.dropdownButton}
              onPress={() => setShowCategories(true)}
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
          </View>

          {/* Parent Scrollable Spot List */}
          <ScrollView 
            contentContainerStyle={{ paddingBottom: 20 }} 
            style={[styles.scrollArea, { maxHeight: 300 }]}
            scrollEnabled={!showCategories}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
            ) : error ? (
              <Text style={{ color: "red", marginTop: 20 }}>{error}</Text>
            ) : (
              filteredSpots.map((spot, idx) => (
                <View key={idx} style={styles.spotCard}>
                  <View style={styles.topRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.spotName}>{spot.name}</Text>
                    </View>
                    <View style={styles.amenityPill}>
                      <Text style={styles.amenityText}>Amenity: {spot.amenity}</Text>
                    </View>
                  </View>
                  <View style={styles.middleRow}>
                    <View style={styles.leftColumn}>
                      <Text style={styles.sectionTitle}>
                        <Ionicons name="location-outline" size={16} color="#44457D" /> Address
                      </Text>
                      <Text style={styles.sectionValue}>{spot.address}</Text>
                      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                        <Ionicons name="information-circle-outline" size={16} color="#44457D" /> Details
                      </Text>
                      {spot.details && (
                        <>
                          <Text style={styles.sectionValue}>Cuisine: {spot.details.Cuisine}</Text>
                          <Text style={styles.sectionValue}>Brand: {spot.details.Brand}</Text>
                          <Text style={styles.sectionValue}>Operator: {spot.details.Operator}</Text>
                        </>
                      )}
                    </View>
                    <View style={styles.rightColumn}>
                      <Text style={styles.sectionTitle}>
                        <Ionicons name="time-outline" size={16} color="#44457D" /> Opening Hours
                      </Text>
                      <Text style={styles.sectionValue}>{spot.opening_hours}</Text>
                      <Text style={[styles.sectionValue, { marginTop: 10 }]}>{spot.payment_methods}</Text>
                    </View>
                  </View>
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

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Separate Modal for Dropdown Overlay */}
      {showCategories && (
        <Modal
          transparent
          animationType="fade"
          visible={showCategories}
          onRequestClose={() => setShowCategories(false)}
        >
          <TouchableOpacity
            style={styles.dropdownModalBackground}
            activeOpacity={1}
            onPressOut={() => setShowCategories(false)}
          >
            <View
              style={[
                styles.dropdownModalContainer,
                {
                  top: dropdownPosition.y + dropdownPosition.height + 5,
                  left: dropdownPosition.x,
                },
              ]}
            >
              <ScrollView 
                nestedScrollEnabled
                keyboardShouldPersistTaps="always"
                contentContainerStyle={{ flexGrow: 1 }}
              >
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
          </TouchableOpacity>
        </Modal>
      )}
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
    overflow: "visible",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10,
  },
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
  scrollArea: {
    zIndex: 0,
  },
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
    backgroundColor: "#c4ecd2",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featureText: {
    color: "#2F855A",
    fontSize: 11,
    fontWeight: "600",
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
  dropdownModalBackground: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdownModalContainer: {
    position: "absolute",
    width: 200,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 0, // Tinatanggal ang mga linya
    borderRadius: 4,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    // Tinatanggal ang border line para sa cleaner na design
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: "#6366F1",
  },
  dropdownItemText: {
    fontSize: 12,
    color: "#374151",
    flexWrap: "wrap",
  },
  dropdownItemTextSelected: {
    color: "#fff",
  },
});
