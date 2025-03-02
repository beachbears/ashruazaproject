import React from 'react';
import { PostProvider } from './PostContext'; // Import PostProvider
import CommunityPage from './(tabs)/community';
import PostSuggestionPage from './postsuggestions';

function App() {
  return (
    <PostProvider>
      <CommunityPage />
      <PostSuggestionPage />
     
    </PostProvider>
  );
}

export default App;