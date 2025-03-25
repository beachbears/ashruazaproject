import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

type RouteMetricsProps = {
  metrics: {
    distance: number;
    fare: number;
    walkingTime: string;
    carTime: string;
    busTime: string;
  };
};

const RouteMetrics = ({ metrics }: RouteMetricsProps) => (
  <View style={styles.topInfoRow}>
    <View style={styles.infoBox}>
      <FontAwesome5 name="map-marker-alt" size={16} color="#44457D" />
      <Text style={styles.infoBoxLabel}>{metrics.distance} km</Text>
    </View>
    {/* Repeat for other metrics */}
  </View>
);

export default RouteMetrics;