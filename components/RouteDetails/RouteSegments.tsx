import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RouteSegmentsProps = {
  segments: RouteSegment[];
  expandedSegments: { [key: number]: boolean };
  toggleSegment: (index: number) => void;
};

const RouteSegments = ({ segments, expandedSegments, toggleSegment }: RouteSegmentsProps) => (
  <View>
    {segments.map((segment, index) => (
      <View key={index} style={styles.segmentCard}>
        <TouchableOpacity
          style={styles.segmentHeaderRow}
          onPress={() => toggleSegment(index)}
        >
          <Ionicons
            name={expandedSegments[index] ? "chevron-down" : "chevron-forward"}
            size={18}
            color="#6366F1"
          />
          <Text style={styles.segmentCardHeaderText}>
            {getSegmentLabel(segment)}
          </Text>
        </TouchableOpacity>
        {expandedSegments[index] && (
          <SegmentDetails segment={segment} />
        )}
      </View>
    ))}
  </View>
);

const SegmentDetails = ({ segment }) => (
  // Render segment-specific details
);

export default RouteSegments;