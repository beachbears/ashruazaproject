// src/types.ts

import WebView from "react-native-webview";

export interface LocationSuggestion {
  label: string;
  latitude: string;
  longitude: string;
}

export interface Region {
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
  route_name: string;
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
  trivia?: string;
  image_url?: string;
  link?: string;
  feedbacks?: string | string[];
  distance?: number;
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

export interface MapComponentProps {
  initialRegion: Region;
  route?: LatLng[];
  roadPath?: LatLng[] | string | LatLng[][] | SegmentPath[];
  style?: any;
  mapResetKey?: number;
  polylineColor: string;
  nearbySpots?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    image_url?: string;
  }>;
  selectedSpot?: LatLng | null;
  isLoading?: boolean;
  webviewRef?: React.RefObject<WebView>;
  onSpotClick?: (spotName: string) => void;
  nearbyRestaurants?: Array<{
    amenity: string;
    latitude: number;
    longitude: number;
    name: string;
    cuisine?: string;
    image_url?: string;
  }>;
  onRestaurantClick?: (restaurantName: string) => void;
}

export interface RouteDetails {
  posts: Post[]; // Add this required property
  route: Route | null;
}

export interface RouteMetrics {
  duration: number;
  distance: number;
  fare: number;
  walkingTime: string;
  carTime: string;
  busTime: string;
}
