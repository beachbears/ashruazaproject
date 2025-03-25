import React, { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import {
  View,
  Text,
  StyleSheet,

  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Animated,
  ActivityIndicator,
  LogBox,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  FlatList,
} from "react-native";
import axios from "axios";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ReviewModal from "../reviewmodal";
import ModalComponent from "../restaurantmodal";
import { GestureHandlerRootView, ScrollView, } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Region, LatLng, MapComponentProps, Route, SegmentPath, RouteDetails, RouteMetrics, NearbySpot, LocationSuggestion, ApiResponse } from "../../src/types";
import { sleep, formatDuration, shortenAddress, getSegmentLabel } from "../../src/utils/helpers";
import { getMapHTML } from "../../src/utils/getMapHTML";
import MapComponent from "@/src/components/MapComponent";
import { locationCacheRef } from "@/src/utils/locationsCache";
import SuggestionList from "@/src/components/SuggestionList";
import AttractionsList from "@/src/components/AttractionsList";

const polyline = require("@mapbox/polyline");
interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

const TabButton = ({ title, isActive, onPress }: TabButtonProps) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);
LogBox.ignoreLogs(["textShadow*", "shadow*"]);

const RouteScreen: React.FC = () => {
  const { destination: destParam, attraction } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [restaurantModalVisible, setRestaurantModalVisible] = useState(false);
  const [scrollToSpot, setScrollToSpot] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 14.676,
    longitude: 121.0437,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [origin, setOrigin] = useState<string>("");
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destination, setDestination] = useState<string>("");
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [roadPath, setRoadPath] = useState<LatLng[] | string | LatLng[][] | SegmentPath[]>([]);
  const [routeDetails, setRouteDetails] = useState<RouteDetails>({ route: null });
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics | null>(null);
  const [mapResetKey, setMapResetKey] = useState<number>(Date.now());
  const [manualOrigin, setManualOrigin] = useState<boolean>(false);
  const [polylineColor, setPolylineColor] = useState<string>("#6366F1");
  const [isOriginLoading, setIsOriginLoading] = useState(false);
  const [isDestinationLoading, setIsDestinationLoading] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["25%", "60%", "90%"];
  const [selectedLocationType, setSelectedLocationType] = useState<"origin" | "destination" | null>(null);
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<LatLng | null>(null);
  const navigation = useNavigation();
  const [nearbySpots, setNearbySpots] = useState<NearbySpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<LatLng | null>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<
    Array<{
      distance: number;
      name: string;
      latitude: number;
      longitude: number;
      cuisine: string;
      amenity: string;
      address: string;
      opening_hours: string;
      phone?: string;
      website?: string;
      image_url?: string;
    }>
  >([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("best");
  const [showAlgorithmDropdown, setShowAlgorithmDropdown] = useState<boolean>(false);
  const algorithmOptions = [
    { label: "Balanced", value: "best" },
    { label: "Fewest Transfers", value: "fewest-transfers" },
    { label: "Minimal Walking", value: "minimal-walking" },
    { label: "Fastest", value: "fastest" },
  ];
  const router = useRouter();
  const [expandedSegments, setExpandedSegments] = useState<{ [index: number]: boolean }>({});
  const webviewRef = useRef<WebView>(null);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState("Route");
  const formatCuisine = (cuisine: string | undefined) => {
    if (!cuisine) return "Not specified";
    return cuisine
      .split(/[_;]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(', ');
  };
  const [spotLimit, setSpotLimit] = useState(20); // Default to 10 spots

  useEffect(() => {
    if (selectedLocationType === "origin" && route[0]) {
      setSelectedLocationCoords(route[0]);
    } else if (selectedLocationType === "destination" && route[1]) {
      setSelectedLocationCoords(route[1]);
    } else {
      setSelectedLocationCoords(null);
    }
  }, [selectedLocationType, route]);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: "none" },
      headerShown: false,
    });
    return () =>
      navigation.setOptions({
        tabBarStyle: undefined,
        headerShown: true,
      });
  }, [navigation]);

  useEffect(() => {
    if (!route[1] && selectedLocationType === "destination") {
      setSelectedLocationType(route[0] ? "origin" : null);
    }
    if (!route[0] && selectedLocationType === "origin") {
      setSelectedLocationType(null);
    }
  }, [route, selectedLocationType]);

  useEffect(() => {
    // Hide both tab bar and header when this screen is focused
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
      headerShown: false,
    });

    // Restore options when leaving this screen
    return () =>
      navigation.setOptions({
        tabBarStyle: undefined,
        headerShown: true,
      });
  }, [navigation]);

  useEffect(() => {
    if (modalVisible && scrollToSpot) {
      setTimeout(() => {
        setScrollToSpot(null);
      }, 300);
    }
  }, [modalVisible, scrollToSpot]);

  const handleToggleSegment = (idx: number) => {
    setExpandedSegments((prev) => ({ ...prev, [idx]: !prev[idx] }));
    if (webviewRef.current) {
      webviewRef.current.postMessage(
        JSON.stringify({ type: "toggleSegmentHighlight", index: idx })
      );
    }
  };

  useEffect(() => {
    return () => {
      if (originTimeoutRef.current) clearTimeout(originTimeoutRef.current);
      if (destinationTimeoutRef.current)
        clearTimeout(destinationTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (destParam) {
      setDestination(destParam as string);
      setRoadPath([]);
      setMapResetKey(Date.now());
      geocodeAddress(destParam as string).then((suggestions: any) => {
        if (suggestions && suggestions.length > 0) {
          const selected = suggestions[0];
          setRoute((prev) =>
            prev.length > 0
              ? [prev[0], { latitude: selected.lat, longitude: selected.lon }]
              : [
                { latitude: region.latitude, longitude: region.longitude },
                { latitude: selected.lat, longitude: selected.lon },
              ]
          );
          fetchRouteDetails(selected.lat, selected.lon, selectedAlgorithm);
        }
      });
    }
  }, [destParam]);

  useEffect(() => {
    if (attraction) {
      try {
        const parsedAttraction = JSON.parse(attraction as string);
        setDestination(parsedAttraction.name);
        setRoute([
          region,
          {
            latitude: parsedAttraction.latitude,
            longitude: parsedAttraction.longitude,
          },
        ]);
        fetchRouteDetails(
          parsedAttraction.latitude,
          parsedAttraction.longitude,
          selectedAlgorithm
        );
        setMapResetKey(Date.now());
      } catch (error) {
        console.error("Error parsing attraction parameter:", error);
      }
    }
  }, [attraction]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (status !== "granted" || !servicesEnabled) {
          console.log("Location permission not granted or services disabled.");
          setIsOriginLoading(false);
          return;
        }

        setIsOriginLoading(true); // Start loading indicator

        const { coords } = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = coords;
        setRegion(prev => ({ ...prev, latitude, longitude }));

        // Reverse geocoding with timeout
        const reverseGeocode = async (lat: number, lon: number) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

            const response = await fetch(
              `https://nominatim-production-05c9.up.railway.app/reverse?format=json&lat=${lat}&lon=${lon}`,
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            const data = await response.json();
            return data.address;
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            return null;
          }
        };

        const address = await reverseGeocode(latitude, longitude);
        const locAddr = address ?
          [address.road, address.neighbourhood, address.suburb, address.city_district, address.city, address.state]
            .filter(Boolean)
            .join(", ") :
          "Current Location";

        if (!manualOrigin && !origin) {
          setOrigin(locAddr);
          setRoute(prev => prev.length > 0 ?
            [{ latitude, longitude }, ...prev.slice(1)] :
            [{ latitude, longitude }]
          );
        }
      } catch (error) {
        console.error("Geolocation error:", error);
        if (!origin) setOrigin("Current Location");
      } finally {
        setIsOriginLoading(false); // Stop loading indicator
      }
    })();
  }, []);

  const fetchRestaurants = async (lat: number, lon: number, limit: number) => {
    try {
      const response = await axios.get("https://comgu20-production.up.railway.app/api/sustenance", {
        params: {
          lat,
          lon,
          radius: 5,
          sort: "nearest",
          amenity: "cafe,restaurant,fast_food,pub,bar,ice_cream,food_court,biergarten",
          page: 1,
          per_page: limit,
        },
      });
      const mapped = response.data.results.map((item: any) => ({
        name: item.name || "Unnamed Dining Spot",
        latitude: item.coordinates?.lat || 0,
        longitude: item.coordinates?.lon || 0,
        amenity: item.amenity || "Dining Spot",
        cuisine: item.metadata?.cuisine || "Various",
        address: item.address?.full_address || "Address not available",
        opening_hours: item.metadata?.opening_hours || "Hours not specified",
        phone: item.contacts?.phone,
        website: item.contacts?.website,
        image_url: "https://via.placeholder.com/150",
        distance: item.distance,
        brand: item.brand?.brand,
        takeaway: item.metadata?.takeaway,
        delivery: item.metadata?.delivery,
        payment: item.metadata?.payment,
        wheelchair: item.metadata?.wheelchair,
        facebook: item.contacts?.facebook,
        email: item.contacts?.email,
      }));
      setNearbyRestaurants(mapped);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setNearbyRestaurants([]);
    }
  };

  const fetchAttractions = async (lat: number, lon: number, limit: number) => {
    try {
      const response = await axios.get("https://comgu20-production.up.railway.app/api/tourist_spots", {
        params: {
          lat,
          lon,
          radius: 5,
          page: 1,
          per_page: limit,
        },
      });
      console.log("API Response for Attractions:", response.data.results);
      const mapped = response.data.results.map((item: any) => ({
        name: item.tourist_spot || "Unnamed Attraction",
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        description: item.description || "No description available",
        address: item.address || "Address not available",
        distance: item.distance,
        image_url: item.image_url || "https://via.placeholder.com/150",
        trivia: item.trivia || "No trivia available",
        feedbacks: item.feedbacks || [],
      }));
      setNearbySpots(mapped);
    } catch (error) {
      console.error("Error fetching attractions:", error);
      setNearbySpots([]);
    }
  };

  useEffect(() => {
    if (selectedLocationCoords) {
      console.log("Fetching restaurants for:", selectedLocationType, selectedLocationCoords);
      fetchRestaurants(selectedLocationCoords.latitude, selectedLocationCoords.longitude, spotLimit);
    }
  }, [selectedLocationCoords, spotLimit]);

  useEffect(() => {
    if (activeTab === "Attractions" && selectedLocationCoords) {
      fetchAttractions(selectedLocationCoords.latitude, selectedLocationCoords.longitude, spotLimit);
    }
  }, [activeTab, selectedLocationCoords, spotLimit]);

  async function geocodeAddress(address: string) {
    if (locationCacheRef.current[address])
      return locationCacheRef.current[address];
    try {
      const { data } = await axios.get<LocationSuggestion[]>(
        "https://comgu20-production.up.railway.app/api/locations/search",
        { params: { term: address } }
      );
      let results: any[] = [];
      if (data && data.length) {
        results = data.map((item: LocationSuggestion) => ({
          name: item.label,
          lat: parseFloat(item.latitude),
          lon: parseFloat(item.longitude),
        }));
      }
      locationCacheRef.current[address] = results;
      return results;
    } catch (err) {
      console.error("Geocoding error:", err);
      await sleep(1000);
      return [];
    }
  }

  const handleOriginChange = async (text: string) => {
    setOrigin(text);
    if (!text) {
      setOriginSuggestions([]);
      setDestination("");
      setDestinationSuggestions([]);
      setRoute([]);
      setRouteDetails({ route: null });
      setRoadPath([]);
      setIsOriginLoading(false);
      return;
    }
    if (originTimeoutRef.current) clearTimeout(originTimeoutRef.current);
    setIsOriginLoading(true);
    originTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await geocodeAddress(text);
        setOriginSuggestions(suggestions);
      } catch (error) {
        console.error("Search failed:", error);
        setOriginSuggestions([]);
      } finally {
        setIsOriginLoading(false);
      }
    }, 300);
    const suggestions = await geocodeAddress(text);
    setOriginSuggestions(suggestions);
    setIsOriginLoading(false);
  };

  const clearOrigin = () => {
    setOrigin("");
    setOriginSuggestions([]);
    setRoute((prev) => (prev.length > 1 ? [prev[1]] : [])); // Keep destination if exists
    setRouteDetails({ route: null });
    setRoadPath([]);
    setNearbySpots([]);
    setSelectedLocationType(null);
  };

  const selectOriginSuggestion = async (item: any) => {
    setOrigin(item.name);
    setOriginSuggestions([]);
    setRegion((prev) => ({ ...prev, latitude: item.lat, longitude: item.lon }));
    const newRoute =
      route.length > 0
        ? [{ latitude: item.lat, longitude: item.lon }, ...route.slice(1)]
        : [{ latitude: item.lat, longitude: item.lon }];
    setRoute(newRoute);
    setManualOrigin(true);
    setMapResetKey(Date.now());
    if (newRoute.length >= 2) {
      await fetchRouteDetails(newRoute[1].latitude, newRoute[1].longitude, selectedAlgorithm);
    }
  };

  const handleDestinationChange = async (text: string) => {
    setDestination(text);
    if (!text) {
      setDestinationSuggestions([]);
      setIsDestinationLoading(false);
      return;
    }
    if (destinationTimeoutRef.current)
      clearTimeout(destinationTimeoutRef.current);
    setIsDestinationLoading(true);
    destinationTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await geocodeAddress(text);
        setDestinationSuggestions(suggestions);
      } catch (error) {
        console.error("Search failed:", error);
        setDestinationSuggestions([]);
      } finally {
        setIsDestinationLoading(false);
      }
    }, 300);
  };

  const selectDestinationSuggestion = async (item: any) => {
    setDestination(item.name);
    setDestinationSuggestions([]);
    setRoadPath([]);
    setRoute((prev) =>
      prev.length > 0
        ? [prev[0], { latitude: item.lat, longitude: item.lon }]
        : [
          { latitude: region.latitude, longitude: region.longitude },
          { latitude: item.lat, longitude: item.lon },
        ]
    );
    await fetchRouteDetails(item.lat, item.lon, selectedAlgorithm);
    setMapResetKey(Date.now());
  };

  const fetchRouteDetails = async (destLat: number, destLon: number, algorithm: string) => {
    setIsRouteLoading(true);
    setNearbySpots([]);
    setSelectedSpot(null);
    setRoadPath([]);
    const params = {
      origin_lat: route.length > 0 ? route[0].latitude : region.latitude,
      origin_lon: route.length > 0 ? route[0].longitude : region.longitude,
      destination_lat: destLat,
      destination_lon: destLon,
      algorithm,
    };
    try {
      const response = await axios.get("https://comgu20-production.up.railway.app/api/routes/find", { params });
      const routeData = response.data.route;
      setRouteDetails({ route: routeData });
      if (routeData && routeData.summary) {
        const summary = routeData.summary;
        const formattedDuration = formatDuration(summary.total_duration); // Keep this since API returns seconds
        setRouteMetrics({
          duration: summary.total_duration || 0,
          distance: summary.total_distance_km || 0,
          fare: summary.total_fare || 0,
          walkingTime: "", // Simplified for brevity; calculate if needed
          carTime: formattedDuration, // Total formatted duration
          busTime: "", // Add if needed
        });
      } else {
        setRouteMetrics(null);
      }
      if (routeData && routeData.segments && routeData.segments.length > 0) {
        const allWalking = routeData.segments.every((seg: { walking: any; }) => seg.walking);
        setPolylineColor(allWalking ? "#808080" : "#6366F1");
      } else {
        setPolylineColor("#6366F1");
      }
      if (response.data.polyline && response.data.polyline.length > 0) {
        setRoadPath(response.data.polyline);
      } else if (
        routeData &&
        routeData.segments &&
        routeData.segments.length > 0
      ) {
        const segmentsPaths: SegmentPath[] = routeData.segments
          .filter((segment: { geometry: any; }) => segment.geometry)
          .map((segment: { type: string; geometry: any; }) => {
            const color =
              segment.type.toLowerCase() === "walking" ? "#808080" : "#6366F1";
            const coords = polyline
              .decode(segment.geometry)
              .map((coord: number[]) => ({
                latitude: coord[0],
                longitude: coord[1],
              }));
            return { coords, color };
          });
        setRoadPath(segmentsPaths);
      } else if (route.length === 2) {
        setRoadPath(route);
      } else {
        setRoadPath([]);
      }
    } catch (error) {
      console.error("Error fetching route details:", error);
    } finally {
      setIsRouteLoading(false);
    }
  };

  const renderRouteOverview = () => {
    if (!routeDetails.route) return <Text style={styles.overviewText}>No route available</Text>;

    const { segments } = routeDetails.route;
    return (
      <View style={styles.timelineContainer}>
        {segments.map((segment, idx) => {
          const iconName = segment.type === "walking" ? "walking" : segment.type === "bus" ? "bus" : "car";
          const isExpanded = expandedSegments[idx];
          return (
            <View key={idx} style={styles.timelineItem}>
              <FontAwesome5 name={iconName} size={16} color="#6366F1" style={styles.timelineIcon} />
              <View style={styles.timelineContent}>
                <TouchableOpacity
                  style={styles.segmentHeaderRow}
                  onPress={() => handleToggleSegment(idx)}
                >
                  <Text style={styles.segmentLabel}>
                    {segment.type === "walking"
                      ? `Walk from ${shortenAddress(segment.from_stop?.name || "Origin")} to ${shortenAddress(segment.to_stop?.name || "Destination")}`
                      : `${segment.route_name || segment.type} from ${shortenAddress(segment.boarding || segment.from_stop?.name || "Start")} to ${shortenAddress(segment.alighting || segment.to_stop?.name || "End")}`}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-down" : "chevron-forward"}
                    size={18}
                    color="#6366F1"
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.segmentDetails}>
                    {segment.type === "walking" ? (
                      <>
                        <Text style={styles.segmentText}>
                          Distance: {segment.distance ? (segment.distance / 1000).toFixed(2) : "N/A"} km
                        </Text>
                        <Text style={styles.segmentText}>
                          Duration: {segment.duration ? formatDuration(segment.duration) : "N/A"}
                        </Text>
                        {segment.steps?.map((step, stepIdx) => (
                          <Text key={stepIdx} style={styles.stepText}>• {step.instruction}</Text>
                        ))}
                      </>
                    ) : (
                      <>
                        {/* Get On / Get Off Section */}
                        <View style={styles.getOnOffContainer}>
                          <Text style={styles.onOffTitle}>Get On</Text>
                          <Text style={styles.onOffInstruction}>
                            {segment.boarding || segment.from_stop?.name || "Start"}
                          </Text>
                          <Text style={styles.onOffTitle}>Get Off</Text>
                          <Text style={styles.onOffInstruction}>
                            {segment.alighting || segment.to_stop?.name || "End"}
                          </Text>
                        </View>
                        <Text style={styles.segmentText}>Fare: {segment.fare || "N/A"}</Text>
                        <Text style={styles.segmentText}>
                          Duration: {segment.duration ? formatDuration(segment.duration) : "N/A"}
                        </Text>
                        {/* Alternatives Section with Type Safety */}
                        {segment.alternatives && Array.isArray(segment.alternatives) && segment.alternatives.length > 0 && (
                          <View style={styles.alternativesContainer}>
                            <Text style={styles.alternativeHeader}>Alternatives</Text>
                            {segment.alternatives.map((alt, altIdx) => (
                              <Text key={altIdx} style={styles.alternativeText}>
                                • {alt.type} - {alt.route_name}
                              </Text>
                            ))}
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderRouteTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionHeader}>Route Details</Text>

      {/* Route Type Dropdown */}
      <View style={styles.routeTypeContainer}>
        <Text style={styles.subHeader}>Select Route Type</Text>
        <TouchableOpacity
          style={styles.algorithmDropdownButton}
          onPress={() => setShowAlgorithmDropdown(!showAlgorithmDropdown)}
        >
          <Text style={styles.algorithmDropdownButtonText}>
            {algorithmOptions.find((opt) => opt.value === selectedAlgorithm)?.label || "Select Algorithm"}
          </Text>
          <Ionicons
            name={showAlgorithmDropdown ? "chevron-up-outline" : "chevron-down-outline"}
            size={16}
            color="#6366F1"
          />
        </TouchableOpacity>
        {showAlgorithmDropdown && (
          <View style={styles.algorithmDropdownOverlay}>
            <ScrollView style={{ maxHeight: 160 }}>
              {algorithmOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.algorithmDropdownItem, selectedAlgorithm === option.value && styles.algorithmDropdownItemSelected]}
                  onPress={() => {
                    setSelectedAlgorithm(option.value);
                    setShowAlgorithmDropdown(false);
                    if (route.length >= 2) fetchRouteDetails(route[1].latitude, route[1].longitude, option.value);
                  }}
                >
                  <Text style={[styles.algorithmDropdownItemText, selectedAlgorithm === option.value && styles.algorithmDropdownItemTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Locations: Origin and Destination */}
      <View style={styles.locationsContainer}>
        <Text style={styles.label}>From</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.userInput}
            placeholder="Type Here..."
            value={origin}
            onChangeText={handleOriginChange}
          />
          {origin !== "" && (
            <TouchableOpacity style={styles.clearButton} onPress={clearOrigin}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
          <SuggestionList suggestions={originSuggestions} onSelect={selectOriginSuggestion} />
        </View>
        <Text style={styles.label}>To</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.userInput}
            placeholder="Type Here..."
            value={destination}
            onChangeText={handleDestinationChange}
          />
          {destination !== "" && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setDestination("")}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
          <SuggestionList suggestions={destinationSuggestions} onSelect={selectDestinationSuggestion} />
        </View>
      </View>

      {/* Loading Indicator */}
      {isRouteLoading && (
        <ActivityIndicator size="small" color="#6366F1" style={{ marginVertical: 12 }} />
      )}

      {/* Route Metrics */}
      {route.length >= 2 && routeMetrics && !isRouteLoading && (
        <View style={styles.routeMetricsContainer}>
          <Text style={styles.subHeader}>Route Metrics</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.metricCard}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#44457D" />
              <Text style={styles.metricText}>Distance: {routeMetrics.distance} km</Text>
            </View>
            <View style={styles.metricCard}>
              <FontAwesome5 name="money-bill-wave" size={16} color="#44457D" />
              <Text style={styles.metricText}>Fare: {routeMetrics.fare}</Text>
            </View>
            <View style={styles.metricCard}>
              <FontAwesome5 name="clock" size={16} color="#44457D" />
              <Text style={styles.metricText}>Time: {routeMetrics.carTime}</Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Route Overview */}
      {route.length >= 2 && !isRouteLoading ? (
        <View style={styles.routeOverviewContainer}>
          <Text style={styles.subHeader}>Route Overview</Text>
          {renderRouteOverview()}
          <TouchableOpacity
            style={styles.experiencesButton}
            onPress={() => router.push({
              pathname: "/postsuggestions",
              params: {
                location: encodeURIComponent(origin),
                destination: encodeURIComponent(destination),
                origin_lat: route[0].latitude.toString(),
                origin_lon: route[0].longitude.toString(),
                destination_lat: route[1].latitude.toString(),
                destination_lon: route[1].longitude.toString(),
              },
            })}
          >
            <Text style={styles.experiencesButtonText}>Experiences</Text>
          </TouchableOpacity>
        </View>
      ) : !isRouteLoading ? (
        <Text style={styles.errorText}>Search for your location and destination.</Text>
      ) : null}
    </View>
  );

  const renderRestaurantsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.text}>Nearby Dining Spots</Text>
      <View style={styles.spotLimitContainer}>
        <Text style={styles.spotLimitLabel}>Show:</Text>
        {[10, 20, 50].map((limit) => (
          <TouchableOpacity
            key={limit}
            style={[styles.spotLimitButton, spotLimit === limit && styles.activeSpotLimitButton]}
            onPress={() => setSpotLimit(limit)}
            activeOpacity={0.7} // Added for visual feedback
          >
            <Text style={[styles.spotLimitButtonText, spotLimit === limit && styles.activeSpotLimitButtonText]}>
              {limit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {(route[0] || route[1]) && (
        <View style={styles.locationTypeContainer}>
          <Text style={styles.locationTypeLabel}>Show dining spots near:</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentButton, selectedLocationType === "origin" && styles.activeSegment]}
              onPress={() => setSelectedLocationType("origin")}
              disabled={!route[0]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedLocationType === "origin" && styles.activeSegmentText,
                  !route[0] && styles.disabledSegmentText,
                ]}
              >
                Origin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, selectedLocationType === "destination" && styles.activeSegment]}
              onPress={() => setSelectedLocationType("destination")}
              disabled={!route[1]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedLocationType === "destination" && styles.activeSegmentText,
                  !route[1] && styles.disabledSegmentText,
                ]}
              >
                Destination
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {selectedLocationCoords ? (
        <View style={styles.restaurantsPreview}>
          {nearbyRestaurants.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantsScroll}>
              {nearbyRestaurants.slice(0, 5).map((restaurant, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.restaurantCard}
                  onPress={() => setRestaurantModalVisible(true)}
                >
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                  <Text style={styles.restaurantCuisine} numberOfLines={1}>
                    {formatCuisine(restaurant.cuisine)}
                  </Text>
                  <Text style={styles.restaurantDistance}>
                    {restaurant.distance?.toFixed(2)} km
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noResultsText}>No dining spots found near {selectedLocationType}</Text>
          )}
          <TouchableOpacity style={styles.seeAllButton} onPress={() => setRestaurantModalVisible(true)}>
            <Text style={styles.seeAllText}>See All Dining Spots</Text>
            <Ionicons name="chevron-forward" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.promptText}>Enter an origin/destination to view nearby dining spots</Text>
      )}
    </View>
  );

  const renderAttractionsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.text}>Nearby Attractions</Text>
      <View style={styles.spotLimitContainer}>
        <Text style={styles.spotLimitLabel}>Show:</Text>
        {[10, 20, 50].map((limit) => (
          <TouchableOpacity
            key={limit}
            style={[styles.spotLimitButton, spotLimit === limit && styles.activeSpotLimitButton]}
            onPress={() => setSpotLimit(limit)}
            activeOpacity={0.7}
          >
            <Text style={[styles.spotLimitButtonText, spotLimit === limit && styles.activeSpotLimitButtonText]}>
              {limit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {(route[0] || route[1]) && (
        <View style={styles.locationTypeContainer}>
          <Text style={styles.locationTypeLabel}>Show attractions near:</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentButton, selectedLocationType === "origin" && styles.activeSegment]}
              onPress={() => setSelectedLocationType("origin")}
              disabled={!route[0]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedLocationType === "origin" && styles.activeSegmentText,
                  !route[0] && styles.disabledSegmentText,
                ]}
              >
                Origin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, selectedLocationType === "destination" && styles.activeSegment]}
              onPress={() => setSelectedLocationType("destination")}
              disabled={!route[1]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedLocationType === "destination" && styles.activeSegmentText,
                  !route[1] && styles.disabledSegmentText,
                ]}
              >
                Destination
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {selectedLocationCoords ? (
        nearbySpots.length > 0 ? (
          <View style={styles.attractionsPreview}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attractionsScroll}>
              {nearbySpots.slice(0, 5).map((spot, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.attractionCardPreview}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: spot.image_url || "https://via.placeholder.com/150.png?text=No+Image" }}
                    style={styles.attractionImagePreview}
                  />
                  <Text style={styles.attractionNamePreview} numberOfLines={1}>
                    {spot.name}
                  </Text>
                  <Text style={styles.attractionDistance}>
                    {spot.distance?.toFixed(2)} km
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.seeAllText}>See All Attractions</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366F1" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noResultsText}>No attractions found near {selectedLocationType}</Text>
        )
      ) : (
        <Text style={styles.promptText}>Enter an origin/destination to view nearby attractions</Text>
      )}
    </View>
  );

  const detailsContent = (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TabButton title="Route" isActive={activeTab === "Route"} onPress={() => setActiveTab("Route")} />
        <TabButton title="Dining" isActive={activeTab === "Dining"} onPress={() => setActiveTab("Dining")} />
        <TabButton title="Attractions" isActive={activeTab === "Attractions"} onPress={() => setActiveTab("Attractions")} />
      </View>
      {activeTab === "Route" && renderRouteTab()}
      {activeTab === "Dining" && renderRestaurantsTab()}
      {activeTab === "Attractions" && renderAttractionsTab()}
    </View>
  );
  // Render different layouts based on route length while updating MapComponent with new restaurant props
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.mapWrapper}>
        <MapComponent
          key={`map-${mapResetKey}-${nearbyRestaurants.length}`}
          initialRegion={region}
          route={route}
          roadPath={roadPath}
          mapResetKey={mapResetKey}
          style={styles.map}
          polylineColor={polylineColor}
          webviewRef={webviewRef}
          nearbySpots={activeTab === "Attractions" ? nearbySpots : []} // Only show attractions when tab is active
          selectedSpot={selectedSpot}
          isLoading={isRouteLoading}
          nearbyRestaurants={activeTab === "Dining" ? nearbyRestaurants : []}
          onRestaurantClick={(name) => {
            const restaurant = nearbyRestaurants.find((r) => r.name === name);
            if (restaurant) {
              setSelectedRestaurant(restaurant);
              setRestaurantModalVisible(true);
            }
          }}
          onSpotClick={(spotName) => {
            setScrollToSpot(spotName);
            setModalVisible(true);
          }}
        />
        {isRouteLoading && <ActivityIndicator style={styles.loadingIndicator} size="large" color="#6366F1" />}
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={1}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        backgroundComponent={({ style }) => <View style={[style, { backgroundColor: "#FFFFFF", borderRadius: 20 }]} />}
        handleComponent={CustomHandle}
      >
        <BottomSheetScrollView
          nestedScrollEnabled
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {detailsContent}
          <ModalComponent
            visible={restaurantModalVisible}
            onClose={() => setRestaurantModalVisible(false)}
            restaurants={nearbyRestaurants}
            onView={(restaurant) => {
              webviewRef.current?.injectJavaScript(
                `if (window.map) { window.map.flyTo([${restaurant.latitude}, ${restaurant.longitude}], 16, { animate: true, duration: 2 }); }`
              );
              setRestaurantModalVisible(false);
            }}
            onGoHere={(restaurant) => {
              setDestination(restaurant.address || restaurant.name);
              const newDestination = { latitude: restaurant.latitude, longitude: restaurant.longitude };
              setRoadPath([]);
              const currentOrigin = route.length > 0 ? route[0] : { latitude: region.latitude, longitude: region.longitude };
              setRoute([currentOrigin, newDestination]);
              fetchRouteDetails(newDestination.latitude, newDestination.longitude, selectedAlgorithm);
              setRestaurantModalVisible(false);
            }}
          />
          <ReviewModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            originCoords={route.length > 0 ? route[0] : undefined}
            destinationCoords={route.length > 1 ? route[1] : undefined}
            nearbySpots={nearbySpots}
            scrollToSpot={scrollToSpot}
            onSpotsFetched={(spots) => setNearbySpots(spots)}
            onSpotSelect={(selectedSpot) => {
              setNearbySpots([]);
              setDestination(selectedSpot.name);
              const newDestination = { latitude: selectedSpot.latitude, longitude: selectedSpot.longitude };
              setRoadPath([]);
              const currentOrigin = route.length > 0 ? route[0] : { latitude: region.latitude, longitude: region.longitude };
              setRoute([currentOrigin, newDestination]);
              fetchRouteDetails(newDestination.latitude, newDestination.longitude, selectedAlgorithm);
              setModalVisible(false);
              setSelectedSpot(newDestination);
            }}
            onSpotView={(selectedSpot) => {
              setSelectedSpot({ latitude: selectedSpot.latitude, longitude: selectedSpot.longitude });
              setModalVisible(false);
            }}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default RouteScreen;


const CustomHandle = () => (
  <View style={styles.customHandle}>
    <View style={styles.handleIndicator} />
  </View>
);

// -------------------------
// Styles
// -------------------------
const styles = StyleSheet.create({
  getOnOffContainer: {
    marginTop: 8,
    marginBottom: 6,
  },
  onOffTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  onOffInstruction: {
    fontSize: 12,
    color: "#374151",
    marginTop: 2,
    lineHeight: 18,
  },
  alternativesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  alternativeHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  alternativeText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 18,
  },
  tabContent: { padding: 16 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  routeTypeContainer: { marginBottom: 8 },
  subHeader: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },
  algorithmDropdownButton: { flexDirection: "row", alignItems: "center", padding: 8, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8 },
  locationsContainer: { marginBottom: 8 },
  label: { fontSize: 14, marginBottom: 4 },
  searchContainer: { marginBottom: 8 },
  userInput: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 8 },
  routeMetricsContainer: { marginBottom: 8 },
  metricCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", padding: 8, borderRadius: 8, marginRight: 8 },
  metricText: { marginLeft: 4, fontSize: 12, color: "#44457D" },
  routeOverviewContainer: { marginBottom: 12 },
  timelineContainer: { marginTop: 8 },
  timelineItem: { flexDirection: "row", marginBottom: 12 },
  timelineIcon: { width: 32, alignItems: "center" },
  timelineContent: { flex: 1, paddingLeft: 12 },
  segmentHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  segmentLabel: { fontSize: 14, fontWeight: "500", color: "#111827" },
  segmentDetails: { marginTop: 8 },
  segmentText: { fontSize: 12, color: "#374151", marginBottom: 4 },
  stepText: { fontSize: 12, color: "#374151" },
  experiencesButton: { backgroundColor: "#E0E7FF", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 12 },
  experiencesButtonText: { color: "#6366F1", fontSize: 14, fontWeight: "500" },
  errorText: { fontSize: 14, color: "#666", textAlign: "center" },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#44457D",
    marginTop: 2,
  },
  attractionDistance: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  bottomSheetContent: {
    padding: 16,
    paddingBottom: 32,
  },
  maincontainer: { width: "100%", backgroundColor: "#FFFFFF" },
  detailsContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  contentContainer: {
    padding: 16,
  },
  mapContainer: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    width: "100%",
    marginTop: 15,
  },
  mapWrapper: {
    ...StyleSheet.absoluteFillObject, // Fill the screen
    zIndex: 0,
  },
  map: {
    flex: 1,
  },
  text: { color: "#44457D", fontWeight: "500", fontSize: 16 },
  container: { padding: 15, marginBottom: 20 },
  inputContainer: { width: "100%" },
  clearButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  loadingIndicator: {
    position: "absolute",
    right: 40,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 11,
  },
  suggestionList: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 10,
    borderRadius: 8,
    elevation: 4,
    maxHeight: 250
  },
  suggestionItem: {
    padding: 12, // Increased padding for better touch target.
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  suggestionText: {
    color: "#444",
  },
  topInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 18,
  },
  infoBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F6FF",
    borderRadius: 8,
    padding: 10,
    width: 65,
  },
  infoBoxLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#44457D",
    marginTop: 4,
    textAlign: "center",
  },
  routecontainer: {
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    marginTop: 18,
    marginBottom: 100,
  },
  routeOverviewText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 18,
  },
  overviewText: {
    fontSize: 12,
    color: "#44457D",
    marginVertical: 4,
    textAlign: "center",
  },
  oopsContainer: { alignItems: "center", padding: 16, marginBottom: 30 },
  illustration: { width: 150, height: 120, marginBottom: 10 },
  errorSubText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginHorizontal: 20,
  },
  segmentCard: {
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  segmentCardHeaderText: { fontSize: 12, fontWeight: "bold", color: "#111827" },
  segmentCardBody: { padding: 10 },
  stepsContainer: { marginTop: 6, marginLeft: 6 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  bulletIcon: {
    marginRight: 6,
    fontSize: 14,
    color: "#6366F1",
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: "#E0E7FF",
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { fontSize: 12, color: "#6366F1", fontWeight: "500" },
  restaurantMarker: { backgroundColor: "#fff", borderColor: "#dc3545" },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginTop: 10,
    alignSelf: "center",
    width: "50%",
  },
  customHandle: {
    alignItems: 'center',
    paddingVertical: 16, // Increased vertical padding for a larger touch area
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  handleIndicator: {
    width: 60,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
  },
  algorithmDropdownButtonText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "bold",
    flexShrink: 1,
  },
  algorithmDropdownOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    backgroundColor: "#fff", // Already set, ensuring it’s opaque
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    width: 150,
    maxHeight: 160,
    paddingVertical: 5,
    zIndex: 1000, // Added to ensure it’s on top
    ...Platform.select({ android: { elevation: 10000 } }),
  },
  algorithmDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  algorithmDropdownItemSelected: {
    backgroundColor: "#6366F1",
    borderBottomColor: "#6366F1",
  },
  algorithmDropdownItemText: {
    fontSize: 12,
    color: "#374151",
    flexWrap: "wrap",
  },
  algorithmDropdownItemTextSelected: { color: "#fff" },
  locationTypeContainer: {
    marginVertical: 12,
  },
  locationTypeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeSegment: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeSegmentText: {
    color: '#6366F1',
    fontWeight: '500',
  },
  disabledSegmentText: {
    color: '#D1D5DB',
  },
  restaurantsPreview: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  restaurantsScroll: {
    paddingRight: 16,
  },
  restaurantCard: {
    width: 180, // Slightly wider for better layout
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantDistance: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  restaurantName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 10,
    color: '#6B7280',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  seeAllText: {
    color: '#6366F1',
    fontSize: 12,
    marginRight: 4,
  },
  noResultsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
  promptText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
  },
  tabContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#F3F4F6" },
  activeTab: { backgroundColor: "#6366F1" },
  tabText: { color: "#6B7280", fontWeight: "500" },
  activeTabText: { color: "#FFFFFF" },
  spotLimitContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  spotLimitLabel: { fontSize: 12, color: "#6B7280", marginRight: 8 },
  spotLimitButton: {
    paddingHorizontal: 12, // Already decent, could increase to 16 if needed
    paddingVertical: 8,   // Increased from 6 for better touch area
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  activeSpotLimitButton: { backgroundColor: "#6366F1" },
  spotLimitButtonText: { fontSize: 12, color: "#6B7280" },
  activeSpotLimitButtonText: { color: "#FFFFFF" },
  attractionCard: { marginBottom: 20, borderWidth: 1, borderColor: "#C7D2FE", borderRadius: 8, padding: 10, backgroundColor: "#FBFCFF" },
  attractionImage: { height: 200, width: "100%", borderRadius: 10, marginBottom: 10 },
  attractionName: { fontSize: 18, fontWeight: "bold", color: "#44457D", marginBottom: 5 },
  attractionDescription: { fontSize: 12, color: "#686A9C", marginBottom: 10 },
  actionButtonsContainer: { flexDirection: "row", gap: 8, marginVertical: 8, justifyContent: "space-between" },
  viewButton: { flexDirection: "row", alignItems: "center", gap: 6, padding: 12, backgroundColor: "#EFF6FF", borderRadius: 8, flex: 1 },
  viewText: { color: "#3B82F6", fontWeight: "500" },
  goHereButton: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, backgroundColor: "#EFF6FF", borderRadius: 8, flex: 1 },
  goHereText: { color: "#3B82F6", fontWeight: "500" },
  scrollContent: { paddingBottom: 20 },
  attractionsPreview: {
    marginVertical: 12,
  },
  attractionsScroll: {
    paddingRight: 16,
  },
  attractionCardPreview: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  attractionImagePreview: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
  },
  attractionNamePreview: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
});
