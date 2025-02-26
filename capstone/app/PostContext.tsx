import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PostCategory = 'community' | 'postsuggestions';
export type VehicleType = "Jeep" | "E-jeep" | "Bus" | "UV Exp." | "Train";

export interface Post {
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
  category: PostCategory; // Ensure category is required
}

interface PostContextType {
  posts: Post[];
  addPost: (newPost: Omit<Post, 'category'>, source: PostCategory) => void;
  handleUpvote: (postId: number) => void;
  handleDownvote: (postId: number) => void;
  getPostsByCategory: (category: PostCategory) => Post[];
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  // Add post with explicit category
  const addPost = (newPost: Omit<Post, 'category'>, source: PostCategory) => {
    const postWithCategory: Post = {
      ...newPost,
      category: source,
      id: Date.now(), // Ensure unique ID
      timestamp: Date.now()
    };
    setPosts(prev => [postWithCategory, ...prev]);
  };

  // Voting handlers
  const handleUpvote = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
    ));
  };

  const handleDownvote = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, downvotes: post.downvotes + 1 } : post
    ));
  };

  // Filter posts by category
  const getPostsByCategory = (category: PostCategory) => {
    return posts.filter(post => post.category === category);
  };

  return (
    <PostContext.Provider value={{ 
      posts, 
      addPost, 
      handleUpvote, 
      handleDownvote,
      getPostsByCategory 
    }}>
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