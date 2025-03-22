import React, { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
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
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ReviewModal from "../reviewmodal";
import { usePostContext } from "@/contexts/PostContext";
import ModalComponent from "../restaurantmodal";

const polyline = require("@mapbox/polyline");

LogBox.ignoreLogs(["textShadow*", "shadow*"]);

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
  type: string;
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
  alternatives?: any[];
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
  };
}

export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
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
  image_url?: string; // Add image URL
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

export interface SegmentPath {
  coords: LatLng[];
  color: string;
}

interface MapComponentProps {
  initialRegion: Region;
  route?: LatLng[];
  roadPath?: LatLng[] | string | LatLng[][] | SegmentPath[];
  style?: any;
  mapResetKey?: number;
  polylineColor: string;
  nearbySpots?: Array<{ latitude: number; longitude: number; name: string }>; // New optional prop
  selectedSpot?: LatLng | null; // Add this
  isLoading?: boolean; // New prop
  webviewRef?: React.RefObject<WebView>;
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  } else if (mins > 0) {
    return `${mins}min ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function shortenAddress(address: string) {
  return address.split(",")[0];
}

function getSegmentLabel(
  type: string,
  fromStopName?: string,
  toStopName?: string,
  vehicleType?: string | null
) {
  const mainLabel = ["jeep", "bus", "ejeep", "lrt", "mrt"].includes(
    type.toLowerCase()
  )
    ? vehicleType
      ? vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
      : type.charAt(0).toUpperCase() + type.slice(1)
    : "Walk";
  if (fromStopName && toStopName) {
    return `${mainLabel}: ${shortenAddress(fromStopName)} - ${shortenAddress(
      toStopName
    )}`;
  }
  return mainLabel;
}

const getMapHTML = (
  region: Region,
  route: LatLng[],
  roadPath: LatLng[] | string | LatLng[][] | SegmentPath[],
  polylineColor: string,
  nearbySpots?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    image_url?: string;
  }>
) => {
  // Add Font Awesome CSS to the head
  const fontAwesomeCSS =
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />';

  let markersJS = "";
  if (route && route.length > 0) {
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

  // Update the icon HTML
  markersJS += `
    var icon = L.divIcon({
      html: '<div style="background-color: #fff; border: 2px solid #28a745; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-mountain-sun" style="color: #28a745; font-size: 16px;"></i></div>',
      className: 'custom-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  `;

  let polylinesJS = "";
  // When roadPath is SegmentPath[]
  if (
    Array.isArray(roadPath) &&
    roadPath.length > 0 &&
    (roadPath[0] as any).coords !== undefined
  ) {
    polylinesJS += `
      window.segmentPolylines = [];
      ${(roadPath as SegmentPath[])
        .map(
          (segment, idx: number) =>
            `var segment${idx} = L.polyline(${JSON.stringify(
              segment.coords.map((pt) => [pt.latitude, pt.longitude])
            )}, { color: '${segment.color}', weight: 3 }).addTo(map);
         segment${idx}.options.defaultColor = '${segment.color}';
         window.segmentPolylines.push(segment${idx});`
        )
        .join("\n")}
    `;
  }
  // When roadPath is LatLng[][]
  else if (
    Array.isArray(roadPath) &&
    roadPath.length > 0 &&
    Array.isArray(roadPath[0])
  ) {
    polylinesJS += `
      window.segmentPolylines = [];
      ${(roadPath as LatLng[][])
        .map(
          (segment, idx: number) =>
            `var segment${idx} = L.polyline(${JSON.stringify(
              segment.map((pt: LatLng) => [pt.latitude, pt.longitude])
            )}, { color: '${polylineColor}', weight: 3 }).addTo(map);
         segment${idx}.options.defaultColor = '${polylineColor}';
         window.segmentPolylines.push(segment${idx});`
        )
        .join("\n")}
    `;
  }
  // When roadPath is string or LatLng[]
  else if (
    (typeof roadPath === "string" && roadPath.length > 0) ||
    (Array.isArray(roadPath) && roadPath.length > 0)
  ) {
    let polylineCoordinates;
    if (typeof roadPath === "string") {
      const decoded = polyline.decode(roadPath);
      polylineCoordinates = decoded.map((coord: number[]) => [
        coord[0],
        coord[1],
      ]);
    } else if (Array.isArray(roadPath)) {
      polylineCoordinates = Array.isArray(roadPath[0])
        ? roadPath
        : (roadPath as LatLng[]).map((coord: LatLng) => [
            coord.latitude,
            coord.longitude,
          ]);
    }
    polylinesJS += `var roadPolyline = L.polyline(${JSON.stringify(
      polylineCoordinates
    )}, { color: '${polylineColor}', weight: 3 }).addTo(map);`;
  }

  let fitBoundsJS = `
    if (window.segmentPolylines && window.segmentPolylines.length > 0) {
      var group = new L.featureGroup(window.segmentPolylines);
      map.fitBounds(group.getBounds());
    } else if (typeof roadPolyline !== 'undefined') {
      map.fitBounds(roadPolyline.getBounds());
    }
  `;
  let messageListenerJS = `
    var highlightedIndices = [];
    
    function toggleHighlightSegment(idx) {
      var i = highlightedIndices.indexOf(idx);
      if(i === -1) {
        highlightedIndices.push(idx);
      } else {
        highlightedIndices.splice(i, 1);
      }
      updateSegmentStyles();
    }
    
    function updateSegmentStyles() {
      if(window.segmentPolylines) {
        window.segmentPolylines.forEach(function(polyline, index) {
          var defaultColor = polyline.options.defaultColor || '${polylineColor}';
          // Kung walking segment, panatilihin ang kulay gray kahit naka-highlight
          if(defaultColor === '#808080'){
            polyline.setStyle({ color: '#808080', weight: (highlightedIndices.indexOf(index) !== -1) ? 6 : 3 });
          } else {
            if(highlightedIndices.indexOf(index) !== -1) {
              polyline.setStyle({ color: '#1D4ED8', weight: 6 });
            } else {
              polyline.setStyle({ color: defaultColor, weight: 3 });
            }
          }
        });
      }
    }
    
    document.addEventListener('message', function(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'toggleSegmentHighlight') {
          toggleHighlightSegment(data.index);
        }
      } catch(e) {
        console.error(e);
      }
    });
    
    window.addEventListener('message', function(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'toggleSegmentHighlight') {
          toggleHighlightSegment(data.index);
        }
      } catch(e) {
        console.error(e);
      }
    });
  `;

  // Update nearby spots markers with a circular background and icon inside for contrast
  if (nearbySpots && nearbySpots.length > 0) {
    nearbySpots.forEach((spot) => {
      markersJS += `
        var icon = L.divIcon({
          html: '<div style="background-color: #fff; border: 2px solid #28a745; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-mountain-city" style="color: #28a745; font-size: 16px;"></i></div>',
          className: 'custom-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });
        
        L.marker([${spot.latitude}, ${spot.longitude}], { icon: icon })
          .addTo(map)
          .bindPopup(\`
            <div style="max-width: 200px;">
              <b>${spot.name}</b>
              \${${JSON.stringify(spot)}.image_url ? 
                \`<img 
                  src="\${${JSON.stringify(spot)}.image_url}" 
                  style="width: 100%; height: auto; margin-top: 5px; border-radius: 4px;"
                  onerror="this.onerror=null;this.src='https://via.placeholder.com/100x75.png?text=Image+Not+Available';"
                />\` : 
                '<p style="margin: 5px 0; color: #666;">No image available</p>'
              }
            </div>
          \`);
      `;
    });
  }

  // Update the polylineJS generation in getMapHTML function
  let polylineJS = "";
  if (
    (typeof roadPath === "string" && roadPath.length > 0) ||
    (Array.isArray(roadPath) && roadPath.length > 0)
  ) {
    let polylineCoordinates;
    if (typeof roadPath === "string") {
      const decoded = polyline.decode(roadPath);
      polylineCoordinates = decoded.map((coord: number[]) => [
        coord[0],
        coord[1],
      ]);
    } else {
      polylineCoordinates = roadPath.map((coord: any) =>
        Array.isArray(coord) ? coord : [coord.latitude, coord.longitude]
      );
    }

    if (polylineCoordinates && polylineCoordinates.length > 0) {
      polylineJS = `
      var roadPolyline = L.polyline([], { 
        color: '${polylineColor}', 
        weight: 3,
        smoothFactor: 1
      }).addTo(map);
      
      var coordinates = ${JSON.stringify(polylineCoordinates)};
      var chunkSize = ${Math.max(
        1,
        Math.floor(polylineCoordinates.length / 50)
      )};
      var index = 0;
      
      function animatePolyline() {
        if (index >= coordinates.length) {
          map.fitBounds(roadPolyline.getBounds());
          return;
        }
        var chunk = coordinates.slice(0, index + chunkSize);
        roadPolyline.setLatLngs(chunk);
        index += chunkSize;
        setTimeout(animatePolyline, 30);
      }
      animatePolyline();
    `;
    }
  }

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
          ${polylinesJS}
          ${fitBoundsJS}
          ${messageListenerJS}
        </script>
      </body>
    </html>
  `;

  // The fallback else if block for a straight line has been removed.

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      ${fontAwesomeCSS}
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
        window.map = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        ${markersJS}
        ${polylineJS}
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
  polylineColor,
  webviewRef,
  nearbySpots,
  selectedSpot, // New prop for the selected spot
  isLoading, // New prop for loading state
}) => {
  // Updated mapKey: added nearbySpots to the dependency array.
  const mapKey = JSON.stringify({
    initialRegion,
    route,
    roadPath,
    mapResetKey,
    nearbySpots,
  });
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // New: Ref for WebView and state to track when it is ready.
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  const handleLoadEnd = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (isWebViewReady && selectedSpot) {
      const js = `
      if (window.map) {
        const targetLat = ${selectedSpot.latitude};
        const targetLng = ${selectedSpot.longitude};
        
        // Fly to the selected spot with zoom
        window.map.flyTo([targetLat, targetLng], 16, {
          animate: true,
          duration: 2
        });

        // Highlight the marker
        window.map.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            const latLng = layer.getLatLng();
            if (Math.abs(latLng.lat - targetLat) < 0.000001 && 
                Math.abs(latLng.lng - targetLng) < 0.000001) {
              layer.openPopup();
              layer.setIcon(
                L.divIcon({
                  html: '<div style="background-color: #fff; border: 2px solid #dc3545; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-mountain-sun" style="color: #dc3545; font-size: 16px;"></i></div>',
                  className: 'selected-icon',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
                })
              );
            } else {
              layer.setIcon(
                L.divIcon({
                  html: '<div style="background-color: #fff; border: 2px solid #28a745; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-mountain-sun" style="color: #28a745; font-size: 16px;"></i></div>',
                  className: 'custom-icon',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
                })
              );
            }
          }
        });
      }
    `;
      webViewRef.current?.injectJavaScript(js);
    }
  }, [selectedSpot, isWebViewReady]);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webviewRef}
        // ref={webViewRef}
        key={mapKey}
        originWhitelist={["*"]}
        source={{
          html: getMapHTML(
            initialRegion,
            route,
            roadPath,
            polylineColor,
            nearbySpots
          ),
        }}
        style={style}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          handleLoadEnd();
          setIsWebViewReady(true);
        }}
      />
      {loading || isLoading ? (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: fadeAnim,
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <ActivityIndicator size="large" color="#6366F1" />
        </Animated.View>
      ) : null}
    </View>
  );
};

const SuggestionList: React.FC<{
  suggestions: any[];
  onSelect: (item: any) => void;
}> = ({ suggestions, onSelect }) => {
  if (!suggestions.length) return null;
  return (
    <ScrollView
      style={styles.suggestionList}
      keyboardShouldPersistTaps="handled"
    >
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
    latitude: 14.676,
    longitude: 121.0437,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [origin, setOrigin] = useState<string>("");
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destination, setDestination] = useState<string>("");
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>(
    []
  );
  const [route, setRoute] = useState<LatLng[]>([]);
  const [roadPath, setRoadPath] = useState<
    LatLng[] | string | LatLng[][] | SegmentPath[]
  >([]);
  const [routeDetails, setRouteDetails] = useState<RouteDetails>({
    route: null,
  });
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics | null>(null);
  const [mapResetKey, setMapResetKey] = useState<number>(Date.now());
  const [manualOrigin, setManualOrigin] = useState<boolean>(false);
  const [polylineColor, setPolylineColor] = useState<string>("#6366F1");
  const [isOriginLoading, setIsOriginLoading] = useState(false);
  const [isDestinationLoading, setIsDestinationLoading] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  // -------------------------
  // New State for Nearby Spots
  // -------------------------
  const [nearbySpots, setNearbySpots] = useState<NearbySpot[]>([]);
  // -------------------------
  // New State for Selected Spot (for map fly-to)
  // -------------------------
  const [selectedSpot, setSelectedSpot] = useState<LatLng | null>(null);

  const router = useRouter();
  const animatedHeight = useRef(new Animated.Value(400)).current;
  const [expandedSegments, setExpandedSegments] = useState<{
    [index: number]: boolean;
  }>({});
  const webviewRef = useRef<WebView>(null);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Bagong handleToggleSegment na nagpapadala ng mensahe sa WebView
  const handleToggleSegment = (idx: number) => {
    setExpandedSegments((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
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
          fetchRouteDetails(selected.lat, selected.lon);
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
          parsedAttraction.longitude
        );
        setMapResetKey(Date.now());
      } catch (error) {
        console.error("Error parsing attraction parameter:", error);
      }
    }
  }, [attraction]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (status !== "granted" || !servicesEnabled) {
        console.log("Location permission not granted or services disabled.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const locAddr =
        addresses && addresses.length > 0
          ? `${addresses[0].name ? addresses[0].name + ", " : ""}${
              addresses[0].street ? addresses[0].street + ", " : ""
            }${addresses[0].city}, ${addresses[0].region}`
          : "Unknown Location";
      setRegion((prev) => ({ ...prev, latitude, longitude }));
      if (!manualOrigin && !origin) {
        setOrigin(locAddr);
        setRoute((prev) =>
          prev.length > 0
            ? [{ latitude, longitude }, ...prev.slice(1)]
            : [{ latitude, longitude }]
        );
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

  // const clearOrigin = () => {
  //   setOrigin('');
  //   setOriginSuggestions([]);
  //   setDestination('');
  //   setDestinationSuggestions([]);
  //   setRoute([]);
  //   setRouteDetails({ route: null });
  //   setRoadPath([]);
  // };

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

    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }

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
    setNearbySpots([]); // Added to clear nearby spots
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
      await fetchRouteDetails(newRoute[1].latitude, newRoute[1].longitude);
    }
  };

  const handleDestinationChange = async (text: string) => {
    setDestination(text);
    if (!text) {
      setDestinationSuggestions([]);
      setIsDestinationLoading(false);
      return;
    }
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
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
    await fetchRouteDetails(item.lat, item.lon);
    setMapResetKey(Date.now());
  };

  const { addPost } = usePostContext();
  const fetchRouteDetails = async (destLat: number, destLon: number) => {
    setIsRouteLoading(true);
    setNearbySpots([]); // Reset nearby spots state
    setSelectedSpot(null); // Also reset selected spot if needed
    setRoadPath([]); // Clear previous path before fetching new data

    const params = {
      origin_lat: route.length > 0 ? route[0].latitude : region.latitude,
      origin_lon: route.length > 0 ? route[0].longitude : region.longitude,
      destination_lat: destLat,
      destination_lon: destLon,
    };

    console.log("Request Params:", params);

    try {
      const response = await axios.get<ApiResponse>(
        "https://comgu20-production.up.railway.app/api/routes/find",
        { params }
      );

      // Update nearby spots only if new data contains them
      if (response.data.nearby_spots) {
        setNearbySpots(response.data.nearby_spots); // Set spots immediately
      }

      const processedPosts = response.data.posts.map((post) => ({
        ...post,
        origin_address: origin,
        destination_address: destination,
        origin_lat: region.latitude,
        origin_lon: region.longitude,
        destination_lat: destLat,
        destination_lon: destLon,
        user: {
          ...post.user,
          email: post.user.email || "",
        },
      }));

      processedPosts.forEach((p) => addPost(p, "routes"));

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

      // Pag-set ng roadPath batay sa API response
      // if (response.data.polyline && typeof response.data.polyline === 'string' && response.data.polyline.length > 0) {

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

  const detailsContent = (
    <View style={styles.container}>
      <Text style={styles.text}>Details</Text>
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
            <ActivityIndicator
              style={styles.loadingIndicator}
              size="small"
              color="#6366F1"
            />
          )}
          {origin !== "" && (
            <TouchableOpacity style={styles.clearButton} onPress={clearOrigin}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <SuggestionList
          suggestions={originSuggestions}
          onSelect={selectOriginSuggestion}
        />
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
          {isDestinationLoading && (
            <ActivityIndicator
              style={styles.loadingIndicator}
              size="small"
              color="#6366F1"
            />
          )}
          {destination !== "" && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setDestination("");
                setNearbySpots([]); // Added to clear nearby spots
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

        {/*new modal */}
        <TouchableOpacity
          style={styles.twobox}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.texttwo}>Restaurants Modal</Text>
        </TouchableOpacity>
        <ModalComponent
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        <SuggestionList
          suggestions={destinationSuggestions}
          onSelect={selectDestinationSuggestion}
        />
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
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: "#6B7280",
              marginBottom: 18,
            }}
          >
            Route Overview
          </Text>
          {renderRouteOverview()}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <TouchableOpacity
              style={styles.twobox}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.texttwo}>Nearby Attractions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.twobox}
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
              <Text style={styles.texttwo}>Route Post Suggestions</Text>
            </TouchableOpacity>
          </View>
          {route.length >= 2 && (
            <ReviewModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              originCoords={route[0]}
              destinationCoords={route[1]}
              nearbySpots={nearbySpots}
              onSpotsFetched={(spots) => setNearbySpots(spots)}
              onSpotSelect={(selectedSpot) => {
                // Clear existing nearby spots immediately
                setNearbySpots([]);

                // Update destination text
                setDestination(selectedSpot.name);

                // Define new destination coordinates
                const newDestination = {
                  latitude: selectedSpot.latitude,
                  longitude: selectedSpot.longitude,
                };

                // Reset road path immediately
                setRoadPath([]);

                // Determine current origin (existing route's start point or current location)
                const currentOrigin =
                  route.length > 0
                    ? route[0]
                    : {
                        latitude: region.latitude,
                        longitude: region.longitude,
                      };

                // Update route with new destination
                setRoute([currentOrigin, newDestination]);

                // Fetch new route details and nearby spots
                fetchRouteDetails(
                  newDestination.latitude,
                  newDestination.longitude
                );

                // Close the modal
                setModalVisible(false);

                // Update selected spot for map focus
                setSelectedSpot(newDestination);
              }}
              onSpotView={(selectedSpot) => {
                // New handler to update map focus when viewing a spot
                setSelectedSpot({
                  latitude: selectedSpot.latitude,
                  longitude: selectedSpot.longitude,
                });
                setModalVisible(false); // Added line to close the modal
              }}
            />
          )}
        </View>
      ) : (
        <View style={styles.oopsContainer}>
          <Image
            source={require("../../assets/images/opz.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.errorText}>Oops!</Text>
          <Text style={styles.errorSubText}>
            Search for your location and destination.
          </Text>
        </View>
      )}
    </View>
  );

  if (route.length >= 2) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <Animated.View
          style={[styles.mapContainer, { height: animatedHeight }]}
        >
          <MapComponent
            initialRegion={region}
            route={route}
            roadPath={roadPath}
            mapResetKey={mapResetKey}
            style={styles.map}
            polylineColor={polylineColor}
            webviewRef={webviewRef}
            nearbySpots={nearbySpots} // Pass nearby spots to the map
            selectedSpot={selectedSpot} // New prop for selected spot
            isLoading={isRouteLoading} // New isLoading prop
          />
        </Animated.View>
        <ScrollView
          style={[styles.detailsContainer, { backgroundColor: "#FFFFFF" }]}
          contentContainerStyle={styles.contentContainer}
        >
          {detailsContent}
        </ScrollView>
      </View>
    );
  } else {
    return (
      <ScrollView
        style={[styles.maincontainer, { backgroundColor: "#FFFFFF" }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View
          style={[styles.mapContainer, { height: animatedHeight }]}
        >
          <MapComponent
            initialRegion={region}
            route={route}
            roadPath={roadPath}
            mapResetKey={mapResetKey}
            style={styles.map}
            polylineColor={polylineColor}
            webviewRef={webviewRef}
          />
        </Animated.View>
        {detailsContent}
      </ScrollView>
    );
  }
};

export default RouteScreen;

// -------------------------
// Cache for geocoding results
// -------------------------
const locationCacheRef = { current: {} as { [key: string]: any[] } };

// -------------------------
// Styles
// -------------------------
const styles = StyleSheet.create({
  maincontainer: { width: "100%", backgroundColor: "#FFFFFF" },
  detailsContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  contentContainer: { paddingBottom: 30 },
  mapContainer: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    width: "100%",
    marginTop: 15,
  },
  map: { height: "100%", width: "100%" },
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
    maxHeight: 150,
  },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
  suggestionText: { color: "#444" },
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
  overviewText: { fontSize: 12, color: "#44457D", marginVertical: 4 },
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
  twobox: {
    borderRadius: 6,
    backgroundColor: "#E0E7FF",
    paddingVertical: 5,
    paddingHorizontal: 12,
    margin: 4,
  },
  texttwo: { fontSize: 12, color: "#6366F1", fontWeight: "500" },
});