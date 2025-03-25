// components/SuggestionList.tsx
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

export interface SuggestionItem {
  name: string;
  lat?: number;
  lon?: number;
  // Add any extra fields if needed.
}

export interface SuggestionListProps {
  suggestions: SuggestionItem[];
  onSelect: (item: SuggestionItem) => void;
}

const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions, onSelect }) => {
  if (!suggestions.length) return null;

  return (
    <ScrollView
      style={styles.suggestionList}
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
    >
      {suggestions.map((item, index) => (
        <TouchableOpacity
          key={`${item.name}-${index}`}
          style={styles.suggestionItem}
          onPress={() => onSelect(item)}
        >
          <Text style={styles.suggestionText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  suggestionList: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 10,
    borderRadius: 8,
    elevation: 4,
    maxHeight: 250,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  suggestionText: {
    color: "#444",
  },
});

export default SuggestionList;
