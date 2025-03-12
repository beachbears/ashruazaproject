// PostSuggestionsWrapper.tsx
import React from 'react';
import { PostProvider } from '../context/PostContext';
import PostSuggestions from './postsuggestion';

export default function PostSuggestionsWrapper() {
  return (
    <PostProvider>
      <PostSuggestions />
    </PostProvider>
  );
}