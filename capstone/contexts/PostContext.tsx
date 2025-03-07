import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Post {
  id?: number;
    // Add destination
  content: string;
  location: string;
  destination: string;
  origin_lat: number; // Use underscores to match the data
  origin_lon: number; // Use underscores to match the data
  destination_lat: number;   // Use underscores to match the data
  destination_lon: number;   // Use underscores to match the data        // Add destination longitude
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