declare module 'react-native-web-maps' {
    import * as React from 'react';
  
    export interface MapViewProps {
      style?: React.CSSProperties;
      initialRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      };
      // Add other props if needed
    }
  
    export default class MapView extends React.Component<MapViewProps> {}
  }