import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
  KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ReviewModal from "../reviewmodal";
import ModalComponent from "../restaurantmodal";
import { GestureHandlerRootView, } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Region, LatLng, MapComponentProps, Route, SegmentPath, RouteDetails, RouteMetrics, NearbySpot, LocationSuggestion, ApiResponse, Restaurant, Point } from "../../src/types";
import { sleep, formatDuration, shortenAddress, getSegmentLabel } from "../../src/utils/helpers";
import { getMapHTML } from "../../src/utils/getMapHTML";
// import MapComponentMemo from "@/src/components/MapComponent";
import { locationCacheRef } from "@/src/utils/locationsCache";
import SuggestionList from "@/src/components/SuggestionList";
import AttractionsList from "@/src/components/AttractionsList";
import { addWhitelistedNativeProps } from "react-native-reanimated/lib/typescript/ConfigHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapComponentMemo from "@/src/components/MapComponentMemo";
import simplify from 'simplify-js'; // Add this line if missing

const polyline = require("@mapbox/polyline");
interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

const TabButton = React.memo(({ title, isActive, onPress }: TabButtonProps) => (
  <TouchableOpacity style={[styles.tabButton, isActive && styles.activeTab]} onPress={onPress}>
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
));

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
  const [routeDetails, setRouteDetails] = useState<RouteDetails>({ route: null, posts: [] });
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
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
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
  const formatCuisine = (cuisine: string | undefined) => {
    if (!cuisine) return "Not specified";
    return cuisine
      .split(/[_;]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(', ');
  };
  const router = useRouter();
  const [expandedSegments, setExpandedSegments] = useState<{ [index: number]: boolean }>({});
  const webviewRef = useRef<WebView>(null);
  const [activeTab, setActiveTab] = useState("Route");
  const [spotLimit, setSpotLimit] = useState(20);
  const scrollViewRef = useRef<ScrollView>(null);
  const originInputRef = useRef<View>(null);
  const destinationInputRef = useRef<View>(null);
  const [originInputY, setOriginInputY] = useState(0);
  const [destinationInputY, setDestinationInputY] = useState(0);
  const [destinputHeight, setdestInputHeight] = useState(40); // Default height


  useEffect(() => {
    if (originInputRef.current && originSuggestions.length > 0) {
      originInputRef.current.measure((x, y, width, height, pageX, pageY) => {
        setOriginInputY(pageY + height); // Position below the input
      });
    }
    if (destinationInputRef.current && destinationSuggestions.length > 0) {
      destinationInputRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDestinationInputY(pageY + height);
      });
    }
  }, [originSuggestions, destinationSuggestions]);

  const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

  const loadCachedData = async (cacheKey: string) => {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRATION) return data;
    }
    return null;
  };

  const saveToCache = async (cacheKey: string, data: any) => {
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  };

  const memoizedSpots = useMemo(() => nearbySpots, [nearbySpots]);
  const memoizedRestaurants = useMemo(() => nearbyRestaurants, [nearbyRestaurants]);

  const restaurantCache = useRef<{ [key: string]: Restaurant[] }>({});
  const attractionCache = useRef<{ [key: string]: NearbySpot[] }>({});

  // Debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };




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
        // console.error("Error parsing attraction parameter:", error);
      }
    }
  }, [attraction]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (status !== "granted" || !servicesEnabled) {
          // console.log("Location permission not granted or services disabled.");
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
            // console.error("Reverse geocoding error:", error);
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
        // console.error("Geolocation error:", error);
        if (!origin) setOrigin("Current Location");
      } finally {
        setIsOriginLoading(false); // Stop loading indicator
      }
    })();
  }, []);

  const fetchRestaurants = async (lat: number, lon: number, limit: number) => {
    const cacheKey = `${lat},${lon},${limit}`;

    // Step 1: Check in-memory cache first
    if (restaurantCache.current[cacheKey]) {
      setNearbyRestaurants(restaurantCache.current[cacheKey]);
      return;
    }

    // Step 2: Check AsyncStorage cache
    const cachedData = await loadCachedData(cacheKey);
    if (cachedData) {
      const restaurants: Restaurant[] = cachedData; // Type assertion, assuming data is Restaurant[]
      restaurantCache.current[cacheKey] = restaurants; // Store in memory for future use
      setNearbyRestaurants(restaurants);
      return;
    }

    // Step 3: Fetch from API if no cached data is available
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
      const mapped: Restaurant[] = response.data.results.map((item: any) => ({
        id: item.id,
        osm_id: item.osm_id,
        name: item.name || "Unnamed Dining Spot",
        latitude: item.coordinates?.lat || 0,
        longitude: item.coordinates?.lon || 0,
        alt_name: item.alt_name,
        amenity: item.amenity || "Dining Spot",
        address: item.address || {},
        brand: item.brand || {},
        metadata: item.metadata || {},
        contacts: item.contacts || {},
        building: item.building,
        landuse: item.landuse,
        coordinates: item.coordinates || { lat: 0, lon: 0 },
        reverse_geocoded_address: item.reverse_geocoded_address,
        created_at: item.created_at,
        updated_at: item.updated_at,
        distance: item.distance || 0,
      }));
      // Store in both caches
      restaurantCache.current[cacheKey] = mapped;
      setNearbyRestaurants(mapped);
      await saveToCache(cacheKey, mapped); // Persist to AsyncStorage
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setNearbyRestaurants([]);
    }
  };

  const fetchAttractions = useCallback(async (lat: number, lon: number, limit: number) => {
    const cacheKey = `${lat},${lon},${limit}`;
    if (attractionCache.current[cacheKey]) {
      setNearbySpots(attractionCache.current[cacheKey]);
      return;
    }
    try {
      const response = await axios.get('https://comgu20-production.up.railway.app/api/tourist_spots', {
        params: { lat, lon, radius: 5, page: 1, per_page: limit },
      });
      const mapped = response.data.results.map((item: any) => ({
        name: item.tourist_spot || 'Unnamed Attraction',
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        distance: item.distance,
        image_url: item.image_url || 'https://via.placeholder.com/150',
        trivia: item.trivia || 'No trivia available.',
        link: item.link,
        feedbacks: Array.isArray(item.feedbacks)
          ? item.feedbacks
          : typeof item.feedbacks === "string"
            ? item.feedbacks.split(";")
            : [],
        description: item.description
      }));
      attractionCache.current[cacheKey] = mapped;
      setNearbySpots(mapped);
    } catch (error) {
      // console.error('Error fetching attractions:', error);
      setNearbySpots([]);
    }
  }, []);

  useEffect(() => {
    if (route.length >= 2) {
      setMapResetKey(Date.now()); // Only reset when route data is ready
    }
  }, [route]);

  useEffect(() => {
    if (activeTab === "Dining" && selectedLocationCoords) {
      fetchRestaurants(selectedLocationCoords.latitude, selectedLocationCoords.longitude, spotLimit);
    }
  }, [activeTab, selectedLocationCoords, spotLimit]);

  useEffect(() => {
    if (activeTab === "Attractions" && selectedLocationCoords) {
      fetchAttractions(selectedLocationCoords.latitude, selectedLocationCoords.longitude, spotLimit);
    }
  }, [activeTab, selectedLocationCoords, spotLimit]);

  const geocodeAddress = useCallback(async (address: string) => {
    if (locationCacheRef.current[address]) return locationCacheRef.current[address];
    try {
      const { data } = await axios.get(
        'https://comgu20-production.up.railway.app/api/locations/search',
        { params: { term: address } }
      );
      const results = data.map((item: any) => ({
        name: item.label,
        lat: parseFloat(item.latitude),
        lon: parseFloat(item.longitude),
      }));
      locationCacheRef.current[address] = results;
      return results;
    } catch (err) {
      // console.error('Geocoding error:', err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [];
    }
  }, []);

  // Debounced handler for origin changes
  const debouncedHandleOriginChange = useCallback(
    debounce(async (text: string) => {
      if (!text) {
        setOriginSuggestions([]);
        setDestination('');
        setDestinationSuggestions([]);
        setRoute([]);
        setRouteDetails({ route: null, posts: [] });
        setRoadPath([]);
        setIsOriginLoading(false);
        return;
      }
      setIsOriginLoading(true);
      try {
        const suggestions = await geocodeAddress(text);
        setOriginSuggestions(suggestions);
      } catch (error) {
        // console.error('Search failed:', error);
        setOriginSuggestions([]);
      } finally {
        setIsOriginLoading(false);
      }
    }, 300),
    [geocodeAddress]
  );

  const debouncedHandleDestinationChange = useCallback(
    debounce(async (text: string) => {
      if (!text) {
        setDestinationSuggestions([]);
        setIsDestinationLoading(false);
        return;
      }
      setIsDestinationLoading(true);
      try {
        const suggestions = await geocodeAddress(text);
        setDestinationSuggestions(suggestions);
      } catch (error) {
        // console.error('Search failed:', error);
        setDestinationSuggestions([]);
      } finally {
        setIsDestinationLoading(false);
      }
    }, 300),
    [geocodeAddress]
  );

  // Event Handlers
  const handleOriginChange = useCallback((text: string) => {
    setOrigin(text);
    debouncedHandleOriginChange(text);
  }, [debouncedHandleOriginChange]);

  const clearOrigin = useCallback(() => {
    setOrigin('');
    setOriginSuggestions([]);
    setRoute((prev) => (prev.length > 1 ? [prev[1]] : []));
    setRouteDetails({ route: null, posts: [] });
    setRoadPath([]);
    setNearbySpots([]);
    setSelectedLocationType(null);
  }, []);

  const handleDestinationChange = useCallback((text: string) => {
    setDestination(text);
    debouncedHandleDestinationChange(text);
  }, [debouncedHandleDestinationChange]);


  const handleToggleSegment = useCallback((idx: number) => {
    setExpandedSegments((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const handleViewSegment = useCallback((idx: number) => {
    if (webviewRef.current && routeDetails.route?.segments[idx]) {
      const segment = routeDetails.route.segments[idx];
      if (segment.geometry) {
        const coords = polyline.decode(segment.geometry).map((coord: number[]) => ({
          latitude: coord[0],
          longitude: coord[1],
        }));
        const latitudes = coords.map((c: { latitude: any; }) => c.latitude);
        const longitudes = coords.map((c: { longitude: any; }) => c.longitude);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLon = Math.min(...longitudes);
        const maxLon = Math.max(...longitudes);
        webviewRef.current.postMessage(
          JSON.stringify({
            type: 'zoomToSegment',
            bounds: { minLat, maxLat, minLon, maxLon },
            index: idx,
          })
        );
      }
    }
    bottomSheetRef.current?.snapToIndex(0);
  }, [routeDetails.route]);

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
      const { route: routeData, posts } = response.data;
      setRouteDetails({ route: routeData, posts: response.data.posts || [] });
      if (routeData && routeData.summary) {
        const summary = routeData.summary;
        const formattedDuration = formatDuration(summary.total_duration);
        setRouteMetrics({
          duration: summary.total_duration || 0,
          distance: summary.total_distance_km || 0,
          fare: summary.total_fare || 0,
          walkingTime: "",
          carTime: formattedDuration,
          busTime: "",
        });
      } else {
        setRouteMetrics(null);
      }
      if (routeData && routeData.segments && routeData.segments.length > 0) {
        const allWalking = routeData.segments.every((seg: { walking: any; }) => seg.walking);
        setPolylineColor(allWalking ? "#808080" : "#6366F1");

        const segmentsPaths: SegmentPath[] = routeData.segments
          .filter((segment: { geometry: any; }) => segment.geometry)
          .map((segment: { type: string; geometry: any; }) => {
            const color = segment.type.toLowerCase() === "walking" ? "#808080" : "#6366F1";
            const decodedCoords: LatLng[] = polyline.decode(segment.geometry).map((coord: number[]) => ({
              latitude: coord[0],
              longitude: coord[1],
            }));
            const points: Point[] = decodedCoords.map(pt => ({ x: pt.longitude, y: pt.latitude }));
            const simplifiedPoints = simplify(points, 0.00005, true) as unknown as Point[];
            const simplifiedCoords: LatLng[] = simplifiedPoints.map(pt => ({ latitude: pt.y, longitude: pt.x }));
            return { coords: simplifiedCoords, color, type: segment.type }; // Include type here
          });
        setRoadPath(segmentsPaths);
      } else if (response.data.polyline && response.data.polyline.length > 0) {
        const decodedPath: LatLng[] = polyline.decode(response.data.polyline).map((coord: number[]) => ({
          latitude: coord[0],
          longitude: coord[1],
        }));
        const points: Point[] = decodedPath.map(pt => ({ x: pt.longitude, y: pt.latitude }));
        const simplifiedPoints = simplify(points, 0.00005, true) as unknown as Point[];
        const simplifiedPath: LatLng[] = simplifiedPoints.map(pt => ({ latitude: pt.y, longitude: pt.x }));
        setRoadPath(simplifiedPath);
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

  const selectOriginSuggestion = useCallback(async (item: any) => {
    setOrigin(item.name);
    setOriginSuggestions([]);
    setRegion((prev) => ({ ...prev, latitude: item.lat, longitude: item.lon }));
    const newRoute = route.length > 0
      ? [{ latitude: item.lat, longitude: item.lon }, ...route.slice(1)]
      : [{ latitude: item.lat, longitude: item.lon }];
    setRoute(newRoute);
    setManualOrigin(true);
    setMapResetKey(Date.now());
    if (newRoute.length >= 2) {
      await fetchRouteDetails(newRoute[1].latitude, newRoute[1].longitude, selectedAlgorithm);
    }
  }, [route, selectedAlgorithm, fetchRouteDetails]);

  const selectDestinationSuggestion = useCallback(async (item: any) => {
    setDestination(item.name);
    setDestinationSuggestions([]);
    setRoadPath([]);
    setRoute((prev) =>
      prev.length > 0
        ? [prev[0], { latitude: item.lat, longitude: item.lon }]
        : [{ latitude: region.latitude, longitude: region.longitude }, { latitude: item.lat, longitude: item.lon }]
    );
    await fetchRouteDetails(item.lat, item.lon, selectedAlgorithm);
    setMapResetKey(Date.now());
  }, [region, selectedAlgorithm, fetchRouteDetails]);

  const handleExperiencesPress = useCallback(() => {
    router.push({
      pathname: '/postsuggestions',
      params: {
        location: encodeURIComponent(origin),
        destination: encodeURIComponent(destination),
        origin_lat: route[0]?.latitude.toString(),
        origin_lon: route[0]?.longitude.toString(),
        destination_lat: route[1]?.latitude.toString(),
        destination_lon: route[1]?.longitude.toString(),
        posts: JSON.stringify(routeDetails.posts),
      },
    });
  }, [origin, destination, route, routeDetails.posts]);
  // Utility function to shorten stop names
  const shortenStopName = (name: string) => {
    if (!name) return "destination"; // Fallback if no name
    const parts = name.split(","); // Split by comma
    // Take the first part as the primary identifier, trim whitespace
    const primary = parts[0].trim();
    // If the first part is numeric (e.g., "123 Main St"), try the second part if available
    if (/^\d/.test(primary) && parts.length > 1) {
      return parts[1].trim();
    }
    return primary;
  };

  const handleViewStep = (segmentIdx: number, stepIdx: number) => {
    if (webviewRef.current && routeDetails.route?.segments[segmentIdx]) {
      const segment = routeDetails.route.segments[segmentIdx];
      if (segment.geometry && segment.steps && segment.steps.length > 0) {
        const coords = polyline.decode(segment.geometry).map((coord: any[]) => ({
          latitude: coord[0],
          longitude: coord[1],
        }));
        const numSteps = segment.steps.length;
        if (coords.length < numSteps) return;
        const pointsPerStep = Math.floor(coords.length / numSteps);
        const startIdx = stepIdx * pointsPerStep;
        const startCoord = coords[startIdx] || coords[0];
        const instruction = segment.steps[stepIdx].instruction || "Start of step";
        webviewRef.current.postMessage(
          JSON.stringify({
            type: 'zoomToStep',
            latitude: startCoord.latitude,
            longitude: startCoord.longitude,
            instruction: instruction,
          })
        );
      }
    }
  };

  const renderRouteOverview = useCallback(() => {
    if (!routeDetails.route) return (
      <Text style={styles.overviewText}>
        No route available. Please try a different search.
      </Text>
    );

    const { segments } = routeDetails.route;
    return (
      <View style={styles.timelineContainer}>
        <View style={styles.timelineLine} />
        {segments.map((segment: any, idx: number) => {
          const iconName = segment.type === 'walking' ? 'walking' : segment.type === 'bus' ? 'bus' : 'car';
          const isExpanded = expandedSegments[idx];
          const segmentColor = segment.type === 'walking' ? '#64748B' : '#6366F1';

          return (
            <View key={idx} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: segmentColor }]} />

              <View style={styles.segmentCard}>
                {/* Segment Header */}
                <View style={styles.segmentHeader}>
                  <TouchableOpacity
                    style={styles.segmentHeaderContent}
                    onPress={() => handleToggleSegment(idx)}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5
                      name={iconName}
                      size={20}
                      color={segmentColor}
                      style={styles.segmentIcon}
                    />

                    <View style={styles.segmentTextContainer}>
                      <View style={styles.segmentTitleRow}>
                        <Text style={styles.segmentTitle}>
                          {segment.type === 'walking' ? 'Walk' : segment.type.toUpperCase()}
                        </Text>
                        <Text style={styles.segmentDuration}>
                          {formatDuration(segment.duration)}
                        </Text>
                      </View>

                      {segment.type === 'walking' ? (
                        <Text style={styles.segmentSubtitle}>
                          {segment.to_stop?.name && `To ${shortenStopName(segment.to_stop.name)}`}
                        </Text>
                      ) : (
                        <Text style={styles.segmentSubtitle}>
                          {segment.route_name}
                        </Text>
                      )}
                    </View>

                    <Ionicons
                      name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                      size={20}
                      color="#64748B"
                      style={styles.chevronIcon}
                    />
                  </TouchableOpacity>

                  {/* View Button */}
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewSegment(idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.segmentDetails}>
                    {/* Walking Details */}
                    {segment.type === 'walking' ? (
                      <>
                        {/* <View style={styles.detailRow}>
                          <Feather name="map" size={14} color="#64748B" />
                          <Text style={styles.detailText}>
                            {(segment.distance / 1000).toFixed(2)} km
                          </Text>
                        </View> */}
                        <View style={styles.detailGrid}>
                          <View style={styles.detailColumn}>
                            <Text style={styles.detailLabel}>Distance</Text>
                            <Text style={styles.detailValue}>
                              {(segment.distance / 1000).toFixed(2)} km
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.sectionHeading}>Directions</Text>
                        {segment.steps?.map((step: any, stepIdx: number) => (
                          <View key={stepIdx} style={styles.stepRow}>
                            <Text style={styles.stepBullet}>{stepIdx + 1}.</Text>
                            <Text style={[styles.stepText, { flex: 1 }]}>
                              {step.instruction}
                            </Text>
                            <TouchableOpacity
                              style={styles.viewStepButton}
                              onPress={() => handleViewStep(idx, stepIdx)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.viewStepButtonText}>View</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </>
                    ) : (
                      /* Transit Details */
                      <>
                        <View style={styles.detailGrid}>
                          <View style={styles.detailColumn}>
                            <Text style={styles.detailLabel}>Fare</Text>
                            <Text style={styles.detailValue}>
                              ₱{segment.fare || 'Free'}
                            </Text>
                          </View>
                          <View style={styles.detailColumn}>
                            <Text style={styles.detailLabel}>Distance</Text>
                            <Text style={styles.detailValue}>
                              {(segment.distance / 1000).toFixed(2)} km
                            </Text>
                          </View>
                        </View>

                        <View style={styles.boardingSection}>
                          <View style={styles.boardingRow}>
                            <MaterialCommunityIcons
                              name="arrow-up-circle"
                              size={16}
                              color="#10B981"
                            />
                            <View style={styles.boardingTextContainer}>
                              <Text style={styles.boardingLabel}>Board at</Text>
                              <Text style={styles.boardingValue}>
                                {segment.from_stop?.name || 'Current location'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.boardingRow}>
                            <MaterialCommunityIcons
                              name="arrow-down-circle"
                              size={16}
                              color="#EF4444"
                            />
                            <View style={styles.boardingTextContainer}>
                              <Text style={styles.boardingLabel}>Alight at</Text>
                              <Text style={styles.boardingValue}>
                                {segment.to_stop?.name || 'Destination'}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {segment.alternatives?.length > 0 && (
                          <View style={styles.alternativesContainer}>
                            <Text style={styles.sectionHeading}>
                              Alternative Options
                            </Text>
                            {segment.alternatives.map((alt: any, altIdx: number) => (
                              <View key={altIdx} style={styles.alternativeOption}>
                                <Text style={styles.alternativeText}>
                                  {alt.type} - {alt.route_name}
                                </Text>
                              </View>
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
  }, [routeDetails.route, expandedSegments, handleToggleSegment, handleViewSegment]);


  const metricsData = routeMetrics
    ? [
      { icon: 'map-marker-alt', text: `Distance: ${routeMetrics.distance} km` },
      { icon: 'money-bill-wave', text: `Fare: ${routeMetrics.fare}` },
      { icon: 'clock', text: `Time: ${routeMetrics.carTime}` },
    ]
    : [
      { icon: 'map-marker-alt', text: 'Distance: N/A' },
      { icon: 'money-bill-wave', text: 'Fare: N/A' },
      { icon: 'clock', text: 'Time: N/A' },
    ];

  const renderRouteTab = useCallback(() => (
    <View style={styles.tabContent}>
      <Text style={styles.headerText}>Route Details</Text>

      <View style={styles.routeTypeContainer}>
        <Text style={styles.subHeader}>Select Route Type</Text>
        <TouchableOpacity
          style={styles.algorithmDropdownButton}
          onPress={() => setShowAlgorithmDropdown(!showAlgorithmDropdown)}
          activeOpacity={0.7}
        >
          <Text style={styles.algorithmDropdownButtonText}>
            {algorithmOptions.find((opt) => opt.value === selectedAlgorithm)?.label || 'Select Algorithm'}
          </Text>
          <Ionicons
            name={showAlgorithmDropdown ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={16}
            color='#6366F1'
          />
        </TouchableOpacity>
        {showAlgorithmDropdown && (
          <View style={styles.algorithmDropdownOverlay}>
            {algorithmOptions.map((item, index) => (
              <TouchableOpacity
                key={`${item.value}-${index}`}
                style={[
                  styles.algorithmDropdownItem,
                  selectedAlgorithm === item.value && styles.algorithmDropdownItemSelected,
                ]}
                onPress={() => {
                  setSelectedAlgorithm(item.value);
                  setShowAlgorithmDropdown(false);
                  if (route.length >= 2) {
                    fetchRouteDetails(route[1].latitude, route[1].longitude, item.value);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.algorithmDropdownItemText,
                    selectedAlgorithm === item.value && styles.algorithmDropdownItemTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.locationsContainer}>
        <Text style={styles.subHeader}>From</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.userInput}
            placeholder='Type Here...'
            value={origin}
            onChangeText={handleOriginChange}
          />
          {origin && (
            <TouchableOpacity style={styles.clearButton} onPress={clearOrigin}>
              <Ionicons name='close' size={20} color='#666' />
            </TouchableOpacity>
          )}
          {isOriginLoading && (
            <ActivityIndicator size='small' color='#6366F1' style={styles.loadingIndicator} />
          )}
          <SuggestionList suggestions={originSuggestions} onSelect={selectOriginSuggestion} />
        </View>

        <Text style={styles.subHeader}>To</Text>
        <View style={styles.inputContainer}>

          <TextInput
            value={destination}
            multiline
            textAlignVertical="top" // Keeps text aligned properly
            onChangeText={(value) => {
              handleDestinationChange(value);
              if (value.trim() === "") {
                setdestInputHeight(40); // Reset to normal size when empty
              }
            }}
            onContentSizeChange={(event) => {
              const newHeight = event.nativeEvent.contentSize.height;
              setdestInputHeight(newHeight < 40 ? 40 : newHeight); // Shrink if short, expand if needed
            }}
            style={[styles.userInput, { height: destinputHeight }]}
            placeholder="Where do you want to go?"

          />

          {destination && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setDestination('')}>
              <Ionicons name='close' size={20} color='#666' />
            </TouchableOpacity>
          )}
          {isDestinationLoading && (
            <ActivityIndicator size='small' color='#6366F1' style={styles.loadingIndicator} />
          )}
          <SuggestionList suggestions={destinationSuggestions} onSelect={selectDestinationSuggestion} />
        </View>
      </View>

      {isRouteLoading && <ActivityIndicator size='small' color='#6366F1' style={{ marginVertical: 12 }} />}

      {route.length >= 2 && routeMetrics && !isRouteLoading && (
        <View style={styles.routeMetricsContainer}>
          <Text style={styles.subHeader}>Route Metrics</Text>
          <FlatList
            horizontal
            data={metricsData}
            keyExtractor={(item, index) => `metric-${index}`}
            renderItem={({ item }) => (
              <View style={styles.metricCard}>
                <FontAwesome5 name={item.icon} size={16} color='#44457D' />
                <Text style={styles.metricText}>{item.text}</Text>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {route.length >= 2 && !isRouteLoading ? (
        <View style={styles.routeOverviewContainer}>
          <Text style={styles.subHeader}>Route Overview</Text>
          {renderRouteOverview()}

          <Text style={styles.exp}>Help fellow commuters! Share route tips or read experiences from commuters within 1km of your route.</Text>

          <TouchableOpacity style={styles.experiencesButton} onPress={handleExperiencesPress} activeOpacity={0.7}>
            <Text style={styles.experiencesButtonText}>View & Share Experiences  </Text>
            <Feather name="map-pin" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : !isRouteLoading ? (
        <Text style={styles.errorText}>Search for your location and destination.</Text>
      ) : null}
    </View>
  ), [
    origin,
    destination,
    originSuggestions,
    destinationSuggestions,
    route,
    routeMetrics,
    isOriginLoading,
    isDestinationLoading,
    isRouteLoading,
    selectedAlgorithm,
    showAlgorithmDropdown,
    handleOriginChange,
    clearOrigin,
    handleDestinationChange,
    selectOriginSuggestion,
    selectDestinationSuggestion,
    fetchRouteDetails,
    renderRouteOverview,
    handleExperiencesPress,
  ]);

  // Memoize the preview data at the top level
  const previewRestaurants = useMemo(() => nearbyRestaurants.slice(0, 5), [nearbyRestaurants]);

  const renderRestaurantsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.headerText}>Nearby Dining Spots</Text>
      {/* <ClearCacheButton /> */}
      <View style={styles.spotLimitContainer}>
        <Text style={styles.spotLimitHint}>Limit results to:</Text>
        {[10, 20, 50, 100].map((limit) => (
          <TouchableOpacity
            key={limit}
            style={[
              styles.spotLimitButton,
              spotLimit === limit && styles.activeSpotLimitButton
            ]}
            onPress={() => setSpotLimit(limit)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.spotLimitButtonText,
                spotLimit === limit && styles.activeSpotLimitButtonText
              ]}
            >
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
              style={[
                styles.segmentButton,
                selectedLocationType === 'origin' && styles.activeSegment,
                !route[0] && styles.disabledSegment
              ]}
              onPress={() => setSelectedLocationType('origin')}
              disabled={!route[0]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedLocationType === 'origin' && styles.activeSegmentText,
                  !route[0] && styles.disabledSegmentText
                ]}
              >
                Origin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                selectedLocationType === 'destination' && styles.activeSegment,
                !route[1] && styles.disabledSegment
              ]}
              onPress={() => setSelectedLocationType('destination')}
              disabled={!route[1]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedLocationType === 'destination' && styles.activeSegmentText,
                  !route[1] && styles.disabledSegmentText
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
          <Text style={styles.subHeader}>Top Nearby Dining Spots</Text>
          {previewRestaurants.length > 0 ? (
            <FlatList
              horizontal
              data={previewRestaurants}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.restaurantCard}
                  onPress={() => setRestaurantModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.restaurantCuisine} numberOfLines={1}>
                    {formatCuisine(item.metadata?.cuisine) || 'Unknown'}
                  </Text>
                  <Text style={styles.restaurantDistance}>
                    {item.distance?.toFixed(2) || 'N/A'} km
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noResultsText}>
              No dining spots found near {selectedLocationType}
            </Text>
          )}
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => setRestaurantModalVisible(true)}
          >
            <Text style={styles.seeAllText}>See All Dining Spots</Text>
            <Ionicons name="chevron-forward" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.promptText}>
          Click on an origin or destination to view nearby dining spots
        </Text>
      )}
    </View>
  );

  const clearCaches = async () => {
    // Clear in-memory caches
    restaurantCache.current = {};
    attractionCache.current = {};

    try {
      // Clear all items in AsyncStorage (use removeItem for specific keys if needed)
      await AsyncStorage.clear();
      console.log("AsyncStorage cache cleared.");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const ClearCacheButton = () => {
    const handlePress = async () => {
      await clearCaches();
      // You could also trigger a refetch here if needed
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAttractionsTab = useCallback(() => (
    <View style={styles.tabContent}>
      <Text style={styles.headerText}>Nearby Attractions</Text>

      <View style={styles.spotLimitContainer}>
        <Text style={styles.spotLimitHint}>Limit results to:</Text>
        {[10, 20, 50, 100].map((limit) => (
          <TouchableOpacity
            key={limit}
            style={[
              styles.spotLimitButton,
              spotLimit === limit && styles.activeSpotLimitButton
            ]}
            onPress={() => setSpotLimit(limit)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.spotLimitButtonText,
                spotLimit === limit && styles.activeSpotLimitButtonText
              ]}
            >
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
              style={[
                styles.segmentButton,
                selectedLocationType === 'origin' && styles.activeSegment,
                !route[0] && styles.disabledSegment
              ]}
              onPress={() => setSelectedLocationType('origin')}
              disabled={!route[0]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedLocationType === 'origin' && styles.activeSegmentText,
                  !route[0] && styles.disabledSegmentText
                ]}
              >
                Origin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                selectedLocationType === 'destination' && styles.activeSegment,
                !route[1] && styles.disabledSegment
              ]}
              onPress={() => setSelectedLocationType('destination')}
              disabled={!route[1]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedLocationType === 'destination' && styles.activeSegmentText,
                  !route[1] && styles.disabledSegmentText
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
            <Text style={styles.subHeader}>Top Nearby Attractions</Text>
            <FlatList
              horizontal
              data={nearbySpots.slice(0, 5)}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.attractionCardPreview}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{
                      uri: item.image_url || 'https://via.placeholder.com/150.png?text=No+Image'
                    }}
                    style={styles.attractionImagePreview}
                  />
                  <Text style={styles.attractionNamePreview} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.attractionDistance}>
                    {item.distance?.toFixed(2)} km
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.seeAllButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.seeAllText}>See All Attractions</Text>
              <Ionicons name='chevron-forward' size={16} color='#6366F1' />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noResultsText}>
            No attractions found near {selectedLocationType}
          </Text>
        )
      ) : (
        <Text style={styles.promptText}>
          Click on an origin or destination to view nearby attractions
        </Text>
      )}
    </View>
  ), [route, selectedLocationType, nearbySpots, spotLimit]);

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={{ flex: 1 }}>
        {/* Top Half: Map */}
        <View style={{ flex: 1 }}>
          <MapComponentMemo
            initialRegion={region}
            route={route}
            roadPath={roadPath}
            mapResetKey={mapResetKey}
            style={styles.map}
            polylineColor={polylineColor}
            webviewRef={webviewRef}
            nearbySpots={memoizedSpots}
            selectedSpot={selectedSpot}
            isLoading={isRouteLoading}
            nearbyRestaurants={memoizedRestaurants}
            onRestaurantClick={(name: string) => {
              const restaurant = nearbyRestaurants.find((r) => r.name === name);
              if (restaurant) {
                setSelectedRestaurant(restaurant);
                setRestaurantModalVisible(true);
              }
            }}
            onSpotClick={(spotName: React.SetStateAction<string | null>) => {
              setScrollToSpot(spotName);
              setModalVisible(true);
            }}
            activeTab={activeTab}
          />
          {/* {isRouteLoading && (
            <ActivityIndicator
              style={styles.loadingIndicator}
              size="large"
              color="#6366F1"
            />
          )} */}
        </View>

        {/* Bottom Half: Details and Modals */}
        <View style={[styles.normalViewContainer, { flex: 1.5 }]}>
          <ScrollView
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
                const js = `
                if (window.map) {
                  const targetLat = ${restaurant.latitude};
                  const targetLng = ${restaurant.longitude};
                  window.map.flyTo([targetLat, targetLng], 16, { animate: true, duration: 1 }).once('moveend', function() {
                    window.map.eachLayer(function(layer) {
                      if (layer instanceof L.Marker && layer.options.isRestaurant) {
                        const latLng = layer.getLatLng();
                        if (Math.abs(latLng.lat - targetLat) < 0.00001 && Math.abs(latLng.lng - targetLng) < 0.00001) {
                          layer.openPopup();
                        }
                      }
                    });
                  });
                }
              `;
                webviewRef.current?.injectJavaScript(js);
                setRestaurantModalVisible(false);
              }}
              onGoHere={(restaurant) => {
                setDestination(restaurant.name);
                const newDestination = {
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                };
                setRoadPath([]);
                const currentOrigin =
                  route.length > 0
                    ? route[0]
                    : { latitude: region.latitude, longitude: region.longitude };
                setRoute([currentOrigin, newDestination]);
                fetchRouteDetails(
                  newDestination.latitude,
                  newDestination.longitude,
                  selectedAlgorithm
                );
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
                const newDestination = {
                  latitude: selectedSpot.latitude,
                  longitude: selectedSpot.longitude,
                };
                setRoadPath([]);
                const currentOrigin =
                  route.length > 0
                    ? route[0]
                    : { latitude: region.latitude, longitude: region.longitude };
                setRoute([currentOrigin, newDestination]);
                fetchRouteDetails(
                  newDestination.latitude,
                  newDestination.longitude,
                  selectedAlgorithm
                );
                setModalVisible(false);
                setSelectedSpot(newDestination);
              }}
              onSpotView={(selectedSpot) => {
                const js = `
                if (window.map) {
                  const targetLat = ${selectedSpot.latitude};
                  const targetLng = ${selectedSpot.longitude};
                  window.map.flyTo([targetLat, targetLng], 16, { animate: true, duration: 1 }).once('moveend', function() {
                    window.map.eachLayer(function(layer) {
                      if (layer instanceof L.Marker && layer.options.isTouristSpot) {
                        const latLng = layer.getLatLng();
                        if (Math.abs(latLng.lat - targetLat) < 0.000001 && Math.abs(latLng.lng - targetLng) < 0.000001) {
                          layer.openPopup();
                        }
                      }
                    });
                  });
                }
              `;
                webviewRef.current?.injectJavaScript(js);
                setModalVisible(false);
              }}
            />
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  viewStepButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
    alignSelf: "center"
  },
  viewStepButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  segmentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginLeft: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  segmentIcon: {
    marginRight: 12,
  },
  segmentTextContainer: {
    flex: 1,
  },
  segmentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  segmentDuration: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  segmentSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  chevronIcon: {
    marginLeft: 12,
  },
  segmentDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepBullet: {
    color: '#64748B',
    marginRight: 8,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  boardingSection: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  boardingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  boardingTextContainer: {
    marginLeft: 12,
  },
  boardingLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  boardingValue: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 2,
  },
  alternativesContainer: {
    marginTop: 16,
  },
  alternativeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  alternativeText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  tabContent: {
    paddingTop: 0,
    paddingLeft: 16,
    paddingRight: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#44457D',
    marginBottom: 16,
  },
  spotLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  spotLimitHint: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  spotLimitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activeSpotLimitButton: {
    backgroundColor: '#6366F1',
  },
  spotLimitButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  activeSpotLimitButtonText: {
    color: '#FFFFFF',
  },
  locationTypeContainer: {
    marginVertical: 12,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  locationTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    justifyContent: 'center',
  },
  activeSegment: {
    backgroundColor: '#6366F1',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  activeSegmentText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  segmentText: {
    fontSize: 14,
    color: '#374151',
  },
  disabledSegment: {
    backgroundColor: '#F3F4F6',
  },
  disabledSegmentText: {
    color: '#9CA3AF',
  },
  attractionsPreview: {
    marginVertical: 12,
  },
  subHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
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
  attractionDistance: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
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
  normalViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  userInput: {
    backgroundColor: '#F5F7FF', // Light purple background from PostModal
    borderWidth: 1,
    borderColor: '#6366F1', // Purple border from PostModal
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#374151',
    paddingRight: 40, // Space for clear button
    height: 40, // Fixed height to prevent expansion
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    borderRadius: 8,
    borderColor: "#6366F1", // Purple border
    backgroundColor: '#fff',
    transform: [{ translateY: -10 }],
  },
  loadingIndicator: {
    position: "absolute",
    right: 40,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 11,
  },
  timelineContainer: {
    marginTop: 8,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 5,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#6366F1",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6366F1", // Overridden per segment
    position: "absolute",
    left: 1,
    top: 10,
    zIndex: 1,
  },
  timelineIconContainer: {
    marginRight: 8,
  },
  segmentHeaderRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  segmentTitleContainer: {
    flexDirection: "column",
  },
  viewButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  getOnOffContainer: {
    marginBottom: 8,
  },
  onOffTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  onOffInstruction: {
    fontSize: 12,
    color: "#374151",
    marginTop: 2,
  },
  alternativeHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  overviewText: {
    fontSize: 12,
    color: "#44457D",
    textAlign: "center",
    marginVertical: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  routeTypeContainer: { marginBottom: 8 },
  algorithmDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spread text and icon evenly
    backgroundColor: '#F5F7FF', // Light purple background like PostModal
    borderWidth: 1,
    borderColor: '#6366F1', // Purple border
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12, // Slightly more padding for comfort
    shadowOffset: { width: 0, height: 1 },
  },
  locationsContainer: { marginVertical: 0 },
  label: { fontSize: 14, marginBottom: 4 },
  searchContainer: { marginBottom: 8 },
  routeMetricsContainer: { marginBottom: 20 },
  metricCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#E5E7EB", padding: 8, borderRadius: 8, marginRight: 8 },
  metricText: { marginLeft: 4, fontSize: 12, color: "#44457D" },
  routeOverviewContainer: { marginBottom: 12 },
  timelineIcon: { width: 32, alignItems: "center" },
  timelineContent: { flex: 1, paddingLeft: 12 },
  segmentLabel: { fontSize: 14, fontWeight: "500", color: "#111827" },
  experiencesButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "500" },
  experiencesButton: { backgroundColor: "#6366F1", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 12, flexDirection: "row", justifyContent: "center" },
  exp: {
    fontSize: 14,
    color: "#44457D",
    marginTop: 34,
    fontStyle: "italic",
  },
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
  text: { color: "#44457D", fontWeight: "500", fontSize: 16, marginBottom: 16 },
  container: { padding: 8, marginBottom: 20 },
  inputContainer: { // Renamed from searchContainer for consistency with PostModal
    position: 'relative',
    marginBottom: 8,
  },
  suggestionList: {
    position: 'absolute',
    top: 40, // Below the input field, adjusted from 45 to match PostModal
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 250,
    zIndex: 1000, // Higher z-index to ensure visibility
  },
  suggestionItem: {
    padding: 12, // Increased padding for better touch target.
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  suggestionText: {
    color: "#444",
    fontSize: 14,
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
  oopsContainer: { alignItems: "center", padding: 16, marginBottom: 30 },
  illustration: { width: 150, height: 120, marginBottom: 10 },
  errorSubText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginHorizontal: 20,
  },
  segmentCardHeaderText: { fontSize: 12, fontWeight: "bold", color: "#111827" },
  segmentCardBody: { padding: 10 },
  stepsContainer: { marginTop: 6, marginLeft: 6 },
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
    fontSize: 14, // Match PostModal input text size
    color: '#374151', // Match PostModal text color
    fontWeight: '500', // Slightly bolder for emphasis
    flex: 1, // Allow text to take available space
    marginRight: 8, // Space between text and chevron
  },
  algorithmDropdownOverlay: {
    position: 'absolute',
    top: 66, // Adjusted to sit nicely below the button
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6366F1', // Purple border to match
    borderRadius: 8,
    maxHeight: 160,
    zIndex: 1000,
    overflow: 'hidden'
  },
  algorithmDropdownItem: {
    paddingVertical: 10, // Increased for better touch area
    paddingHorizontal: 12,
    backgroundColor: '#F5F7FF', // Light purple background
  },
  algorithmDropdownItemSelected: {
    backgroundColor: '#6366F1', // Purple when selected
  },
  algorithmDropdownItemText: {
    fontSize: 14, // Match PostModal text size
    color: '#374151', // Default text color
    fontWeight: '500', // Slightly bolder for clarity
  },
  algorithmDropdownItemTextSelected: {
    color: '#FFFFFF', // White text when selected
    fontWeight: '600', // Bolder for emphasis
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
  tabContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 28, borderRadius: 20, backgroundColor: "#F3F4F6" },
  activeTab: { backgroundColor: "#6366F1" },
  tabText: { color: "#6B7280", fontWeight: "500" },
  activeTabText: { color: "#FFFFFF" },
  spotLimitLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44457D', // Match PostModal label color
    marginRight: 8,
  },
  attractionCard: { marginBottom: 20, borderWidth: 1, borderColor: "#C7D2FE", borderRadius: 8, padding: 10, backgroundColor: "#FBFCFF" },
  attractionImage: { height: 200, width: "100%", borderRadius: 10, marginBottom: 10 },
  attractionName: { fontSize: 18, fontWeight: "bold", color: "#44457D", marginBottom: 5 },
  attractionDescription: { fontSize: 12, color: "#686A9C", marginBottom: 10 },
  actionButtonsContainer: { flexDirection: "row", gap: 8, marginVertical: 8, justifyContent: "space-between" },
  viewText: { color: "#3B82F6", fontWeight: "500" },
  goHereButton: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, backgroundColor: "#EFF6FF", borderRadius: 8, flex: 1 },
  goHereText: { color: "#3B82F6", fontWeight: "500" },
  scrollContent: { paddingBottom: 20 },
  attractionsScroll: {
    paddingRight: 16,
  },
});
