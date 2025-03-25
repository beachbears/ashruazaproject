// components/DetailsComponent.tsx
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SuggestionList from './SuggestionList';
import type { RouteDetailsProps } from './types';

const DetailsComponent = ({
  origin,
  destination,
  isOriginLoading,
  isDestinationLoading,
  originSuggestions,
  destinationSuggestions,
  handleOriginChange,
  handleDestinationChange,
  clearOrigin,
  selectOriginSuggestion,
  selectDestinationSuggestion,
  clearDestination
}: RouteDetailsProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>Details</Text>
    <Text style={styles.label}>From</Text>
    <View style={styles.searchContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.userInput}
          placeholder="Current location"
          placeholderTextColor="#666"
          value={origin}
          onChangeText={handleOriginChange}
        />
        {isOriginLoading && (
          <ActivityIndicator style={styles.loadingIndicator} size="small" color="#6366F1" />
        )}
        {!!origin && (
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
          placeholder="Enter destination"
          placeholderTextColor="#666"
          value={destination}
          onChangeText={handleDestinationChange}
        />
        {isDestinationLoading && (
          <ActivityIndicator style={styles.loadingIndicator} size="small" color="#6366F1" />
        )}
        {!!destination && (
          <TouchableOpacity style={styles.clearButton} onPress={clearDestination}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <SuggestionList
        suggestions={destinationSuggestions}
        onSelect={selectDestinationSuggestion}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 15, marginBottom: 20 },
  title: { color: "#44457D", fontWeight: "500", fontSize: 16 },
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
});

export default DetailsComponent;
