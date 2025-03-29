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
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Restaurant } from "@/src/types";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const formatCuisine = (cuisine: string | undefined) => {
  if (!cuisine) return "Not specified";
  return cuisine
    .split(/[_;]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(", ");
};

const paymentIconMapping: { [key: string]: { icon: keyof typeof MaterialIcons.glyphMap; color: string } } = {
  'credit cards': { icon: 'credit-card', color: '#4a5568' },
  'cash': { icon: 'attach-money', color: '#48bb78' },
  'cryptocurrency': { icon: 'currency-bitcoin', color: '#f6ad55' },
  'contactless': { icon: 'contactless', color: '#4299e1' },
};

const getPaymentIcons = (paymentData: string): JSX.Element[] => {
  try {
    const paymentObj = JSON.parse(paymentData);
    const icons: JSX.Element[] = [];

    Object.entries(paymentObj).forEach(([key, value]) => {
      const cleanKey = key.replace(/^payment:/, "").replace(/_/g, " ").toLowerCase(); // e.g., "credit cards"
      const paymentValue = value?.toString().trim().toLowerCase();
      if (paymentValue && ["yes", "only"].includes(paymentValue)) {
        // Look for a known mapping; if not, use a generic "payment" icon.
        const mapping = paymentIconMapping[cleanKey];
        const iconName = mapping ? mapping.icon : 'payment';
        const iconColor = mapping ? mapping.color : '#4a5568';
        icons.push(
          <MaterialIcons
            key={cleanKey}
            name={iconName}
            size={20}
            color={iconColor}
            style={styles.paymentIcon}
          />
        );
      }
    });
    return icons;
  } catch (error) {
    console.error("Error in getPaymentIcons:", error);
    return [];
  }
};

const getAcceptedPaymentMethodsText = (paymentData: string): string => {
  try {
    const paymentObj = JSON.parse(paymentData);
    const accepted = Object.entries(paymentObj)
      .filter(([_, value]) =>
        value && ["yes", "only"].includes(value.toString().toLowerCase())
      )
      .map(([key]) =>
        key.replace(/^payment:/, "").replace(/_/g, " ").trim()
      );
    // Capitalize each method and join with commas
    const formatted = accepted
      .map(method => method.charAt(0).toUpperCase() + method.slice(1))
      .join(', ');
    return formatted ? `${formatted}` : "";
  } catch (error) {
    console.error("Error in getAcceptedPaymentMethodsText:", error);
    return "";
  }
};

const parseOpeningHours = (hours?: string): string => {
  if (!hours || hours === "Hours not specified") return "Not available";
  return hours.replace(/;/g, '\n').replace(/,/g, ', ');
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderDetailSection = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(title)}
      >
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
        <MaterialIcons
          name={expandedSection === title ? 'expand-less' : 'expand-more'}
          size={20}
          color="#4a5568"
        />
      </TouchableOpacity>
      {expandedSection === title && (
        <View style={styles.sectionContent}>
          {content}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.spotCard}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          {item.brand?.brand && (
            <Text style={styles.brandText}>{item.brand.brand}</Text>
          )}
          <View style={styles.ratingDistanceContainer}>
            <View style={styles.distanceBadge}>
              <MaterialIcons name="location-on" size={14} color="#fff" />
              <Text style={styles.distanceText}>
                {item.distance.toFixed(2)} km
              </Text>
            </View>
            {item.metadata?.internet_access && (
              <View style={styles.wifiBadge}>
                <Ionicons name="wifi" size={14} color="#fff" />
                <Text style={styles.wifiText}>
                  {item.metadata.internet_access}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Quick Info Row */}
      <View style={styles.quickInfoContainer}>
        <View style={styles.infoPill}>
          <Ionicons name="restaurant" size={14} color="#4a5568" />
          <Text style={styles.infoPillText}>
            {item.amenity || 'Dining'}
          </Text>
        </View>
        <View style={styles.infoPill}>
          <MaterialCommunityIcons name="food-fork-drink" size={14} color="#4a5568" />
          <Text style={styles.infoPillText}>
            {formatCuisine(item.metadata?.cuisine)}
          </Text>
        </View>
      </View>

      {/* Expandable Sections */}
      {renderDetailSection(
        'Location & Hours',
        <MaterialIcons name="schedule" size={20} color="#4a5568" />,
        <>
          <View style={styles.detailRow}>
            <MaterialIcons name="place" size={18} color="#4a5568" />
            <Text style={styles.detailText}>
              {item.reverse_geocoded_address || 'Address not available'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={18} color="#4a5568" />
            <Text style={styles.detailText}>
              {item.metadata?.opening_hours || 'Opening hours not available'}
            </Text>
          </View>
        </>
      )}

      {renderDetailSection(
        'Services & Facilities',
        <MaterialIcons name="miscellaneous-services" size={20} color="#4a5568" />,
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <ServiceBadge
              icon="takeout-dining"
              label="Takeaway"
              value={item.metadata?.takeaway ? 'Yes' : 'No'}
            />
            <ServiceBadge
              icon="delivery-dining"
              label="Delivery"
              value={item.metadata?.delivery || 'No'}
            />
            <ServiceBadge
              icon="directions-car"
              label="Drive-through"
              value={item.metadata?.drive_through || 'No'}
            />
            <ServiceBadge
              icon="accessible"
              label="Accessibility"
              value={item.metadata?.wheelchair || 'No'}
            />
          </View>
        </View>
      )}

      {renderDetailSection(
        'Payment Options',
        <MaterialIcons name="payment" size={20} color="#4a5568" />,
        <View style={[styles.paymentContainer, { flexDirection: 'row', alignItems: 'center' }]}>
          {(() => {
            const icons = getPaymentIcons(item.metadata?.payment || '{}');
            const acceptedText = getAcceptedPaymentMethodsText(item.metadata?.payment || '{}');
            if (icons.length > 0) {
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  {icons}
                  {acceptedText ? (
                    <Text style={styles.paymentText}> {acceptedText}</Text>
                  ) : null}
                </View>
              );
            } else {
              return <Text style={styles.noPaymentText}>Payment methods not specified</Text>;
            }
          })()}
        </View>
      )}


      {/* Action Buttons */}
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onGoHere?.(item)}
        >
          <MaterialIcons name="directions" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => onView?.({
            latitude: item.latitude,
            longitude: item.longitude,
            name: item.name
          })}
        >
          <MaterialIcons name="map" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>View on Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
interface ServiceBadgeProps {
  icon: React.ComponentProps<typeof MaterialIcons>['name'] | React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  iconSet?: 'material' | 'materialCommunity';
}
const ServiceBadge = ({ icon, label, value, iconSet = 'material' }: ServiceBadgeProps) => (
  <View style={styles.serviceBadge}>
    {iconSet === 'material' ? (
      <MaterialIcons name={icon as React.ComponentProps<typeof MaterialIcons>['name']} size={18} color="#4a5568" />
    ) : (
      <MaterialCommunityIcons name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={18} color="#4a5568" />
    )}
    <Text style={styles.serviceLabel}>{label}</Text>
    <Text style={styles.serviceValue}>{value}</Text>
  </View>
);

const ModalComponent: React.FC<ModalProps> = ({
  visible,
  onClose,
  restaurants,
  onView,
  onGoHere,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [showCategories, setShowCategories] = useState(false);

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
    if (selectedCategory === "All") {
      return restaurants;
    }
    return restaurants.filter(
      (spot) =>
        spot.amenity?.toLowerCase() ===
        categoryMapping[selectedCategory].toLowerCase()
    );
  }, [selectedCategory, restaurants]);

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
  paymentText: {
    fontSize: 12,
    color: '#4a5568',
    marginLeft: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  brandText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  ratingDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a5568',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  wifiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38a169',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  wifiText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf2f7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  infoPillText: {
    fontSize: 12,
    color: '#4a5568',
  },
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    flex: 1,
  },
  sectionContent: {
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#4a5568',
    flex: 1,
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  noPaymentText: {
    color: '#718096',
    fontSize: 12,
    fontStyle: 'italic',
  },
  serviceBadge: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    padding: 8,
    borderRadius: 8,
    minWidth: '48%',
  },
  serviceLabel: {
    fontSize: 10,
    color: '#718096',
    marginTop: 4,
  },
  serviceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
  },
  paymentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  paymentIcon: {
    marginRight: 8,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a5568',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#718096',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
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