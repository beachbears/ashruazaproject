import React, { createContext, useContext, useState, ReactNode } from 'react';

type VehicleType = "Jeep" | "E-jeep" | "Bus" | "UV Exp." | "Train";

interface Post {
  id: number;
  upvotes: number;
  downvotes: number;
  userinitial: string;
  loginusername: string;
  username: string;
  location: string;
  fare: number;
  destination: string;
  description: string;
  suggestiontextbox: string;
  timestamp: number;
  vehicles: VehicleType[];
  category?: 'community' | 'postsuggestions'; // Add category field
}

interface PostContextType {
  posts: Post[];
  addPost: (newPost: Post, source: 'community' | 'postsuggestions') => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const addPost = (newPost: Post, source: 'community' | 'postsuggestions') => {
    const postWithSource = { ...newPost, category: source }; // Add category field
    setPosts((prevPosts) => [postWithSource, ...prevPosts]); // Correctly update state
  };

  return (
    <PostContext.Provider value={{ posts, addPost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
};
