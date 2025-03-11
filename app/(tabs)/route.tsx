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
  Animated,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import ReviewModal from '../reviewmodal';

const polyline = require('@mapbox/polyline');

LogBox.ignoreLogs(['textShadow*', 'shadow*']);

// -------------------------
// Interfaces & Types
// -------------------------
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
  type: string; // "Jeep" / "Bus" / "Ejeep" / "LRT" / "MRT" / "walking"
  distance?: number;
  duration?: number;
  geometry?: string;
  walking?: boolean | null;
  vehicle_type?: string | null;
  boarding?: string;
  alighting?: string;
  from_stop?: Stop;
  to_stop?: Stop;
  steps?: { step_number: number; instruction: string }[];
  alternatives?: any[]; // May laman kung may alternative routes
  fare?: number;
}

export interface Route {
  stops: Stop[];
  segments: Segment[];
  summary?: {
    total_fare: number;
    total_duration: number;
    total_distance: number;
    total_distance_km: number;
    vehicle_types: string[];
  }
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
  roadPath?: LatLng[] | string;
  style?: any;
  mapResetKey?: number;
  polylineColor: string;
}

interface RouteDetails {
  route: Route | null;
}

interface RouteMetrics {
  distance: number;
  fare: number;
  walkingTime: string;
  carTime: string;
  busTime: string;
}

// -------------------------
// Helper Functions
// -------------------------
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours} hr ${remainingMins} min`;
  } else if (mins > 0) {
    return `${mins} min ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

const getMapHTML = (
  region: Region,
  route: LatLng[] = [],
  roadPath: any,
  polylineColor: string
) => {
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
  if (
    (typeof roadPath === "string" && roadPath.length > 0) ||
    (Array.isArray(roadPath) && roadPath.length > 0)
  ) {
    let polylineCoordinates;
    if (typeof roadPath === "string") {
      const decoded = polyline.decode(roadPath);
      polylineCoordinates = decoded.map((coord: number[]) => [coord[0], coord[1]]);
    } else if (Array.isArray(roadPath) && roadPath.length > 0) {
      if (Array.isArray(roadPath[0])) {
        polylineCoordinates = roadPath;
      } else {
        polylineCoordinates = roadPath.map((coord: any) => [
          coord.latitude,
          coord.longitude,
        ]);
      }
    }
    if (polylineCoordinates && polylineCoordinates.length > 0) {
      polylineJS = `var roadPolyline = L.polyline(${JSON.stringify(
        polylineCoordinates
      )}, { color: '${polylineColor}', weight: 3 }).addTo(map);`;
    }
  } else if (route.length === 2) {
    polylineJS = `var polyline = L.polyline([
      [${route[0].latitude}, ${route[0].longitude}],
      [${route[1].latitude}, ${route[1].longitude}]
    ], { color: '${polylineColor}', weight: 3 }).addTo(map);`;
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

const MapComponent: React.FC<MapComponentProps> = ({
  initialRegion,
  route = [],
  roadPath = [],
  style,
  mapResetKey,
  polylineColor
}) => {
  const mapKey = JSON.stringify({ initialRegion, route, roadPath, mapResetKey });
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleLoadEnd = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setLoading(false);
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        key={mapKey}
        originWhitelist={['*']}
        source={{ html: getMapHTML(initialRegion, route, roadPath, polylineColor) }}
        style={style}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={handleLoadEnd}
      />
      {loading && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: fadeAnim,
              backgroundColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center'
            }
          ]}
        >
          <ActivityIndicator size="large" color="#6366F1" />
        </Animated.View>
      )}
    </View>
  );
};

// Cache para hindi paulit-ulit ang geocode
const locationCacheRef = { current: {} as { [key: string]: any[] } };

const SuggestionList = ({
  suggestions,
  onSelect,
}: {
  suggestions: any[];
  onSelect: (item: any) => void;
}) => {
  if (!suggestions.length) return null;
  return (
    <ScrollView style={styles.suggestionList} keyboardShouldPersistTaps="handled">
      {suggestions.map((item, index) => (
        <TouchableWithoutFeedback
          key={`${item.name}-${index}`}
          onPress={() => onSelect(item)}
        >
          <View style={styles.suggestionItem}>
            <Text style={styles.suggestionText}>{item.name}</Text>
          </View>
        </TouchableWithoutFeedback>
      ))}
    </ScrollView>
  );
};

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
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics | null>(null);
  const [mapResetKey, setMapResetKey] = useState<number>(Date.now());
  const [manualOrigin, setManualOrigin] = useState<boolean>(false);
  const [polylineColor, setPolylineColor] = useState<string>("#6366F1");
  const [isOriginLoading, setIsOriginLoading] = useState(false);
  const [isDestinationLoading, setIsDestinationLoading] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const router = useRouter();
  const animatedHeight = useRef(new Animated.Value(400)).current;

  // Kapag may destination parameter
  useEffect(() => {
    if (destParam) {
      setDestination(destParam as string);
      setRoadPath([]);
      setMapResetKey(Date.now());
      geocodeAddress(destParam as string).then((suggestions: any) => {
        if (suggestions && suggestions.length > 0) {
          const selected = suggestions[0];
          setRoute(prev => {
            if (prev.length > 0) {
              return [prev[0], { latitude: selected.lat, longitude: selected.lon }];
            } else {
              return [
                { latitude: region.latitude, longitude: region.longitude },
                { latitude: selected.lat, longitude: selected.lon }
              ];
            }
          });
          fetchRouteDetails(selected.lat, selected.lon);
        }
      });
    }
  }, [destParam]);

  // Kapag may attraction parameter
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

  // Kunin ang kasalukuyang lokasyon
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
          ? `${addresses[0].name ? addresses[0].name + ', ' : ''}${
              addresses[0].street ? addresses[0].street + ', ' : ''
            }${addresses[0].city}, ${addresses[0].region}`
          : 'Unknown Location';
      setRegion(prev => ({ ...prev, latitude, longitude }));
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

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: route.length >= 2 ? 400 : 200,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [route, animatedHeight]);

  // FUNCTIONS

  async function geocodeAddress(address: string) {
    if (locationCacheRef.current[address]) {
      return locationCacheRef.current[address];
    }
    try {
      const { data } = await axios.get<LocationSuggestion[]>(
        'https://comgu20-production.up.railway.app/api/locations/search',
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
      console.error('Geocoding error:', err);
      await sleep(1000);
      return [];
    }
  }

  const handleOriginChange = async (text: string) => {
    setOrigin(text);
    // If the origin is cleared, also clear the "To" field and reset related states.
    if (!text) {
      setOriginSuggestions([]);
      setDestination('');
      setDestinationSuggestions([]);
      setRoute([]);
      setRouteDetails({ route: null });
      setRoadPath([]);
      return;
    }
    setIsOriginLoading(true);
    const suggestions = await geocodeAddress(text);
    setOriginSuggestions(suggestions);
    setIsOriginLoading(false);
  };

  // Updated clear button for "From" that clears both fields
  const clearOrigin = () => {
    setOrigin('');
    setOriginSuggestions([]);
    setDestination('');
    setDestinationSuggestions([]);
    setRoute([]);
    setRouteDetails({ route: null });
    setRoadPath([]);
  };

  const selectOriginSuggestion = async (item: any) => {
    setOrigin(item.name);
    setOriginSuggestions([]);
    setRegion(prev => ({ ...prev, latitude: item.lat, longitude: item.lon }));
    const newRoute = route.length > 0
      ? [{ latitude: item.lat, longitude: item.lon }, ...route.slice(1)]
      : [{ latitude: item.lat, longitude: item.lon }];
    setRoute(newRoute);
    setManualOrigin(true);
    setMapResetKey(Date.now());
    if (newRoute.length >= 2) {
      await fetchRouteDetails(newRoute[1].latitude, newRoute[1].longitude);
    }
  };

  const handleDestinationChange = async (text: string) => {
    setDestination(text);
    if (!text) {
      setDestinationSuggestions([]);
      return;
    }
    setIsDestinationLoading(true);
    const suggestions = await geocodeAddress(text);
    setDestinationSuggestions(suggestions);
    setIsDestinationLoading(false);
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

  const fetchRouteDetails = async (destLat: number, destLon: number) => {
    setIsRouteLoading(true);
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
      const routeData = response.data.route;
      if (routeData && routeData.segments) {
        console.log('Segments from API:', routeData.segments);
      }
      setRouteDetails({ route: routeData });

      // Metrics
      if (routeData && routeData.summary) {
        const summary = routeData.summary;
        const formattedDuration = formatDuration(summary.total_duration);
        let totalWalkingDistance = 0;
        if (routeData.segments && routeData.segments.length > 0) {
          routeData.segments.forEach(segment => {
            if (segment.type.toLowerCase() === "walking" && segment.distance) {
              totalWalkingDistance += segment.distance;
            }
          });
        }
        let busDuration = 0;
        if (routeData.segments && routeData.segments.length > 0) {
          routeData.segments.forEach(segment => {
            const segType = segment.type.toLowerCase();
            if (["bus", "jeep", "ejeep", "lrt", "mrt"].includes(segType) && segment.duration) {
              busDuration += segment.duration;
            }
          });
        }
        const busFormattedDuration = busDuration ? formatDuration(busDuration) : '';
        setRouteMetrics({
          distance: summary.total_distance_km || 0,
          fare: summary.total_fare || 0,
          walkingTime: totalWalkingDistance
            ? `${(totalWalkingDistance / 1000).toFixed(2)} km`
            : '',
          carTime: formattedDuration,
          busTime: busFormattedDuration
        });
      } else {
        setRouteMetrics(null);
      }

      // Polyline color
      if (routeData && routeData.segments && routeData.segments.length > 0) {
        const allWalking = routeData.segments.every(seg => seg.walking);
        setPolylineColor(allWalking ? "#808080" : "#6366F1");
      } else {
        setPolylineColor("#6366F1");
      }

      // Polyline path
      if (response.data.polyline && response.data.polyline.length > 0) {
        setRoadPath(response.data.polyline);
      } else if (routeData && routeData.segments && routeData.segments.length > 0) {
        let combinedPath: LatLng[] = [];
        const tolerance = 0.0001;
        routeData.segments.forEach(segment => {
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
                Math.abs(lastPoint.latitude - firstNew.latitude) < tolerance &&
                Math.abs(lastPoint.longitude - firstNew.longitude) < tolerance
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
    } finally {
      setIsRouteLoading(false);
    }
  };

  // -------------------------
  // RENDER ROUTE OVERVIEW
  // -------------------------
  const renderRouteOverview = () => {
    if (isRouteLoading) {
      return <ActivityIndicator size="small" color="#6366F1" />;
    }
    if (!routeDetails.route) {
      return <Text style={styles.overviewText}>No route overview available</Text>;
    }
    const { segments } = routeDetails.route;

    return (
      <View>
        {segments && segments.map((segment, idx) => {
          const segType = segment.type.toLowerCase();

          // Walking segment
          if (segType === "walking") {
            return (
              <View key={idx} style={styles.walkingSegmentContainer}>
                <View style={styles.bulletIcon} />
                <Text style={styles.walkingSegmentText}>
                  Walk from {segment.from_stop?.name} to {segment.to_stop?.name}
                </Text>
                {segment.alternatives && segment.alternatives.length > 0 && (
                  <View style={styles.alternativesContainer}>
                    {segment.alternatives.map((alt, altIdx) => {
                      const routeName = alt.route_name ? alt.route_name.split('-')[0] : '';
                      return (
                        <Text key={altIdx} style={styles.alternativeText}>
                          Alternative {altIdx + 1}: {alt.type} {routeName}
                        </Text>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          }
          // Jeep/Bus/Ejeep/LRT/MRT segment with connected bullets
          else if (["jeep", "bus", "ejeep", "lrt", "mrt"].includes(segType)) {
            return (
              <View key={idx} style={{ marginBottom: 20 }}>
                <View style={styles.segmentContainer}>
                  <View style={styles.bulletLineContainer}>
                    <View style={styles.greenBullet} />
                    <View style={styles.verticalLine} />
                    <View style={styles.blueBullet} />
                  </View>
                  <View style={styles.onOffTextContainer}>
                    <Text style={[styles.segmentTitle, { color: 'green' }]}>Get on</Text>
                    <Text style={styles.segmentInstruction}>
                      Ride a {segment.vehicle_type ? segment.vehicle_type.toLowerCase() : segType} from {segment.from_stop?.name} going towards {segment.to_stop?.name}.
                    </Text>
                    <Text style={[styles.segmentTitle, { color: 'blue', marginTop: 16 }]}>
                      Get off
                    </Text>
                    <Text style={styles.segmentInstruction}>
                      Arrive at {segment.to_stop?.name}, then get off at your stop.
                    </Text>
                  </View>
                </View>
                {segment.alternatives && segment.alternatives.length > 0 && (
                  <View style={styles.alternativesContainer}>
                    {segment.alternatives.map((alt, altIdx) => {
                      const routeName = alt.route_name ? alt.route_name.split('-')[0] : '';
                      return (
                        <Text key={altIdx} style={styles.alternativeText}>
                          Alternative {altIdx + 1}: {alt.type} {routeName}
                        </Text>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          }
          // Fallback for unknown types
          else {
            return null;
          }
        })}
      </View>
    );
  };

  const detailsContent = (
    <View style={styles.container}>
      <Text style={styles.text}>Details</Text>
      {/* Origin Input */}
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
          {isOriginLoading && (
            <ActivityIndicator style={styles.loadingIndicator} size="small" color="#6366F1" />
          )}
          {origin !== '' && (
            <TouchableOpacity style={styles.clearButton} onPress={clearOrigin}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <SuggestionList suggestions={originSuggestions} onSelect={selectOriginSuggestion} />
      </View>
      {/* Destination Input */}
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
          {isDestinationLoading && (
            <ActivityIndicator style={styles.loadingIndicator} size="small" color="#6366F1" />
          )}
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
      </View>
      {/* Route Metrics */}
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
      {/* Route Overview */}
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
            <TouchableOpacity style={styles.twobox} onPress={() => router.push('/postsuggestion')}>
              <Text style={styles.texttwo}>Route Post Suggestions</Text>
            </TouchableOpacity>
          </View>
          {route.length >= 2 && (
            <ReviewModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              originCoords={route[0]}
              destinationCoords={route[1]}
            />
          )}
        </View>
      ) : (
        <View style={styles.oopsContainer}>
          <Image
            source={require('../../assets/images/opz.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.errorText}>Oops!</Text>
          <Text style={styles.errorSubText}>Search for your location and destination.</Text>
        </View>
      )}
    </View>
  );

  if (route.length >= 2) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Animated.View style={[styles.mapContainer, { height: animatedHeight }]}>
          <MapComponent
            initialRegion={region}
            route={route}
            roadPath={roadPath}
            mapResetKey={mapResetKey}
            style={styles.map}
            polylineColor={polylineColor}
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
            polylineColor={polylineColor}
          />
        </Animated.View>
        {detailsContent}
      </ScrollView>
    );
  }
};

export default RouteScreen;

// -------------------------
// Styles
// -------------------------
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
  searchContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
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
  loadingIndicator: {
    position: 'absolute',
    right: 40,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  suggestionList: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    borderRadius: 8,
    elevation: 4,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  suggestionText: {
    color: '#444',
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 18,
  },
  infoBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6FF',
    borderRadius: 8,
    padding: 10,
    width: 65,
  },
  infoBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#44457D',
    marginTop: 4,
    textAlign: 'center',
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
  // Walking segment styles
  walkingSegmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletIcon: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
    marginRight: 8,
    marginTop: 2,
  },
  walkingSegmentText: {
    fontSize: 12,
    color: '#44457D',
    lineHeight: 18,
    flex: 1,
  },
  // Container for alternatives
  alternativesContainer: {
    marginTop: 6,
    backgroundColor: '#F5F7FF',
    padding: 6,
    borderRadius: 4,
    width: '100%',
  },
  alternativeText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  // Vehicle segment styles with connected bullets
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  bulletLineContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 8,
  },
  greenBullet: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'green',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'green',
    marginVertical: 2,
  },
  blueBullet: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'blue',
    marginTop: 2,
  },
  onOffTextContainer: {
    flex: 1,
  },
  segmentTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentInstruction: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 18,
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
});
