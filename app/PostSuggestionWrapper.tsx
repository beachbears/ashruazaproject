// PostSuggestionsWrapper.tsx
import React from 'react';
import { PostProvider } from '../context/PostContext';
import PostSuggestions from './postsuggestions';

export default function PostSuggestionsWrapper() {
  return (
    <PostProvider>
      <PostSuggestions />
    </PostProvider>
  );
}