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
    email: string;
    created_at?: string;
  }
  status?: string;
  email?: string;
  username?: string;        // or you can use loginusername/userinitial if preferred
  votes?: number;
  comments_count?: number;
  created_at?: string;
  category?: PostCategory;
   timestamp?: number;
}


interface PostContextType {
  posts: Post[];
  addPost: (newPost: Omit<Post, 'category'>, source: PostCategory) => void;
   handleUpvote: (postId: number) => void;
   handleDownvote: (postId: number) => void;
   getPostsByCategory: (category: PostCategory) => Post[];
  experienceOnly: boolean;
  setExperienceOnly: (value: boolean) => void;
  updatePost: (updatedPost: Post) => void; // <-- Add this line
}


const PostContext = createContext<PostContextType | undefined>(undefined);


export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [experienceOnly, setExperienceOnly] = useState(false);


  const addPost = (newPost: Post, source: string) => {
    setPosts(prevPosts => {
        // Check if post already exists
        const existingIndex = prevPosts.findIndex(post => post.id === newPost.id);


        if (existingIndex !== -1) {
            // If post exists, update it (e.g., vote count)
            const updatedPosts = [...prevPosts];
            updatedPosts[existingIndex] = newPost; // Replace with updated post
            return updatedPosts;
        }


        // Add new post at the top if it doesn't exist
        return [newPost, ...prevPosts];
    });
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


  
 
  const updatePost = (updatedPost: Post) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === updatedPost.id
          ? { ...post, ...updatedPost } // Correct merging order
          : post
      )
    );
};



  return (
    <PostContext.Provider value={{
      posts,
      addPost,
      updatePost,
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
      updatePost: () => {}, // <-- Add this line
      handleUpvote: () => {},
      handleDownvote: () => {},
      getPostsByCategory: () => [],
      experienceOnly: false,
      setExperienceOnly: () => {},
    };
  }
  return context;
};




