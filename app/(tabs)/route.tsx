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
  const [selectedLocationType, setSelectedLocationType] = useState<"origin" | "destination">("origin");
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<LatLng | null>(null);
  const navigation = useNavigation();
  const [nearbySpots, setNearbySpots] = useState<NearbySpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<LatLng | null>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<
    Array<{
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
    { label: "Best", value: "best" },
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
  useEffect(() => {
    if (selectedLocationType === 'origin' && route[0]) {
      setSelectedLocationCoords(route[0]);
    } else if (selectedLocationType === 'destination' && route[1]) {
      setSelectedLocationCoords(route[1]);
    } else {
      setSelectedLocationCoords(null);
    }
  }, [selectedLocationType, route]);

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

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { y } = event.nativeEvent.contentOffset;
    const { height: layoutHeight } = event.nativeEvent.layoutMeasurement;
    const contentHeight = event.nativeEvent.contentSize.height;
    const tolerance = 500; // Increased tolerance

    // Prevent snapping if content isn't scrollable
    if (contentHeight <= layoutHeight + tolerance) {
      return;
    }

    // Snap to top if near the top
    if (y <= tolerance) {
      bottomSheetRef.current?.snapToIndex(0);
    }
    // Snap to bottom if near the bottom
    // else if (y + layoutHeight >= contentHeight - tolerance) {
    //   bottomSheetRef.current?.snapToIndex(2);
    // }
  };

  // --- NEW: Fix for "View" error in Restaurant Modal ---
  const handleViewRestaurant = (lat: number, lng: number) => {
    if (webviewRef.current) {
      const js = `
        if (window.map) {
          window.map.flyTo([${lat}, ${lng}], 16, { animate: true, duration: 2 });
        }
      `;
      webviewRef.current.injectJavaScript(js);
    }
  };

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

  const fetchRestaurants = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        "https://comgu20-production.up.railway.app/api/sustenance",
        {
          params: {
            lat,
            lon,
            radius: 3,
            sort: "furthest",
            amenity:
              "cafe,restaurant,fast_food,pub,bar,ice_cream,food_court,biergarten",
            page: 1,
            per_page: 20,
          },
        }
      );
      const mapped = response.data.results.map((item: any) => ({
        name: item.name || "Unnamed Restaurant",
        latitude: item.coordinates?.lat || 0,
        longitude: item.coordinates?.lon || 0,
        amenity: item.amenity || "Restaurant",
        cuisine: item.metadata?.cuisine || "Various",
        address: item.address?.full_address || "Address not available",
        opening_hours: item.metadata?.opening_hours || "Hours not specified",
        phone: item.metadata?.contact?.phone,
        website: item.metadata?.contact?.website,
        image_url: item.metadata?.contact?.website,
      }));
      setNearbyRestaurants(mapped);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setNearbyRestaurants([]);
    }
  };

  useEffect(() => {
    if (selectedLocationCoords) {
      console.log("Fetching restaurants for:", selectedLocationType, selectedLocationCoords);
      fetchRestaurants(selectedLocationCoords.latitude, selectedLocationCoords.longitude);
    }
  }, [selectedLocationCoords]);

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
    setDestination("");
    setDestinationSuggestions([]);
    setRoute([]);
    setRouteDetails({ route: null });
    setRoadPath([]);
    setNearbySpots([]);
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

  const fetchRouteDetails = async (
    destLat: number,
    destLon: number,
    algorithm: string
  ) => {
    setIsRouteLoading(true);
    setNearbySpots([]);
    setSelectedSpot(null);
    setRoadPath([]);
    const params = {
      origin_lat: route.length > 0 ? route[0].latitude : region.latitude,
      origin_lon: route.length > 0 ? route[0].longitude : region.longitude,
      destination_lat: destLat,
      destination_lon: destLon,
      algorithm: algorithm,
    };
    console.log("Request Params:", params);
    try {
      const response = await axios.get<ApiResponse>(
        "https://comgu20-production.up.railway.app/api/routes/find",
        { params }
      );

      // Update nearby spots only if new data contains them
      if (response.data.nearby_spots) {
        setNearbySpots(response.data.nearby_spots);
      }
      const processedPosts = response.data.posts.map((post) => ({
        ...post,
        origin_address: origin,
        destination_address: destination,
        origin_lat: region.latitude,
        origin_lon: region.longitude,
        destination_lat: destLat,
        destination_lon: destLon,
        user: { ...post.user, email: post.user.email || "" },
      }));
      processedPosts.forEach((p) => {
        // addPost context functionality
      });
      const routeData = response.data.route;
      setRouteDetails({ route: routeData });
      if (routeData && routeData.summary) {
        const summary = routeData.summary;
        const formattedDuration = formatDuration(summary.total_duration);
        let totalWalkingDistance = 0;
        let busDuration = 0;
        if (routeData.segments && routeData.segments.length > 0) {
          routeData.segments.forEach((segment) => {
            const segType = segment.type.toLowerCase();
            if (segType === "walking" && segment.distance) {
              totalWalkingDistance += segment.distance;
            }
            if (
              ["bus", "jeep", "ejeep", "lrt", "mrt"].includes(segType) &&
              segment.duration
            ) {
              busDuration += segment.duration;
            }
          });
        }
        const busFormattedDuration = busDuration
          ? formatDuration(busDuration)
          : "";
        setRouteMetrics({
          distance: summary.total_distance_km || 0,
          fare: summary.total_fare || 0,
          walkingTime: totalWalkingDistance
            ? `${(totalWalkingDistance / 1000).toFixed(2)} km`
            : "",
          carTime: formattedDuration,
          busTime: busFormattedDuration,
        });
      } else {
        setRouteMetrics(null);
      }
      if (routeData && routeData.segments && routeData.segments.length > 0) {
        const allWalking = routeData.segments.every((seg) => seg.walking);
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
          .filter((segment) => segment.geometry)
          .map((segment) => {
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
    if (isRouteLoading) {
      return <ActivityIndicator size="small" color="#6366F1" />;
    }
    if (!routeDetails.route) {
      return (
        <Text style={styles.overviewText}>No route overview available</Text>
      );
    }
    const { segments } = routeDetails.route;
    return (
      <View>
        {segments &&
          segments.map((segment, idx) => {
            const segType = segment.type.toLowerCase();
            const segLabel = getSegmentLabel(
              segType,
              segment.from_stop?.name,
              segment.to_stop?.name,
              segment.vehicle_type
            );
            const isExpanded = expandedSegments[idx];
            return (
              <View key={idx} style={styles.segmentCard}>
                <TouchableOpacity
                  style={styles.segmentHeaderRow}
                  onPress={() => handleToggleSegment(idx)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isExpanded ? "chevron-down" : "chevron-forward"}
                    size={18}
                    color="#6366F1"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.segmentCardHeaderText}>{segLabel}</Text>
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.segmentCardBody}>
                    {segType === "walking" && (
                      <>
                        <Text
                          style={[
                            styles.onOffInstruction,
                            { marginVertical: 4 },
                          ]}
                        >
                          From: {segment.from_stop?.name} to{" "}
                          {segment.to_stop?.name}
                        </Text>
                        {segment.steps && segment.steps.length > 0 ? (
                          <View style={styles.stepsContainer}>
                            {segment.steps.map((step, stepIdx) => (
                              <View key={stepIdx} style={styles.stepRow}>
                                <Text style={styles.bulletIcon}>•</Text>
                                <Text style={styles.stepText}>
                                  {step.instruction}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text style={styles.stepText}>
                            No walking steps available.
                          </Text>
                        )}
                      </>
                    )}
                    {["jeep", "bus", "ejeep", "lrt", "mrt"].includes(
                      segType
                    ) && (
                        <>
                          <View style={styles.getOnOffContainer}>
                            <Text style={[styles.onOffTitle, { color: "green" }]}>
                              Get on
                            </Text>
                            <Text style={styles.onOffInstruction}>
                              Ride a{" "}
                              {segment.vehicle_type
                                ? segment.vehicle_type.toLowerCase()
                                : segType}{" "}
                              from {segment.from_stop?.name} going towards{" "}
                              {segment.to_stop?.name}.
                            </Text>
                            <Text
                              style={[
                                styles.onOffTitle,
                                { color: "blue", marginTop: 8 },
                              ]}
                            >
                              Get off
                            </Text>
                            <Text style={styles.onOffInstruction}>
                              Arrive at {segment.to_stop?.name}, then get off at
                              your stop.
                            </Text>
                          </View>
                        </>
                      )}
                    {segment.alternatives &&
                      segment.alternatives.length > 0 && (
                        <View style={styles.alternativesContainer}>
                          <Text style={styles.alternativeHeader}>
                            Alternative Routes:
                          </Text>
                          {segment.alternatives.map((alt, altIdx) => {
                            const routeName = alt.route_name
                              ? alt.route_name.split("-")[0]
                              : "";
                            return (
                              <Text key={altIdx} style={styles.alternativeText}>
                                • {alt.type} {routeName}
                              </Text>
                            );
                          })}
                        </View>
                      )}
                  </View>
                )}
              </View>
            );
          })}
      </View>
    );
  };
  const renderRouteTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.text}>Route Details</Text>
      <View style={styles.dropdownContainer}>
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
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
        {showAlgorithmDropdown && (
          <View style={[styles.algorithmDropdownOverlay, { zIndex: 10001 }]}>
            <ScrollView style={{ maxHeight: 160 }}>
              {algorithmOptions.map((option, index) => {
                const isSelected = selectedAlgorithm === option.value;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.algorithmDropdownItem, isSelected && styles.algorithmDropdownItemSelected]}
                    onPress={() => {
                      setSelectedAlgorithm(option.value);
                      setShowAlgorithmDropdown(false);
                      if (route.length >= 2) {
                        const dest = route[1];
                        fetchRouteDetails(dest.latitude, dest.longitude, option.value);
                      }
                    }}
                  >
                    <Text
                      style={[styles.algorithmDropdownItemText, isSelected && styles.algorithmDropdownItemTextSelected]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
      <Text style={styles.label}>From</Text>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.userInput}
            placeholder="Type Here..."
            placeholderTextColor="#666"
            value={origin}
            onChangeText={handleOriginChange}
            multiline={false}
          />
          {isOriginLoading && <ActivityIndicator style={styles.loadingIndicator} size="small" color="#6366F1" />}
          {origin !== "" && (
            <TouchableOpacity style={styles.clearButton} onPress={clearOrigin}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <SuggestionList suggestions={originSuggestions} onSelect={selectOriginSuggestion} />
      </View>
      <Text style={styles.label}>To</Text>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.userInput}
            placeholder="Type Here..."
            placeholderTextColor="#666"
            value={destination}
            onChangeText={handleDestinationChange}
            multiline={false}
          />
          {isDestinationLoading && <ActivityIndicator style={styles.loadingIndicator} size="small" color="#6366F1" />}
          {destination !== "" && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setDestination("");
                setNearbySpots([]);
                setNearbyRestaurants([]);
                setDestinationSuggestions([]);
                setRoute((prev) => (prev.length > 0 ? [prev[0]] : []));
                setRouteDetails({ route: null });
                setRoadPath([]);
                setMapResetKey(Date.now());
              }}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <SuggestionList suggestions={destinationSuggestions} onSelect={selectDestinationSuggestion} />
      </View>
      {route.length >= 2 && routeMetrics && (
        <View style={styles.topInfoRow}>
          <View style={styles.infoBox}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#44457D" />
            <Text style={styles.infoBoxLabel}>{routeMetrics.distance} km</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome5 name="money-bill-wave" size={16} color="#44457D" />
            <Text style={styles.infoBoxLabel}>Fare: {routeMetrics.fare}</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome5 name="walking" size={16} color="#44457D" />
            <Text style={styles.infoBoxLabel}>{routeMetrics.walkingTime}</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome5 name="car" size={16} color="#44457D" />
            <Text style={styles.infoBoxLabel}>{routeMetrics.carTime}</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome5 name="bus" size={16} color="#44457D" />
            <Text style={styles.infoBoxLabel}>{routeMetrics.busTime}</Text>
          </View>
        </View>
      )}
      {route.length >= 2 ? (
        <View style={styles.routecontainer}>
          <Text style={styles.routeOverviewText}>Route Overview</Text>
          {renderRouteOverview()}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={() => setActiveTab("Restaurants")}>
              <Text style={styles.buttonText}>Restaurants</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.buttonText}>Attractions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                router.push({
                  pathname: "/postsuggestions",
                  params: {
                    location: encodeURIComponent(origin),
                    destination: encodeURIComponent(destination),
                    origin_lat: route[0].latitude.toString(),
                    origin_lon: route[0].longitude.toString(),
                    destination_lat: route[1].latitude.toString(),
                    destination_lon: route[1].longitude.toString(),
                  },
                });
              }}
            >
              <Text style={styles.buttonText}>Experiences</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.oopsContainer}>
          <Image source={require("../../assets/images/opz.png")} style={styles.illustration} resizeMode="contain" />
          <Text style={styles.errorText}>Oops!</Text>
          <Text style={styles.errorSubText}>Search for your location and destination.</Text>
        </View>
      )}
    </View>
  );

  const renderRestaurantsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.text}>Nearby Restaurants</Text>
      {(route[0] || route[1]) && (
        <View style={styles.locationTypeContainer}>
          <Text style={styles.locationTypeLabel}>Show restaurants near:</Text>
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
                    {restaurant.cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noResultsText}>No restaurants found near {selectedLocationType}</Text>
          )}
          <TouchableOpacity style={styles.seeAllButton} onPress={() => setRestaurantModalVisible(true)}>
            <Text style={styles.seeAllText}>See All Restaurants</Text>
            <Ionicons name="chevron-forward" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.promptText}>Enter an origin/destination to view nearby restaurants</Text>
      )}
    </View>
  );

  const renderAttractionsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.text}>Nearby Attractions</Text>
      {nearbySpots.length > 0 ? (
        <AttractionsList
          nearbySpots={nearbySpots}
          onSpotSelect={(spot) => {
            setDestination(spot.name);
            const newDestination = { latitude: spot.latitude, longitude: spot.longitude };
            setRoadPath([]);
            const currentOrigin = route.length > 0 ? route[0] : { latitude: region.latitude, longitude: region.longitude };
            setRoute([currentOrigin, newDestination]);
            fetchRouteDetails(newDestination.latitude, newDestination.longitude, selectedAlgorithm);
            setActiveTab("Route"); // Switch back to Route tab
          }}
          onSpotView={(spot) => {
            setSelectedSpot({ latitude: spot.latitude, longitude: spot.longitude });
          }}
        />
      ) : (
        <Text style={styles.promptText}>No nearby attractions found.</Text>
      )}
    </View>
  );
  const detailsContent = (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TabButton title="Route" isActive={activeTab === "Route"} onPress={() => setActiveTab("Route")} />
        <TabButton title="Restaurants" isActive={activeTab === "Restaurants"} onPress={() => setActiveTab("Restaurants")} />
        <TabButton title="Attractions" isActive={activeTab === "Attractions"} onPress={() => setActiveTab("Attractions")} />
      </View>
      {activeTab === "Route" && renderRouteTab()}
      {activeTab === "Restaurants" && renderRestaurantsTab()}
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
          nearbySpots={nearbySpots}
          selectedSpot={selectedSpot}
          isLoading={isRouteLoading}
          nearbyRestaurants={nearbyRestaurants}
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
          {route.length >= 2 && (
            <ReviewModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              originCoords={route[0]}
              destinationCoords={route[1]}
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
          )}
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
  label: { fontSize: 12, fontWeight: "500", color: "#6B7280", marginTop: 10 },
  searchContainer: { position: "relative", width: "100%", marginBottom: 20 },
  inputContainer: { width: "100%" },
  userInput: {
    backgroundColor: "#F5F7FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: "#374151",
    marginVertical: 8,
    paddingRight: 30,
    height: 40,
  },
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
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
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
  segmentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E7FF",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 10,
  },
  segmentCardHeaderText: { fontSize: 12, fontWeight: "bold", color: "#111827" },
  segmentCardBody: { padding: 10 },
  getOnOffContainer: { marginTop: 8 },
  onOffTitle: { fontSize: 13, fontWeight: "600" },
  onOffInstruction: {
    fontSize: 12,
    color: "#374151",
    marginTop: 2,
    lineHeight: 18,
  },
  stepsContainer: { marginTop: 6, marginLeft: 6 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  bulletIcon: {
    marginRight: 6,
    fontSize: 14,
    color: "#6366F1",
    lineHeight: 20,
  },
  stepText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 18 },
  alternativesContainer: {
    marginTop: 8,
    padding: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
  },
  alternativeHeader: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  alternativeText: { fontSize: 12, color: "#374151", marginBottom: 2 },
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
  algorithmDropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E7FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  algorithmDropdownButtonText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "bold",
    flexShrink: 1,
  },
  algorithmDropdownOverlay: {
    position: "absolute",
    top: 40,
    left: 0,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    width: 150,
    maxHeight: 160,
    paddingVertical: 5,
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
  segmentText: {
    fontSize: 12,
    color: '#6B7280',
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
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  tabContent: { paddingHorizontal: 16 },
});
