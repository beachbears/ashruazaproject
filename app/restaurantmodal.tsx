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
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Restaurant } from "@/src/types";

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
      const cleanKey = key.replace(/^payment:/, "").replace(/_/g, " ").toLowerCase();
      const paymentValue = value?.toString().trim().toLowerCase();
      if (paymentValue && ["yes", "only"].includes(paymentValue)) {
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
    return accepted
      .map(method => method.charAt(0).toUpperCase() + method.slice(1))
      .join(', ');
  } catch (error) {
    console.error("Error in getAcceptedPaymentMethodsText:", error);
    return "";
  }
};

const parseOpeningHours = (hours?: string): string => {
  if (!hours || hours === "Hours not specified") return "Not available";
  return hours.replace(/;/g, '\n').replace(/,/g, ', ');
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

// Updated ServiceBadge now accepts a prop for iconSet, and for accessibility we use MaterialCommunityIcons.
interface ServiceBadgeProps {
  icon: React.ComponentProps<typeof MaterialIcons>['name'] | React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  iconSet?: 'material' | 'materialCommunity';
}
const ServiceBadge = ({ icon, label, value, iconSet = 'material' }: ServiceBadgeProps) => (
  <View style={styles.serviceBadge}>
    {iconSet === 'material' ? (
      <MaterialIcons name={icon as any} size={18} color="#6366F1" />
    ) : (
      <MaterialCommunityIcons name={icon as any} size={18} color="#6366F1" />
    )}
    <Text style={styles.serviceLabel}>{label}</Text>
    <Text style={styles.serviceValue}>{value}</Text>
  </View>
);

// RestaurantItem now renders all details expanded.
const RestaurantItem = React.memo<RestaurantItemProps>(({ item, onView, onGoHere }) => {
  const getServiceValue = (value: boolean | string | undefined): string => {
    if (value === undefined || value === null) {
      return 'Not specified';
    } else if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    } else if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') {
        return 'Not specified';
      }
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    } else {
      return 'Not specified';
    }
  };

  const amenityDisplayMapping: { [key: string]: string } = {
    restaurant: "Restaurant",
    cafe: "Cafe",
    fast_food: "Fast Food",
    pub: "Pub",
    bar: "Bar",
    ice_cream: "Ice Cream",
    food_court: "Food Court",
    biergarten: "Biergarten",
  };

  const amenityDisplay = item.amenity
    ? (amenityDisplayMapping[item.amenity.toLowerCase()] || item.amenity)
    : 'Dining';

  return (
    <View style={styles.spotCard}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        {/* Restaurant Name */}
        <Text style={styles.restaurantName}>{item.name}</Text>

        {/* Brand Name - Only show if different from restaurant name */}
        {item.brand?.brand && item.brand.brand !== item.name && (
          <Text style={styles.brandText}>{item.brand.brand}</Text>
        )}

        {/* Quick Info Row: Amenity, Cuisine, and Optional Diet */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.infoPill}>
            <Ionicons name="restaurant" size={14} color="#6366F1" />
            <Text style={styles.infoPillText}>{amenityDisplay}</Text>
          </View>
          <View style={styles.infoPill}>
            <MaterialCommunityIcons name="food-fork-drink" size={14} color="#6366F1" />
            <Text style={styles.infoPillText}>
              {formatCuisine(item.metadata?.cuisine) || 'Not specified'}
            </Text>
          </View>
          {item.metadata?.diet && (
            <View style={styles.infoPill}>
              <MaterialCommunityIcons name="leaf" size={14} color="#6366F1" />
              <Text style={styles.infoPillText}>{item.metadata.diet}</Text>
            </View>
          )}
        </View>

        {/* Distance and Wi-Fi Badges */}
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
      {/* Details Sections Always Expanded */}
      <View style={styles.detailSection}>
        <View style={styles.sectionHeaderStatic}>
          <MaterialIcons name="schedule" size={20} color="#6366F1" />
          <Text style={styles.sectionTitleStatic}>Location & Hours</Text>
        </View>
        <View style={styles.sectionContentStatic}>
          <View style={styles.detailRow}>
            <MaterialIcons name="place" size={18} color="#6366F1" />
            <Text style={styles.detailText}>
              {item.reverse_geocoded_address || 'Address not available'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={18} color="#6366F1" />
            <Text style={styles.detailText}>
              {item.metadata?.opening_hours || 'Opening hours not available'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.detailSection}>
        <View style={styles.sectionHeaderStatic}>
          <MaterialIcons name="miscellaneous-services" size={20} color="#6366F1" />
          <Text style={styles.sectionTitleStatic}>Services & Facilities</Text>
        </View>
        <View style={styles.sectionContentStatic}>
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <ServiceBadge
                icon="takeout-dining"
                label="Takeaway"
                value={getServiceValue(item.metadata?.takeaway)}
              />
              <ServiceBadge
                icon="delivery-dining"
                label="Delivery"
                value={getServiceValue(item.metadata?.delivery)}
              />
            </View>
            <View style={styles.gridRow}>
              <ServiceBadge
                icon="directions-car"
                label="Drive-through"
                value={getServiceValue(item.metadata?.drive_through)}
              />
              <ServiceBadge
                icon="wheelchair-accessibility"
                label="Accessibility"
                value={getServiceValue(item.metadata?.wheelchair)}
                iconSet="materialCommunity"
              />
            </View>
            {/* Removed redundant Chair badge */}
          </View>
        </View>
      </View>

      <View style={styles.detailSection}>
        <View style={styles.sectionHeaderStatic}>
          <MaterialIcons name="payment" size={20} color="#6366F1" />
          <Text style={styles.sectionTitleStatic}>Payment Options</Text>
        </View>
        <View style={styles.sectionContentStatic}>
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
        </View>
      </View>

      {(item.contacts && (item.contacts.phone || item.contacts.website)) && (
        <View style={styles.detailSection}>
          <View style={styles.sectionHeaderStatic}>
            <MaterialIcons name="contact-page" size={20} color="#6366F1" />
            <Text style={styles.sectionTitleStatic}>Contacts</Text>
          </View>

          {item.contacts.phone && (
            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={18} color="#6366F1" />
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contacts?.phone}`)}>
                <Text style={[styles.detailText, styles.clickableText]}>
                  {item.contacts.phone}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {item.contacts.website && (
            <View style={styles.detailRow}>
              <MaterialIcons name="public" size={18} color="#6366F1" />
              <TouchableOpacity onPress={() => Linking.openURL(item.contacts!.website!)}>
                <Text style={[styles.detailText, styles.clickableText]}>
                  {item.contacts.website}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
          onPress={() =>
            onView?.({
              latitude: item.latitude,
              longitude: item.longitude,
              name: item.name,
            })
          }
        >
          <MaterialIcons name="map" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>View on Map</Text>
        </TouchableOpacity>
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
  clickableText: {
    fontSize: 12,
    color: '#6366F1', // Purple for clickable text
    textDecorationLine: 'underline',
  },
  noResultsText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
  },
  // Payment and header styles
  paymentText: {
    fontSize: 12,
    color: '#6366F1',
    marginLeft: 8,
  },
  headerContainer: {
    padding: 4,
    backgroundColor: '#FFFFFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  brandText: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  ratingDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Note: Replace with marginRight if gap isn't supported
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
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
    gap: 8, // Note: If your RN version doesn't support gap, use marginRight on infoPill instead
    marginBottom: 8,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6, // Note: If gap isn't supported, use marginRight on the icon
  },
  infoPillText: {
    fontSize: 12,
    color: '#1F2937',
  },
  // Static (always expanded) section header and content
  detailSection: {
    backgroundColor: '#F9FAFB', // Very light grey
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  sectionHeaderStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitleStatic: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937', // Dark grey for headers
    marginLeft: 8,
  },
  sectionContentStatic: {
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#4B5563', // Medium grey for details
    flex: 1,
    lineHeight: 18,
  },
  // Grid for service badges
  gridContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  // Payment container styles
  noPaymentText: {
    color: '#718096',
    fontSize: 12,
    fontStyle: 'italic',
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
  // Service badge styles
  serviceBadge: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    padding: 8,
    borderRadius: 8,
    minWidth: '48%',
  },
  serviceLabel: {
    fontSize: 10,
    color: '#718096', // Light grey for secondary text
  },
  serviceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937', // Dark grey for primary values
  },
  // Action buttons
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
    backgroundColor: '#6366F1',
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
  // Modal styles
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
    color: "#1F2937",
  },
  dropdownItemTextSelected: {
    color: "#fff",
  },
  scrollArea: {
    maxHeight: 400,
  },
  spotCard: {
    backgroundColor: "#fff",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 12,
    color: "#718096",
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
