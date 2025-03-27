// src/components/SuggestionList.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";

interface SuggestionListProps {
  suggestions: any[];
  onSelect: (item: any) => void;
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
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
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