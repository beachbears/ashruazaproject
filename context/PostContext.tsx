import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PostCategory = 'routes' | 'postsuggestions' | 'community';

export interface Post {
  id?: number;
  content: string;
  location: string;
  destination: string;
  origin_lat: number;
  origin_lon: number;
  destination_lat: number;
  destination_lon: number;
  // New fields from the API
  user?: {
    id: number;
    username: string
    firstname: string;
    lastname: string;
  }
  username?: string;        // or you can use loginusername/userinitial if preferred
  votes?: number;
  comments_count?: number;
  created_at?: string;
  category?: PostCategory;
   
}

interface PostContextType {
  posts: Post[];
  addPost: (newPost: Omit<Post, 'category'>, source: PostCategory) => void;
   handleUpvote: (postId: number) => void;
   handleDownvote: (postId: number) => void;
   getPostsByCategory: (category: PostCategory) => Post[];
  experienceOnly: boolean;
  setExperienceOnly: (value: boolean) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [experienceOnly, setExperienceOnly] = useState(false);

  

  const addPost = (newPost: Omit<Post, 'category'>, source: PostCategory) => {
    const postWithCategory: Post = {
      ...newPost,
      category: source,
    };

    console.log("New Post Added:", postWithCategory);
    setPosts(prev => [postWithCategory, ...prev]);
  };

  
  const handleUpvote = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, votes: (post.votes || 0) + 1 } : post
    ));
  };

  const handleDownvote = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, votes: (post.votes || 0) - 1 } : post
    ));
  };

  const getPostsByCategory = (category: PostCategory) => {
    return posts.filter(post => post.category === category);
  };

  return (
    <PostContext.Provider value={{ 
      posts, 
      addPost, 
      handleUpvote, 
      handleDownvote,
      getPostsByCategory,
      experienceOnly,
      setExperienceOnly,
    
    }}>
      {children}
    </PostContext.Provider>
  );
};
export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    console.warn('PostContext is missing. Returning default values.');
    return {
      posts: [],
      addPost: () => {},
      experienceOnly: false,
      setExperienceOnly: () => {},
    };
  }
  return context;
};