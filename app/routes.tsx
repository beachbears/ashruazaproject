// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   LogBox,
//   TouchableWithoutFeedback,
//   Image,
//   Animated,
//   ActivityIndicator,
//   LayoutChangeEvent,
// } from 'react-native';
// import axios from 'axios';
// import { WebView } from 'react-native-webview';
// import * as Location from 'expo-location';
// import { Ionicons } from '@expo/vector-icons';
// import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
// import ReviewModal from './reviewmodal';

// const polyline = require('@mapbox/polyline');

// LogBox.ignoreLogs(['textShadow*', 'shadow*']);

// // -------------------------
// // Interfaces & Types
// // -------------------------
// interface LocationSuggestion {
//   label: string;
//   latitude: string;
//   longitude: string;
// }

// interface Region {
//   latitude: number;
//   longitude: number;
//   latitudeDelta?: number;
//   longitudeDelta?: number;
// }

// export interface Stop {
//   id: string;
//   stop_id: string;
//   name: string;
//   latitude: number;
//   longitude: number;
//   created_at: string;
//   updated_at: string;
// }

// export interface Segment {
//   type: string; // "Jeep" / "Bus" / "Ejeep" / "LRT" / "MRT" / "walking"
//   distance?: number;
//   duration?: number;
//   geometry?: string;
//   walking?: boolean | null;
//   vehicle_type?: string | null;
//   boarding?: string;
//   alighting?: string;
//   from_stop?: Stop;
//   to_stop?: Stop;
//   steps?: { step_number: number; instruction: string }[];
//   alternatives?: any[]; // Alternative vehicles mula sa API JSON
// }

// export interface Route {
//   stops: Stop[];
//   segments: Segment[];
//   summary?: {
//     total_fare: number;
//     total_duration: number;
//     total_distance: number;
//     total_distance_km: number;
//     vehicle_types: string[];
//   };
// }

// export interface User {
//   id: number;
//   username: string;
// }

// export interface Post {
//   id: number;
//   content: string;
//   user: User;
//   votes: number;
//   comments_count: number;
//   created_at: string;
// }

// export interface NearbySpot {
//   name: string;
//   description: string;
//   latitude: number;
//   longitude: number;
// }

// export interface ApiResponse {
//   route: Route;
//   posts: Post[];
//   nearby_spots: NearbySpot[];
//   polyline?: LatLng[] | string;
// }

// export interface LatLng {
//   latitude: number;
//   longitude: number;
// }

// interface MapComponentProps {
//   initialRegion: Region;
//   route?: LatLng[];
//   roadPath?: LatLng[] | string;
//   style?: any;
//   mapResetKey?: number;
//   polylineColor: string;
// }

// interface RouteDetails {
//   route: Route | null;
// }

// interface RouteMetrics {
//   distance: number;
//   fare: number;
//   walkingTime: string;
//   carTime: string;
//   busTime: string;
// }

// // -------------------------
// // Helper Functions
// // -------------------------
// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// function formatDuration(seconds: number): string {
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   if (mins >= 60) {
//     const hours = Math.floor(mins / 60);
//     const remainingMins = mins % 60;
//     return `${hours} hr ${remainingMins} min`;
//   } else if (mins > 0) {
//     return `${mins} min ${secs}s`;
//   } else {
//     return `${secs}s`;
//   }
// }

// // Generate HTML for the Leaflet map
// const getMapHTML = (
//   region: Region,
//   route: LatLng[] = [],
//   roadPath: any,
//   polylineColor: string
// ) => {
//   let markersJS = "";
//   if (route.length > 0) {
//     markersJS += `
//       var currentMarker = L.marker([${route[0].latitude}, ${route[0].longitude}])
//         .addTo(map)
//         .bindPopup("Current Location").openPopup();
//     `;
//     if (route.length >= 2) {
//       markersJS += `
//         var destinationMarker = L.marker([${route[1].latitude}, ${route[1].longitude}])
//           .addTo(map)
//           .bindPopup("Destination");
//       `;
//     }
//   }
//   let polylineJS = "";
//   if (roadPath) {
//     let polylineCoordinates;
//     if (typeof roadPath === "string") {
//       const decoded = polyline.decode(roadPath);
//       polylineCoordinates = decoded.map((coord: number[]) => [coord[0], coord[1]]);
//     } else if (Array.isArray(roadPath) && roadPath.length > 0) {
//       if (Array.isArray(roadPath[0])) {
//         polylineCoordinates = roadPath;
//       } else {
//         polylineCoordinates = roadPath.map((coord: any) => [
//           coord.latitude,
//           coord.longitude,
//         ]);
//       }
//     }
//     if (polylineCoordinates && polylineCoordinates.length > 0) {
//       polylineJS = `var roadPolyline = L.polyline(${JSON.stringify(
//         polylineCoordinates
//       )}, { color: '${polylineColor}', weight: 3 }).addTo(map);`;
//     }
//   } else if (route.length === 2) {
//     polylineJS = `var polyline = L.polyline([
//       [${route[0].latitude}, ${route[0].longitude}],
//       [${route[1].latitude}, ${route[1].longitude}]
//     ], { color: '${polylineColor}', weight: 3 }).addTo(map);`;
//   }
//   let fitBoundsJS = `
//     if (typeof roadPolyline !== 'undefined') {
//       map.fitBounds(roadPolyline.getBounds());
//     } else if (typeof polyline !== 'undefined') {
//       map.fitBounds(polyline.getBounds());
//     }
//   `;
//   return `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
//         <style>
//           html, body { margin: 0; padding: 0; height: 100%; }
//           #map { height: 100%; width: 100%; }
//         </style>
//       </head>
//       <body>
//         <div id="map"></div>
//         <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
//         <script>
//           var map = L.map('map').setView([${region.latitude}, ${region.longitude}], 13);
//           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: '© OpenStreetMap contributors'
//           }).addTo(map);
//           ${markersJS}
//           ${polylineJS}
//           ${fitBoundsJS}
//         </script>
//       </body>
//     </html>
//   `;
// };

// // -------------------------
// // MapComponent with Loading Animation
// // -------------------------
// const MapComponent: React.FC<MapComponentProps> = ({
//   initialRegion,
//   route = [],
//   roadPath = [],
//   style,
//   mapResetKey,
//   polylineColor,
// }) => {
//   const mapKey = JSON.stringify({ initialRegion, route, roadPath, mapResetKey });
//   const [loading, setLoading] = useState(true);
//   const fadeAnim = useRef(new Animated.Value(1)).current;
//   const handleLoadEnd = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 500,
//       useNativeDriver: true,
//     }).start(() => setLoading(false));
//   };
//   return (
//     <View style={{ flex: 1 }}>
//       <WebView
//         key={mapKey}
//         originWhitelist={['*']}
//         source={{ html: getMapHTML(initialRegion, route, roadPath, polylineColor) }}
//         style={style}
//         onLoadStart={() => setLoading(true)}
//         onLoadEnd={handleLoadEnd}
//       />
//       {loading && (
//         <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }]}>
//           <ActivityIndicator size="large" color="#6366F1" />
//         </Animated.View>
//       )}
//     </View>
//   );
// };

// // -------------------------
// // DynamicSegment Component
// // -------------------------
// interface DynamicSegmentProps {
//   segment: Segment;
//   segType: string;
// }

// const DynamicSegment: React.FC<DynamicSegmentProps> = ({ segment, segType }) => {
//   const [getOnCenter, setGetOnCenter] = useState(0);
//   const [getOffCenter, setGetOffCenter] = useState(0);

//   return (
//     <View style={styles.dynamicSegmentContainer}>
//       {/* GET ON */}
//       <View
//         style={styles.dynamicGetOnBlock}
//         onLayout={(e: LayoutChangeEvent) => {
//           const { y, height } = e.nativeEvent.layout;
//           setGetOnCenter(y + height / 2);
//         }}
//       >
//         <Text style={[styles.segmentTitle, { color: 'green' }]}>Get on</Text>
//         <Text style={styles.segmentInstruction}>
//           Ride a {segment.vehicle_type ? segment.vehicle_type.toLowerCase() : segType} from {segment.from_stop?.name} going towards {segment.to_stop?.name}.
//         </Text>
//       </View>

//       {/* GET OFF */}
//       <View
//         style={styles.dynamicGetOffBlock}
//         onLayout={(e: LayoutChangeEvent) => {
//           const { y, height } = e.nativeEvent.layout;
//           setGetOffCenter(y + height / 2);
//         }}
//       >
//         <Text style={[styles.segmentTitle, { color: 'blue' }]}>Get off</Text>
//         <Text style={styles.segmentInstruction}>
//           Arrive at {segment.to_stop?.name}, then get off at your stop.
//         </Text>
//       </View>

//       {/* Alternative Vehicles */}
//       {segment.alternatives && segment.alternatives.length > 0 && (
//         <View style={styles.altVehiclesContainer}>
//           <Text style={styles.altVehiclesHeader}>Alternative Vehicles</Text>
//           {segment.alternatives.map((alt, idx) => {
//             const altDurationMins = Math.ceil(alt.duration / 60);
//             return (
//               <View key={idx} style={styles.altVehicleItem}>
//                 <Text style={styles.altVehicleText}>
//                   {alt.type} - {alt.route_name} | Fare: {alt.fare} | Duration: {formatDuration(alt.duration)}
//                 </Text>
//               </View>
//             );
//           })}
//         </View>
//       )}

//       {/* Bullets & vertical line */}
//       <View style={styles.dynamicBulletContainer} pointerEvents="none">
//         <View style={[styles.greenBullet, { top: getOnCenter - 7 }]} />
//         <View style={[styles.blueBullet, { top: getOffCenter - 7 }]} />
//         <View style={[styles.verticalLine, { top: getOnCenter, height: Math.max(0, getOffCenter - getOnCenter) }]} />
//       </View>
//     </View>
//   );
// };

// // -------------------------
// // RouteScreen Component
// // -------------------------
// const RouteScreen: React.FC = () => {
//   const { destination: destParam, attraction } = useLocalSearchParams();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [region, setRegion] = useState<Region>({
//     latitude: 14.6760,
//     longitude: 121.0437,
//     latitudeDelta: 0.1,
//     longitudeDelta: 0.1,
//   });
//   const [origin, setOrigin] = useState<string>("");
//   const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
//   const [destination, setDestination] = useState<string>("");
//   const [route, setRoute] = useState<LatLng[]>([]);
//   const [roadPath, setRoadPath] = useState<LatLng[] | string>([]);
//   const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
//   const [routeDetails, setRouteDetails] = useState<RouteDetails>({ route: null });
//   const [routeMetrics, setRouteMetrics] = useState<RouteMetrics | null>(null);
//   const [mapResetKey, setMapResetKey] = useState<number>(Date.now());
//   const [manualOrigin, setManualOrigin] = useState<boolean>(false);
//   const [polylineColor, setPolylineColor] = useState<string>("#6366F1");
//   const [alternatives, setAlternatives] = useState<any[]>([]);
//   const [isOriginLoading, setIsOriginLoading] = useState(false);
//   const [isDestinationLoading, setIsDestinationLoading] = useState(false);
//   const [isRouteLoading, setIsRouteLoading] = useState(false);

//   const router = useRouter();
//   const animatedHeight = useRef(new Animated.Value(400)).current;

//   useEffect(() => {
//     if (destParam) {
//       setDestination(destParam as string);
//       setRoadPath([]);
//       setMapResetKey(Date.now());
//       geocodeAddress(destParam as string).then((suggestions: any) => {
//         if (suggestions && suggestions.length > 0) {
//           const selected = suggestions[0];
//           setRoute(prev => {
//             if (prev.length > 0) {
//               return [prev[0], { latitude: selected.lat, longitude: selected.lon }];
//             } else {
//               return [
//                 { latitude: region.latitude, longitude: region.longitude },
//                 { latitude: selected.lat, longitude: selected.lon },
//               ];
//             }
//           });
//           fetchRouteDetails(selected.lat, selected.lon);
//         }
//       });
//     }
//   }, [destParam]);

//   useEffect(() => {
//     if (attraction) {
//       try {
//         const parsedAttraction = JSON.parse(attraction as string);
//         setDestination(parsedAttraction.name);
//         setRoute([
//           region,
//           { latitude: parsedAttraction.latitude, longitude: parsedAttraction.longitude },
//         ]);
//         fetchRouteDetails(parsedAttraction.latitude, parsedAttraction.longitude);
//         setMapResetKey(Date.now());
//       } catch (error) {
//         console.error("Error parsing attraction parameter:", error);
//       }
//     }
//   }, [attraction]);

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       const servicesEnabled = await Location.hasServicesEnabledAsync();
//       if (status !== 'granted' || !servicesEnabled) {
//         console.log("Location permission not granted or services disabled.");
//         return;
//       }
//       const { coords } = await Location.getCurrentPositionAsync({});
//       const { latitude, longitude } = coords;
//       setRegion(prev => ({ ...prev, latitude, longitude }));

//       const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
//       const locAddr =
//         addresses && addresses.length > 0
//           ? `${addresses[0].name ? addresses[0].name + ', ' : ''}${addresses[0].street ? addresses[0].street + ', ' : ''}${addresses[0].city}, ${addresses[0].region}`
//           : 'Unknown Location';

//       if (!manualOrigin && !origin) {
//         setOrigin(locAddr);
//         setRoute(prev =>
//           prev.length > 0 ? [{ latitude, longitude }, ...prev.slice(1)] : [{ latitude, longitude }]
//         );
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     Animated.timing(animatedHeight, {
//       toValue: route.length >= 2 ? 400 : 200,
//       duration: 500,
//       useNativeDriver: false,
//     }).start();
//   }, [route, animatedHeight]);

//   // Optional: Refetch route details kapag nagbago ang origin (route[0]) at may destination
//   useEffect(() => {
//     if (route.length === 2) {
//       fetchRouteDetails(route[1].latitude, route[1].longitude);
//     }
//   }, [route[0]]);

//   async function geocodeAddress(address: string) {
//     try {
//       const { data } = await axios.get<LocationSuggestion[]>(
//         'https://comgu20-production.up.railway.app/api/locations/search',
//         { params: { term: address } }
//       );
//       let results: any[] = [];
//       if (data && data.length) {
//         results = data.map((item: LocationSuggestion) => ({
//           name: item.label,
//           lat: parseFloat(item.latitude),
//           lon: parseFloat(item.longitude),
//         }));
//       }
//       return results;
//     } catch (err) {
//       console.error('Geocoding error:', err);
//       await sleep(1000);
//       return [];
//     }
//   }

//   const handleOriginChange = async (text: string) => {
//     setOrigin(text);
//     if (!text) {
//       setOriginSuggestions([]);
//       return;
//     }
//     setIsOriginLoading(true);
//     const suggestions = await geocodeAddress(text);
//     setOriginSuggestions(suggestions);
//     setIsOriginLoading(false);
//   };

//   const updateOriginRoute = async () => {
//     const suggestions = await geocodeAddress(origin);
//     if (suggestions && suggestions.length > 0) {
//       const selected = suggestions[0];
//       setRegion(prev => ({ ...prev, latitude: selected.lat, longitude: selected.lon }));
//       setRoute(prev => {
//         // Gumawa ng bagong route na may updated origin
//         const newRoute = prev.length > 0
//           ? [{ latitude: selected.lat, longitude: selected.lon }, ...prev.slice(1)]
//           : [{ latitude: selected.lat, longitude: selected.lon }];
//         // I-reset ang route details at roadPath
//         setRouteDetails({ route: null });
//         setRoadPath([]);
//         // Kung may destination, i-fetch ang bagong route details
//         if (newRoute.length === 2 && newRoute[1]) {
//           fetchRouteDetails(newRoute[1].latitude, newRoute[1].longitude);
//         }
//         return newRoute;
//       });
//       setManualOrigin(true);
//       setMapResetKey(Date.now());
//     }
//   };

//   const selectOriginSuggestion = async (item: any) => {
//     setOrigin(item.name);
//     setOriginSuggestions([]);
//     setRegion(prev => ({ ...prev, latitude: item.lat, longitude: item.lon }));
//     setRoute(prev => {
//       const newRoute = prev.length > 0
//         ? [{ latitude: item.lat, longitude: item.lon }, ...prev.slice(1)]
//         : [{ latitude: item.lat, longitude: item.lon }];
//       // I-reset ang route details at roadPath
//       setRouteDetails({ route: null });
//       setRoadPath([]);
//       if (newRoute.length === 2 && newRoute[1]) {
//         fetchRouteDetails(newRoute[1].latitude, newRoute[1].longitude);
//       }
//       return newRoute;
//     });
//     setManualOrigin(true);
//     setMapResetKey(Date.now());
//   };

//   const handleDestinationChange = async (text: string) => {
//     setDestination(text);
//     if (!text) {
//       setDestinationSuggestions([]);
//       return;
//     }
//     setIsDestinationLoading(true);
//     const suggestions = await geocodeAddress(text);
//     setDestinationSuggestions(suggestions);
//     setIsDestinationLoading(false);
//   };

//   const selectDestinationSuggestion = async (item: any) => {
//     setDestination(item.name);
//     setDestinationSuggestions([]);
//     setRoadPath([]);
//     setRoute(prev =>
//       prev.length > 0
//         ? [prev[0], { latitude: item.lat, longitude: item.lon }]
//         : [
//             { latitude: region.latitude, longitude: region.longitude },
//             { latitude: item.lat, longitude: item.lon },
//           ]
//     );
//     await fetchRouteDetails(item.lat, item.lon);
//     setMapResetKey(Date.now());
//   };

//   const fetchRouteDetails = async (destLat: number, destLon: number) => {
//     setIsRouteLoading(true);
//     const params = {
//       origin_lat: region.latitude,
//       origin_lon: region.longitude,
//       destination_lat: destLat,
//       destination_lon: destLon,
//     };
//     console.log("Request Params:", params);
//     try {
//       const response = await axios.get<ApiResponse>(
//         'https://comgu20-production.up.railway.app/api/routes/find',
//         { params }
//       );
//       console.log("API Response:", response.data);
//       const routeData = response.data.route;

//       // Aggregate alternatives mula sa bawat segment
//       if (routeData && routeData.segments) {
//         let alternativesFound: any[] = [];
//         routeData.segments.forEach(segment => {
//           if (segment.alternatives && segment.alternatives.length > 0) {
//             alternativesFound = alternativesFound.concat(segment.alternatives);
//           }
//         });
//         setAlternatives(alternativesFound);
//       }

//       setRouteDetails({ route: routeData });

//       if (routeData && routeData.summary) {
//         const summary = routeData.summary;
//         const formattedDuration = formatDuration(summary.total_duration);
//         let totalWalkingDistance = 0;
//         if (routeData.segments && routeData.segments.length > 0) {
//           routeData.segments.forEach(segment => {
//             if (segment.type.toLowerCase() === "walking" && segment.distance) {
//               totalWalkingDistance += segment.distance;
//             }
//           });
//         }
//         setRouteMetrics({
//           distance: summary.total_distance_km || 0,
//           fare: summary.total_fare || 0,
//           walkingTime: totalWalkingDistance ? `${(totalWalkingDistance / 1000).toFixed(2)} km` : '',
//           carTime: formattedDuration,
//           busTime: '',
//         });
//       } else {
//         setRouteMetrics(null);
//       }

//       if (routeData && routeData.segments && routeData.segments.length > 0) {
//         const allWalking = routeData.segments.every(seg => seg.walking);
//         setPolylineColor(allWalking ? "#808080" : "#6366F1");
//       } else {
//         setPolylineColor("#6366F1");
//       }

//       if (response.data.polyline && response.data.polyline.length > 0) {
//         setRoadPath(response.data.polyline);
//       } else if (routeData && routeData.segments && routeData.segments.length > 0) {
//         let combinedPath: LatLng[] = [];
//         const tolerance = 0.0001;
//         routeData.segments.forEach(segment => {
//           if (segment.geometry) {
//             const decodedCoords = polyline.decode(segment.geometry).map(
//               (coord: number[]) => ({
//                 latitude: coord[0],
//                 longitude: coord[1],
//               })
//             );
//             if (combinedPath.length > 0) {
//               const lastPoint = combinedPath[combinedPath.length - 1];
//               const firstNew = decodedCoords[0];
//               if (
//                 Math.abs(lastPoint.latitude - firstNew.latitude) < tolerance &&
//                 Math.abs(lastPoint.longitude - firstNew.longitude) < tolerance
//               ) {
//                 combinedPath = combinedPath.concat(decodedCoords.slice(1));
//               } else {
//                 combinedPath = combinedPath.concat(decodedCoords);
//               }
//             } else {
//               combinedPath = combinedPath.concat(decodedCoords);
//             }
//           }
//         });
//         setRoadPath(combinedPath);
//       } else if (route.length === 2) {
//         setRoadPath(route);
//       } else {
//         setRoadPath([]);
//       }
//     } catch (error) {
//       console.error("Error fetching route details:", error);
//     } finally {
//       setIsRouteLoading(false);
//     }
//   };

//   const renderRouteOverview = () => {
//     if (isRouteLoading) {
//       return <ActivityIndicator size="small" color="#6366F1" />;
//     }
//     if (!routeDetails.route) {
//       return <Text style={styles.overviewText}>No route overview available</Text>;
//     }
//     const { segments } = routeDetails.route;
//     return (
//       <View>
//         {segments &&
//           segments.map((segment, idx) => {
//             const segType = segment.type.toLowerCase();
//             if (segType === "walking") {
//               return (
//                 <Text key={idx} style={styles.bulletItem}>
//                   • Walk from {segment.from_stop?.name} to {segment.to_stop?.name}
//                 </Text>
//               );
//             } else if (["jeep", "bus", "ejeep", "lrt", "mrt"].includes(segType)) {
//               return <DynamicSegment key={idx} segment={segment} segType={segType} />;
//             } else {
//               return null;
//             }
//           })}
//       </View>
//     );
//   };

//   const detailsContent = (
//     <View style={styles.container}>
//       <Text style={styles.text}>Details</Text>
//       {/* Origin Input */}
//       <Text style={styles.label}>Origin</Text>
//       <View style={styles.searchContainer}>
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.userInput}
//             placeholder="Enter origin (default is current location)"
//             placeholderTextColor="#666"
//             value={origin}
//             onChangeText={handleOriginChange}
//             onSubmitEditing={updateOriginRoute}
//             onBlur={updateOriginRoute}
//             multiline={false}
//           />
//           {isOriginLoading && (
//             <ActivityIndicator style={styles.loadingIndicator} size="small" color="#6366F1" />
//           )}
//           {origin !== "" && (
//             <TouchableOpacity style={styles.clearButton} onPress={() => setOrigin("")}>
//               <Ionicons name="close" size={20} color="#666" />
//             </TouchableOpacity>
//           )}
//         </View>
//         {originSuggestions.length > 0 && (
//           <ScrollView style={styles.suggestionList} keyboardShouldPersistTaps="handled">
//             {originSuggestions.map((item, index) => (
//               <TouchableWithoutFeedback key={`${item.name}-${index}`} onPress={() => selectOriginSuggestion(item)}>
//                 <View style={styles.suggestionItem}>
//                   <Text style={styles.suggestionText}>{item.name}</Text>
//                 </View>
//               </TouchableWithoutFeedback>
//             ))}
//           </ScrollView>
//         )}
//       </View>

//       {/* Destination Input */}
//       <Text style={styles.label}>Destination</Text>
//       <View style={styles.searchContainer}>
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.userInput}
//             placeholder="Intramuros, Manila City"
//             placeholderTextColor="#666"
//             value={destination}
//             onChangeText={handleDestinationChange}
//             multiline={false}
//           />
//           {isDestinationLoading && (
//             <ActivityIndicator style={styles.loadingIndicator} size="small" color="#6366F1" />
//           )}
//           {destination !== "" && (
//             <TouchableOpacity
//               style={styles.clearButton}
//               onPress={() => {
//                 setDestination("");
//                 setDestinationSuggestions([]);
//                 setRoute(prev => (prev.length > 0 ? [prev[0]] : []));
//                 setRouteDetails({ route: null });
//                 setRoadPath([]);
//                 setMapResetKey(Date.now());
//               }}
//             >
//               <Ionicons name="close" size={20} color="#666" />
//             </TouchableOpacity>
//           )}
//         </View>
//         {destinationSuggestions.length > 0 && (
//           <ScrollView style={styles.suggestionList} keyboardShouldPersistTaps="handled">
//             {destinationSuggestions.map((item, index) => (
//               <TouchableWithoutFeedback key={`${item.name}-${index}`} onPress={() => selectDestinationSuggestion(item)}>
//                 <View style={styles.suggestionItem}>
//                   <Text style={styles.suggestionText}>{item.name}</Text>
//                 </View>
//               </TouchableWithoutFeedback>
//             ))}
//           </ScrollView>
//         )}
//       </View>

//       {/* Route Metrics */}
//       {route.length >= 2 && routeMetrics && (
//         <View style={styles.topInfoRow}>
//           <View style={styles.infoBox}>
//             <FontAwesome5 name="map-marker-alt" size={16} color="#44457D" />
//             <Text style={styles.infoBoxLabel}>{routeMetrics.distance} km</Text>
//           </View>
//           <View style={styles.infoBox}>
//             <FontAwesome5 name="money-bill-wave" size={16} color="#44457D" />
//             <Text style={styles.infoBoxLabel}>Fare: {routeMetrics.fare}</Text>
//           </View>
//           <View style={styles.infoBox}>
//             <FontAwesome5 name="walking" size={16} color="#44457D" />
//             <Text style={styles.infoBoxLabel}>{routeMetrics.walkingTime}</Text>
//           </View>
//           <View style={styles.infoBox}>
//             <FontAwesome5 name="car" size={16} color="#44457D" />
//             <Text style={styles.infoBoxLabel}>{routeMetrics.carTime}</Text>
//           </View>
//           <View style={styles.infoBox}>
//             <FontAwesome5 name="bus" size={16} color="#44457D" />
//             <Text style={styles.infoBoxLabel}>{routeMetrics.busTime}</Text>
//           </View>
//         </View>
//       )}

//       {/* Route Overview */}
//       {route.length >= 2 ? (
//         <View style={styles.routecontainer}>
//           <Text style={{ fontSize: 13, fontWeight: '500', color: '#6B7280', marginBottom: 18 }}>
//             Route Overview
//           </Text>
//           {renderRouteOverview()}
//           <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
//             <TouchableOpacity style={styles.twobox} onPress={() => setModalVisible(true)}>
//               <Text style={styles.texttwo}>Review</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.twobox} onPress={() => router.push("/postsuggestion")}>
//               <Text style={styles.texttwo}>Route Post Suggestions</Text>
//             </TouchableOpacity>
//           </View>
//           {route.length >= 2 && (
//             <ReviewModal
//               visible={modalVisible}
//               onClose={() => setModalVisible(false)}
//               originCoords={route[0]}
//               destinationCoords={route[1]}
//             />
//           )}
//           {/* Alternative Vehicles */}
//           {alternatives.length > 0 && (
//             <View style={styles.altVehiclesContainer}>
//               <Text style={styles.altVehiclesHeader}>These are the alternative vehicles</Text>
//               {alternatives.map((alt, idx) => {
//                 const altDurationMins = Math.ceil(alt.duration / 60);
//                 const altDistance = alt.distance ? `${alt.distance} m` : null;
//                 return (
//                   <View key={idx} style={styles.altVehicleItem}>
//                     <Text style={styles.altVehicleText}>
//                       {alt.type} - {alt.route_name} {altDistance && <>({altDistance} • {altDurationMins}m)</>}
//                     </Text>
//                   </View>
//                 );
//               })}
//             </View>
//           )}
//         </View>
//       ) : (
//         <View style={styles.oopsContainer}>
//           <Image
//             source={require('../assets/images/opz.png')}
//             style={styles.illustration}
//             resizeMode="contain"
//           />
//           <Text style={styles.errorText}>Oops!</Text>
//           <Text style={styles.errorSubText}>Search for your location and destination.</Text>
//         </View>
//       )}
//     </View>
//   );

//   if (route.length >= 2) {
//     return (
//       <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
//         <Animated.View style={[styles.mapContainer, { height: animatedHeight }]}>
//           <MapComponent
//             initialRegion={region}
//             route={route}
//             roadPath={roadPath}
//             mapResetKey={mapResetKey}
//             style={styles.map}
//             polylineColor={polylineColor}
//           />
//         </Animated.View>
//         <ScrollView style={[styles.detailsContainer, { backgroundColor: '#FFFFFF' }]} contentContainerStyle={styles.contentContainer}>
//           {detailsContent}
//         </ScrollView>
//       </View>
//     );
//   } else {
//     return (
//       <ScrollView style={[styles.maincontainer, { backgroundColor: '#FFFFFF' }]} contentContainerStyle={styles.contentContainer}>
//         <Animated.View style={[styles.mapContainer, { height: animatedHeight }]}>
//           <MapComponent
//             initialRegion={region}
//             route={route}
//             roadPath={roadPath}
//             mapResetKey={mapResetKey}
//             style={styles.map}
//             polylineColor={polylineColor}
//           />
//         </Animated.View>
//         {detailsContent}
//       </ScrollView>
//     );
//   }
// };

// export default RouteScreen;

// // -------------------------
// // Styles
// // -------------------------
// const styles = StyleSheet.create({
//   maincontainer: {
//     width: '100%',
//     backgroundColor: '#FFFFFF',
//   },
//   detailsContainer: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   contentContainer: {
//     paddingBottom: 30,
//   },
//   mapContainer: {
//     borderWidth: 2,
//     borderColor: '#FFFFFF',
//     backgroundColor: '#FFFFFF',
//     width: '100%',
//     marginTop: 15,
//   },
//   map: {
//     height: '100%',
//     width: '100%',
//   },
//   text: {
//     color: '#44457D',
//     fontWeight: '500',
//     fontSize: 16,
//   },
//   container: {
//     padding: 15,
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#6B7280',
//     marginTop: 10,
//   },
//   searchContainer: {
//     position: 'relative',
//     width: '100%',
//     marginBottom: 20,
//   },
//   inputContainer: {
//     width: '100%',
//   },
//   userInput: {
//     backgroundColor: '#F5F7FF',
//     borderWidth: 1,
//     borderColor: '#C7D2FE',
//     borderRadius: 8,
//     padding: 8,
//     fontSize: 11,
//     color: '#374151',
//     marginVertical: 8,
//     paddingRight: 30,
//     height: 40,
//   },
//   clearButton: {
//     position: 'absolute',
//     right: 10,
//     top: '50%',
//     transform: [{ translateY: -10 }],
//   },
//   loadingIndicator: {
//     position: 'absolute',
//     right: 40,
//     top: '50%',
//     transform: [{ translateY: -10 }],
//   },
//   suggestionList: {
//     position: 'absolute',
//     top: 45,
//     left: 0,
//     right: 0,
//     backgroundColor: '#FFFFFF',
//     zIndex: 10,
//     borderRadius: 8,
//     elevation: 4,
//     maxHeight: 150,
//   },
//   suggestionItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: '#ddd',
//   },
//   suggestionText: {
//     color: '#444',
//   },
//   topInfoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//     marginBottom: 18,
//   },
//   infoBox: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F4F6FF',
//     borderRadius: 8,
//     padding: 10,
//     width: 65,
//   },
//   infoBoxLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#44457D',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   routecontainer: {
//     borderWidth: 1,
//     borderColor: '#C7D2FE',
//     borderRadius: 8,
//     padding: 16,
//     width: '100%',
//     marginTop: 18,
//     marginBottom: 100,
//   },
//   overviewText: {
//     fontSize: 12,
//     color: '#44457D',
//     marginVertical: 4,
//   },
//   bulletItem: {
//     fontSize: 12,
//     color: '#44457D',
//     marginBottom: 4,
//     lineHeight: 18,
//     marginLeft: 12,
//   },
//   oopsContainer: {
//     alignItems: 'center',
//     padding: 16,
//     marginBottom: 30,
//   },
//   illustration: {
//     width: 150,
//     height: 120,
//     marginBottom: 10,
//   },
//   errorText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 4,
//   },
//   errorSubText: {
//     fontSize: 14,
//     color: '#9CA3AF',
//     textAlign: 'center',
//     marginHorizontal: 20,
//   },
//   twobox: {
//     borderRadius: 6,
//     backgroundColor: '#E0E7FF',
//     paddingVertical: 5,
//     paddingHorizontal: 12,
//     margin: 4,
//   },
//   texttwo: {
//     fontSize: 12,
//     color: '#6366F1',
//     fontWeight: '500',
//   },
//   // -------------------------
//   // Styles for DynamicSegment
//   // -------------------------
//   dynamicSegmentContainer: {
//     flexDirection: 'row',
//     position: 'relative',
//     marginBottom: 20,
//     paddingLeft: 40,
//   },
//   dynamicTextContainer: {
//     flex: 1,
//   },
//   dynamicGetOnBlock: {
//     marginBottom: 20,
//   },
//   dynamicGetOffBlock: {},
//   dynamicBulletContainer: {
//     position: 'absolute',
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: 30,
//     pointerEvents: 'none',
//   },
//   greenBullet: {
//     position: 'absolute',
//     left: 8,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: 'green',
//   },
//   blueBullet: {
//     position: 'absolute',
//     left: 8,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: 'blue',
//   },
//   verticalLine: {
//     position: 'absolute',
//     left: 13,
//     width: 2,
//     backgroundColor: 'green',
//   },
//   segmentTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   segmentInstruction: {
//     fontSize: 13,
//     color: '#4B5563',
//     lineHeight: 18,
//     marginBottom: 4,
//   },
//   // -------------------------
//   // Styles for Alternative Vehicles
//   // -------------------------
//   altVehiclesContainer: {
//     marginTop: 8,
//     paddingHorizontal: 8,
//     backgroundColor: '#FFF',
//   },
//   altVehiclesHeader: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 6,
//   },
//   altVehicleItem: {
//     backgroundColor: '#F5F5F5',
//     padding: 8,
//     marginBottom: 4,
//     borderRadius: 6,
//   },
//   altVehicleText: {
//     fontSize: 12,
//     color: '#333',
//   },
// });
