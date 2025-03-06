import React, { createContext, useContext, useState, ReactNode } from 'react';

// Update PostCategory type to include 'experience'
export type PostCategory = 'community' | 'postsuggestions' | 'experience';
export type VehicleType = "Jeep" | "E-jeep" | "Bus" | "UV Exp." | "Train";

export interface Post {
  id?: number;
  content: string;
  location: string;        // Add location
  destination: string;     // Add destination
  originLat: number;       // Add origin latitude
  originLon: number;       // Add origin longitude
  destLat: number;         // Add destination latitude
  destLon: number;         // Add destination longitude
  userinitial?: string;
  loginusername?: string;
  username?: string;
}

interface PostContextType {
  posts: Post[];
  addPost: (newPost: Omit<Post, 'category'>, source: PostCategory) => void;
  // handleUpvote: (postId: number) => void;
  // handleDownvote: (postId: number) => void;
  // getPostsByCategory: (category: PostCategory) => Post[];
  experienceOnly: boolean;
  setExperienceOnly: (value: boolean) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [experienceOnly, setExperienceOnly] = useState(false);

 const addPost = (newPost: Post, source: PostCategory) => {
    const postWithCategory = {
      ...newPost,
      category: source,
      isExperienceOnly: false, // Remove if not needed
    };
  
    console.log("Post with Category:", postWithCategory); // Debugging
    setPosts(prev => [postWithCategory, ...prev]);
  };

  

  
  // const handleUpvote = (postId: number) => {
  //   setPosts(prev => prev.map(post => 
  //     post.id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
  //   ));
  // };

  // const handleDownvote = (postId: number) => {
  //   setPosts(prev => prev.map(post => 
  //     post.id === postId ? { ...post, downvotes: post.downvotes + 1 } : post
  //   ));
  // };

  // const getPostsByCategory = (category: PostCategory) => {
  //   return posts.filter(post => post.category === category);
  // };

  return (
    <PostContext.Provider value={{ 
      posts, 
      addPost, 
      // handleUpvote, 
      // handleDownvote,
      // getPostsByCategory,
      experienceOnly,
      setExperienceOnly
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