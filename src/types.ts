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
  type: string; // Added to specify 'walking', 'bus', 'car', etc.
  steps: Array<{
    instruction: string;
    // Add other step properties as needed
  }>;
}

export interface Point {
  x: number;
  y: number;
}

export interface MapComponentProps {
  initialRegion: Region;
  route?: LatLng[];
  roadPath?: LatLng[] | string | LatLng[][] | SegmentPath[];
  style?: any;
  mapResetKey: number;
  polylineColor: string;
  webviewRef: React.RefObject<WebView>;
  nearbySpots?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    image_url?: string;
  }>;
  selectedSpot?: LatLng | null;
  isLoading?: boolean;
  nearbyRestaurants?: Restaurant[]; // Changed to use Restaurant interface
  onRestaurantClick: (id: number) => void;
  onSpotClick: (spotName: string) => void;
  activeTab: string;
  selectedRestaurant?: { latitude: number; longitude: number; name: string };
}

export interface Restaurant {
  id: number;
  osm_id: number;
  name: string;
  alt_name?: string;
  amenity: string;
  address: {
    housenumber?: string;
    housename?: string;
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    postcode?: string;
    full_address?: string;
  };
  brand?: {
    brand?: string;
    brand_wikidata?: string;
  };
  metadata?: {
    cuisine?: string;
    drive_through?: boolean;
    takeaway?: boolean | string;
    smoking?: string;
    opening_hours?: string;
    payment?: string;
    delivery?: string;
    street_vendor?: string;
    operator?: string;
    website_orders?: string;
    website_booking?: string;
    diet?: string;
    internet_access?: string;
    wheelchair?: string;
  };
  contacts?: {
    phone?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    pinterest?: string;
    email?: string;
  };
  building?: string;
  landuse?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  latitude: number;
  longitude: number;
  reverse_geocoded_address?: string;
  created_at: string;
  updated_at: string;
  distance: number; // in kilometers
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
