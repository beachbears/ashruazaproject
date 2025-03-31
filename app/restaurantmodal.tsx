import React, { useMemo, useState } from "react";
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
  FlatList, TextInput
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Restaurant } from "@/src/types";

const formatCuisine = (cuisine: string | undefined) => {
  if (!cuisine) return "Not specified";
  return cuisine
    .split(/[_;]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(", ");
};

const getAcceptedPaymentMethods = (paymentData: string): string => {
  try {
    const paymentObj = JSON.parse(paymentData);
    const accepted = Object.entries(paymentObj)
      .filter(([_, value]) =>
        value && ["yes", "only"].includes(value.toString().toLowerCase())
      )
      .map(([key]) => key.replace(/^payment:/, ""));
    return accepted.join(", ");
  } catch (error) {
    console.error("Error parsing payment data:", error);
    return "";
  }
};

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  onView?: (restaurant: { latitude: number; longitude: number; name: string }) => void;
  onGoHere?: (restaurant: Restaurant) => void;
}

interface RestaurantItemProps {
  item: Restaurant;
  onView?: (restaurant: { latitude: number; longitude: number; name: string }) => void;
  onGoHere?: (restaurant: Restaurant) => void;
}

const RestaurantItem = React.memo<RestaurantItemProps>(({ item, onView, onGoHere }) => {
  const handleWebsitePress = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
    });
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.spotCard}>
      {onView && (
        <View style={styles.restaurantHeader}>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{item.name}</Text>
            <Text style={styles.restaurantCuisine}>
              {formatCuisine(item.cuisine)}
            </Text>
            {item.distance !== undefined && (
              <Text style={styles.distanceText}>
                {item.distance.toFixed(2)} km away
              </Text>
            )}
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                onView({
                  latitude: item.latitude,
                  longitude: item.longitude,
                  name: item.name,
                })
              }
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.goHereButton}
              onPress={() => onGoHere?.(item)}
            >
              <Text style={styles.goHereButtonText}>Go Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.detailsContainer}>
        {!onView && (
          <>
            <Text style={styles.spotName}>{item.name}</Text>
            {item.distance !== undefined && (
              <Text style={styles.distanceText}>
                {item.distance.toFixed(2)} km away
              </Text>
            )}
          </>
        )}
        <View style={styles.amenityPill}>
          <Text style={styles.amenityText}>
            {item.amenity
              ? item.amenity.charAt(0).toUpperCase() + item.amenity.slice(1)
              : "Unknown"}
          </Text>
        </View>
        {item.address && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#44457D" />
            <Text style={styles.sectionValue}>{item.address}</Text>
          </View>
        )}
        {item.cuisine && (
          <View style={styles.infoRow}>
            <Ionicons name="restaurant-outline" size={16} color="#44457D" />
            <Text style={styles.sectionValue}>{formatCuisine(item.cuisine)}</Text>
          </View>
        )}
        {item.opening_hours && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#44457D" />
            <Text style={styles.sectionValue}>
              {item.opening_hours === "Hours not specified"
                ? "Not available"
                : item.opening_hours}
            </Text>
          </View>
        )}
        {item.brand && (
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={16} color="#44457D" />
            <Text style={styles.sectionValue}>Brand: {item.brand}</Text>
          </View>
        )}
        {item.takeaway !== null && item.takeaway !== undefined && (
          <View style={styles.infoRow}>
            <Ionicons name="bag-handle-outline" size={16} color="#44457D" />
            <Text style={styles.sectionValue}>
              Takeaway: {item.takeaway ? "Yes" : "No"}
            </Text>
          </View>
        )}
        {item.delivery && (
          <View style={styles.infoRow}>
            <Ionicons name="bicycle-outline" size={16} color="#44457D" />
            <Text style={styles.sectionValue}>Delivery: {item.delivery}</Text>
          </View>
        )}
        {item.payment && item.payment !== "{}" && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={16} color="#44457D" />
            <Text style={styles.sectionValue}>
              Payment: {getAcceptedPaymentMethods(item.payment) || "Not specified"}
            </Text>
          </View>
        )}
        {item.wheelchair && (
          <View style={styles.infoRow}>
            <Ionicons name="accessibility-outline" size={16} color="#44457D" />
            <Text style={styles.sectionValue}>Wheelchair: {item.wheelchair}</Text>
          </View>
        )}
        {(item.phone || item.website || item.facebook || item.email) && (
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="call-outline" size={16} color="#44457D" /> Contact
            </Text>
            {item.phone && (
              <TouchableOpacity
                onPress={() => item.phone && handlePhonePress(item.phone)}
              >
                <Text style={styles.websiteText}>{item.phone}</Text>
              </TouchableOpacity>
            )}
            {item.website && (
              <TouchableOpacity
                onPress={() => item.website && handleWebsitePress(item.website)}
              >
                <Text style={styles.websiteText}>Visit Website</Text>
              </TouchableOpacity>
            )}
            {item.facebook && (
              <TouchableOpacity
                onPress={() => item.facebook && handleWebsitePress(item.facebook)}
              >
                <Text style={styles.websiteText}>Facebook</Text>
              </TouchableOpacity>
            )}
            {item.email && (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${item.email}`)}>
                <Text style={styles.websiteText}>{item.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
});

const ModalComponent: React.FC<ModalProps> = ({
  visible,
  onClose,
  restaurants,
  onView,
  onGoHere,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Add search state

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
    All: "all",
    Restaurant: "restaurant",
    Cafe: "cafe",
    "Fast Food": "fast_food",
    Pub: "pub",
    Bar: "bar",
    "Ice Cream": "ice_cream",
    "Food Court": "food_court",
    Biergarten: "biergarten",
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

  const filteredSpots = useMemo(() => {
    // First apply category filter
    let filtered = restaurants;
    if (selectedCategory !== "All") {
      filtered = restaurants.filter(
        (spot) =>
          spot.amenity?.toLowerCase() ===
          categoryMapping[selectedCategory].toLowerCase()
      );
    }

    // Then apply search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      return filtered.filter(spot => 
        spot.name.toLowerCase().includes(lowerQuery) 
      );
    }return filtered;
  }, [selectedCategory, restaurants, searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setShowCategories(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nearby Dining Spots</Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6366F1" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Find dining spots..."
                placeholderTextColor="#6366F1"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
                {searchQuery.length > 0 && (
                  <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                    <Ionicons name="close-circle" size={20} color="#6366F1" />
                  </TouchableOpacity>
                )}
              </View>

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
                <Text style={styles.dropdownButtonText}>{selectedCategory}</Text>
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
          </View>
          <FlatList
            data={filteredSpots}
            renderItem={({ item }) => (
              <RestaurantItem item={item} onView={onView} onGoHere={onGoHere} />
            )}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            initialNumToRender={5}
            windowSize={5}
            removeClippedSubviews={true}
            contentContainerStyle={{ paddingBottom: 20 }}
            style={styles.scrollArea}
            ListEmptyComponent={
              <Text style={styles.noResultsText}>No dining spots found.</Text>
            }
          />
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
  searchContainer: {
    position: "relative",
    width: "100%",
    overflow: "visible", // Make sure the icons are not clipped
  },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderColor: "#6366F1",
    borderRadius: 10,
    paddingLeft: 35,  // Space for the search icon
    paddingRight: 35, // Space for the clear button
    color: "black",
    backgroundColor: "#F5F7FF",
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 2, // Higher zIndex to stay on top
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 2, // Ensure it's above the text input
  },
  clearButtonText: {
    color: '#6366F1',
    fontSize: 16,
  },

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