import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  LogBox,
  TouchableWithoutFeedback,
  Image,
  Animated
} from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import Entypo from '@expo/vector-icons/Entypo';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ReviewModal from '../reviewmodal';
const polyline = require('@mapbox/polyline'); // Using require for CommonJS module

LogBox.ignoreLogs(['textShadow*', 'shadow*']);

const METRO_MANILA_BOUNDS = {
  minLat: 14.40,
  maxLat: 14.85,
  minLon: 120.90,
  maxLon: 121.20,
};

//
// Interfaces & Types
//
interface LocationSuggestion {
  label: string;
  latitude: string;
  longitude: string;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface Stop {
  id: string;
  stop_id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface Segment {
  geometry: string;
  walking: boolean | null;
  vehicle_type: string | null;
}

export interface Route {
  stops: Stop[];
  segments: Segment[];
}

export interface User {
  id: number;
  username: string;
}

export interface Post {
  id: number;
  content: string;
  user: User;
  votes: number;
  comments_count: number;
  created_at: string;
}

export interface NearbySpot {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

export interface ApiResponse {
  route: Route;
  posts: Post[];
  nearby_spots: NearbySpot[];
  polyline?: LatLng[] | string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  initialRegion: Region;
  route?: LatLng[]; // index 0: origin, index 1: destination
  roadPath?: LatLng[] | string; // polyline coordinates mula API o encoded string
  style?: any;
  mapResetKey?: number;
}

interface RouteDetails {
  route: Route | null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

//
// Build the HTML para sa map gamit ang Leaflet
//
const getMapHTML = (region: Region, route: LatLng[] = [], roadPath?: any) => {
  let markersJS = "";
  if (route.length > 0) {
    markersJS += `
      var currentMarker = L.marker([${route[0].latitude}, ${route[0].longitude}])
        .addTo(map)
        .bindPopup("Current Location").openPopup();
    `;
    if (route.length >= 2) {
      markersJS += `
        var destinationMarker = L.marker([${route[1].latitude}, ${route[1].longitude}])
          .addTo(map)
          .bindPopup("Destination");
      `;
    }
  }
  
  let polylineJS = "";
  if (roadPath) {
    let polylineCoordinates;
    if (typeof roadPath === "string") {
      const decoded = polyline.decode(roadPath);
      polylineCoordinates = decoded.map((coord: number[]) => [coord[0], coord[1]]);
    } else if (Array.isArray(roadPath) && roadPath.length > 0) {
      if (Array.isArray(roadPath[0])) {
        polylineCoordinates = roadPath;
      } else {
        polylineCoordinates = roadPath.map((coord: any) => [coord.latitude, coord.longitude]);
      }
    }
    if (polylineCoordinates && polylineCoordinates.length > 0) {
      polylineJS = `var roadPolyline = L.polyline(${JSON.stringify(polylineCoordinates)}, { color: '#6366F1', weight: 3 }).addTo(map);`;
    }
  } else if (route.length === 2) {
    polylineJS = `var polyline = L.polyline([
      [${route[0].latitude}, ${route[0].longitude}],
      [${route[1].latitude}, ${route[1].longitude}]
    ], { color: '#6366F1', weight: 3 }).addTo(map);`;
  }
  
  let fitBoundsJS = `
    if (typeof roadPolyline !== 'undefined') {
      map.fitBounds(roadPolyline.getBounds());
    } else if (typeof polyline !== 'undefined') {
      map.fitBounds(polyline.getBounds());
    }
  `;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <style>
          html, body { margin: 0; padding: 0; height: 100%; }
          #map { height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${region.latitude}, ${region.longitude}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          ${markersJS}
          ${polylineJS}
          ${fitBoundsJS}
        </script>
      </body>
    </html>
  `;
};

//
// Map Component
//
const MapComponent: React.FC<MapComponentProps> = ({
  initialRegion,
  route = [],
  roadPath = [],
  style,
  mapResetKey
}) => {
  const mapKey = JSON.stringify({ initialRegion, route, roadPath, mapResetKey });
  return (
    <WebView
      key={mapKey}
      originWhitelist={['*']}
      source={{ html: getMapHTML(initialRegion, route, roadPath) }}
      style={style}
    />
  );
};

//
// SuggestionList para sa autocomplete
//
const SuggestionList = ({
  suggestions,
  onSelect,
}: {
  suggestions: any[];
  onSelect: (item: any) => void;
}) => {
  if (!suggestions.length) return null;
  return (
    <ScrollView style={[styles.suggestionList, { maxHeight: 150 }]} keyboardShouldPersistTaps="handled">
      {suggestions.map((item, index) => (
        <TouchableWithoutFeedback key={`${item.name}-${index}`} onPress={() => onSelect(item)}>
          <View style={styles.suggestionItem}>
            <Text style={styles.suggestionText}>{item.name}</Text>
          </View>
        </TouchableWithoutFeedback>
      ))}
    </ScrollView>
  );
};

//
// Main RouteScreen Component
//
const RouteScreen: React.FC = () => {
  const { destination: destParam, attraction } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 14.6760,
    longitude: 121.0437,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [origin, setOrigin] = useState<string>("");
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destination, setDestination] = useState<string>("");
  const [route, setRoute] = useState<LatLng[]>([]);
  const [roadPath, setRoadPath] = useState<LatLng[] | string>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [routeDetails, setRouteDetails] = useState<RouteDetails>({ route: null });
  const [mapResetKey, setMapResetKey] = useState<number>(Date.now());
  // Flag para malaman kung na-manual ang origin
  const [manualOrigin, setManualOrigin] = useState<boolean>(false);
  const router = useRouter();

  // Animated height para sa map container
  const animatedHeight = useRef(new Animated.Value(400)).current;

  // Set destination kung may param
  useEffect(() => {
    if (destParam) {
      setDestination(destParam as string);
      setRoadPath([]);
      setMapResetKey(Date.now());
    }
  }, [destParam]);

  // Kung may attraction, i-parse at i-set ang destination at route
  useEffect(() => {
    if (attraction) {
      try {
        const parsedAttraction = JSON.parse(attraction as string);
        setDestination(parsedAttraction.name);
        setRoute([
          region,
          { latitude: parsedAttraction.latitude, longitude: parsedAttraction.longitude }
        ]);
        fetchRouteDetails(parsedAttraction.latitude, parsedAttraction.longitude);
        setMapResetKey(Date.now());
      } catch (error) {
        console.error("Error parsing attraction parameter:", error);
      }
    }
  }, [attraction]);

  // Request user's location on mount (one-time lang)
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (status !== 'granted' || !servicesEnabled) {
        console.log("Location permission not granted or services disabled.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locAddr =
        addresses && addresses.length > 0
          ? `${addresses[0].name ? addresses[0].name + ', ' : ''}${addresses[0].street ? addresses[0].street + ', ' : ''}${addresses[0].city}, ${addresses[0].region}`
          : 'Unknown Location';
      setRegion(prev => ({ ...prev, latitude, longitude }));
      // Kung hindi pa manual ang origin, gamitin ang GPS value.
      if (!manualOrigin && !origin) {
        setOrigin(locAddr);
        setRoute(prev => {
          if (prev.length > 0) {
            return [{ latitude, longitude }, ...prev.slice(1)];
          } else {
            return [{ latitude, longitude }];
          }
        });
      }
    })();
  }, []);

  // Animate map container height batay sa kung may route na
  const hasRoute = route.length >= 2;
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: hasRoute ? 400 : 200,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [hasRoute, animatedHeight]);

  // -------------------------------------------------
  // Geocode helper function
  // -------------------------------------------------
  async function geocodeAddress(address: string) {
    try {
      const { data } = await axios.get<LocationSuggestion[]>(
        'https://comgu20-production.up.railway.app/api/locations/search',
        { params: { term: address } }
      );
      if (data && data.length) {
        return data.map((item: LocationSuggestion) => ({
          name: item.label,
          lat: parseFloat(item.latitude),
          lon: parseFloat(item.longitude),
        }));
      }
      return [];
    } catch (err) {
      console.error('Geocoding error:', err);
      await sleep(1000);
      return [];
    }
  }

  // -------------------------------------------------
  // Handlers para sa Origin
  // -------------------------------------------------
  const handleOriginChange = async (text: string) => {
    setOrigin(text);
    if (!text) {
      setOriginSuggestions([]);
      return;
    }
    const suggestions = await geocodeAddress(text);
    setOriginSuggestions(suggestions);
  };

  // Kapag natapos ang pag-edit ng Origin (submit o blur), i-update ang route state at region gamit ang bagong coordinate.
  const updateOriginRoute = async () => {
    const suggestions = await geocodeAddress(origin);
    if (suggestions && suggestions.length > 0) {
      const selected = suggestions[0];
      // I-update ang region state upang gamitin sa API call
      setRegion(prev => ({ ...prev, latitude: selected.lat, longitude: selected.lon }));
      // I-update ang route state: ang unang coordinate ay magiging bagong origin
      setRoute(prev => {
        if (prev.length > 0) {
          return [{ latitude: selected.lat, longitude: selected.lon }, ...prev.slice(1)];
        } else {
          return [{ latitude: selected.lat, longitude: selected.lon }];
        }
      });
      setManualOrigin(true);
      setMapResetKey(Date.now());
    }
  };

  const selectOriginSuggestion = async (item: any) => {
    setOrigin(item.name);
    setOriginSuggestions([]);
    setRegion(prev => ({ ...prev, latitude: item.lat, longitude: item.lon }));
    setRoute(prev => {
      if (prev.length > 0) {
        return [{ latitude: item.lat, longitude: item.lon }, ...prev.slice(1)];
      } else {
        return [{ latitude: item.lat, longitude: item.lon }];
      }
    });
    setManualOrigin(true);
    setMapResetKey(Date.now());
  };

  // -------------------------------------------------
  // Handlers para sa Destination
  // -------------------------------------------------
  const handleDestinationChange = async (text: string) => {
    setDestination(text);
    if (!text) {
      setDestinationSuggestions([]);
      return;
    }
    const suggestions = await geocodeAddress(text);
    setDestinationSuggestions(suggestions);
  };

  const selectDestinationSuggestion = async (item: any) => {
    setDestination(item.name);
    setDestinationSuggestions([]);
    setRoadPath([]);
    setRoute(prev => {
      if (prev.length > 0) {
        return [prev[0], { latitude: item.lat, longitude: item.lon }];
      } else {
        return [
          { latitude: region.latitude, longitude: region.longitude },
          { latitude: item.lat, longitude: item.lon }
        ];
      }
    });
    await fetchRouteDetails(item.lat, item.lon);
    setMapResetKey(Date.now());
  };

  // -------------------------------------------------
  // Fetch route details mula sa backend API (kasama ang pag-decode ng geometry)
  // -------------------------------------------------
  const fetchRouteDetails = async (destLat: number, destLon: number) => {
    const params = {
      origin_lat: region.latitude,
      origin_lon: region.longitude,
      destination_lat: destLat,
      destination_lon: destLon,
    };
    console.log("Request Params:", params);
    try {
      const response = await axios.get<ApiResponse>(
        'https://comgu20-production.up.railway.app/api/routes/find',
        { params }
      );
      console.log("API Response:", response.data);
      setRouteDetails({ route: response.data.route });
      
      if (response.data.polyline && response.data.polyline.length > 0) {
        setRoadPath(response.data.polyline);
      } else if (
        response.data.route &&
        response.data.route.segments &&
        response.data.route.segments.length > 0
      ) {
        let combinedPath: LatLng[] = [];
        response.data.route.segments.forEach(segment => {
          if (segment.geometry) {
            const decodedCoords = polyline.decode(segment.geometry).map(
              (coord: number[]) => ({
                latitude: coord[0],
                longitude: coord[1],
              })
            );
            if (combinedPath.length > 0) {
              const lastPoint = combinedPath[combinedPath.length - 1];
              const firstNew = decodedCoords[0];
              if (
                lastPoint.latitude === firstNew.latitude &&
                lastPoint.longitude === firstNew.longitude
              ) {
                combinedPath = combinedPath.concat(decodedCoords.slice(1));
              } else {
                combinedPath = combinedPath.concat(decodedCoords);
              }
            } else {
              combinedPath = combinedPath.concat(decodedCoords);
            }
          }
        });
        setRoadPath(combinedPath);
      } else if (route.length === 2) {
        setRoadPath(route);
      } else {
        setRoadPath([]);
      }
    } catch (error) {
      console.error("Error fetching route details:", error);
    }
  };

  // -------------------------------------------------
  // Render dynamic Route Overview gamit ang API data
  // -------------------------------------------------
  const renderRouteOverview = () => {
    if (!routeDetails.route) {
      return <Text style={styles.overviewText}>No route overview available</Text>;
    }
    const stops = routeDetails.route.stops;
    const segments = routeDetails.route.segments;
    return (
      <View>
        <Text style={styles.overviewSubtitle}>From: {origin}</Text>
        <Text style={styles.overviewSubtitle}>To: {stops[stops.length - 1]?.name}</Text>
        {segments.map((segment, idx) => {
          const startStop = stops[idx];
          const endStop = stops[idx + 1];
          if (segment.walking) {
            return (
              <Text key={idx} style={styles.bulletItem}>
                • Walk from {startStop?.name} to {endStop?.name}
              </Text>
            );
          } else if (segment.vehicle_type) {
            return (
              <View key={idx}>
                <Text style={[styles.overviewTitle, { marginTop: 10, color: 'green' }]}>Get on</Text>
                <Text style={styles.bulletItem}>
                  • Get on: {segment.vehicle_type} from {startStop?.name}
                </Text>
                <Text style={[styles.overviewTitle, { marginTop: 10, color: 'blue' }]}>Get off</Text>
                <Text style={styles.bulletItem}>
                  • Get off: {endStop?.name}
                </Text>
              </View>
            );
          } else {
            return (
              <Text key={idx} style={styles.bulletItem}>
                • {startStop?.name} to {endStop?.name}
              </Text>
            );
          }
        })}
      </View>
    );
  };

  // -------------------------------------------------
  // Content: Inputs at Route Overview
  // -------------------------------------------------
  const detailsContent = (
    <View style={styles.container}>
      <Text style={styles.text}>Details</Text>

      {/* Origin Input */}
      <Text style={styles.label}>Origin</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.userInput}
          placeholder="Enter origin (default is current location)"
          placeholderTextColor="#666"
          value={origin}
          onChangeText={handleOriginChange}
          onSubmitEditing={updateOriginRoute}
          onBlur={updateOriginRoute}
          multiline={false}
        />
        {origin !== '' && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setOrigin('')}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <SuggestionList suggestions={originSuggestions} onSelect={selectOriginSuggestion} />

      {/* Destination Input */}
      <Text style={styles.label}>Destination</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.userInput}
          placeholder="Intramuros, Manila City"
          placeholderTextColor="#666"
          value={destination}
          onChangeText={handleDestinationChange}
          multiline={false}
        />
        {destination !== '' && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setDestination('');
              setDestinationSuggestions([]);
              setRoute(prev => (prev.length > 0 ? [prev[0]] : []));
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

      {route.length >= 2 ? (
        <View style={styles.routecontainer}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#6B7280', marginBottom: 18 }}>
            Route Overview
          </Text>
          {renderRouteOverview()}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
            <TouchableOpacity style={styles.twobox} onPress={() => setModalVisible(true)}>
              <Text style={styles.texttwo}>Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.twobox} onPress={() => router.push("/postsuggestion")}>
              <Text style={styles.texttwo}>Route Post Suggestions</Text>
            </TouchableOpacity>
          </View>
          <ReviewModal visible={modalVisible} onClose={() => setModalVisible(false)} />
        </View>
      ) : (
        <View style={styles.oopsContainer}>
          <Image source={require('../../assets/images/opz.png')} style={styles.illustration} resizeMode="contain" />
          <Text style={styles.errorText}>Oops!</Text>
          <Text style={styles.errorSubText}>Search for your location and destination.</Text>
        </View>
      )}
    </View>
  );

  // -------------------------------------------------
  // Layout: Map at Details
  // -------------------------------------------------
  if (hasRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Animated.View style={[styles.mapContainer, { height: animatedHeight }]}>
          <MapComponent
            initialRegion={region}
            route={route}
            roadPath={roadPath}
            mapResetKey={mapResetKey}
            style={styles.map}
          />
        </Animated.View>
        <ScrollView style={[styles.detailsContainer, { backgroundColor: '#FFFFFF' }]} contentContainerStyle={styles.contentContainer}>
          {detailsContent}
        </ScrollView>
      </View>
    );
  } else {
    return (
      <ScrollView style={[styles.maincontainer, { backgroundColor: '#FFFFFF' }]} contentContainerStyle={styles.contentContainer}>
        <Animated.View style={[styles.mapContainer, { height: animatedHeight }]}>
          <MapComponent
            initialRegion={region}
            route={route}
            roadPath={roadPath}
            mapResetKey={mapResetKey}
            style={styles.map}
          />
        </Animated.View>
        {detailsContent}
      </ScrollView>
    );
  }
};

export default RouteScreen;

//
// Styles
//
const styles = StyleSheet.create({
  maincontainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  mapContainer: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginTop: 15,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  text: {
    color: '#44457D',
    fontWeight: '500',
    fontSize: 16,
  },
  container: {
    padding: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 10,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  userInput: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
    paddingRight: 30,
    height: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  suggestionList: {
    position: 'absolute',
    top: 90,
    left: 15,
    right: 15,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    borderRadius: 8,
    elevation: 4,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  suggestionText: {
    color: '#444',
  },
  box: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F4F6FF',
    padding: 8,
  },
  boxlabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#44457D',
  },
  routecontainer: {
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginTop: 18,
    marginBottom: 100,
  },
  overviewText: {
    fontSize: 12,
    color: '#44457D',
    marginVertical: 4,
  },
  oopsContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 30,
  },
  illustration: {
    width: 150,
    height: 120,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  errorSubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  twobox: {
    borderRadius: 6,
    backgroundColor: '#E0E7FF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    margin: 4,
  },
  texttwo: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  overviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#44457D',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  bulletItem: {
    fontSize: 12,
    color: '#44457D',
    marginBottom: 4,
    lineHeight: 18,
  },
});
