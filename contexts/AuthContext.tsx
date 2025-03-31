import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64'; // Add this package

export interface AuthContextType {
  isLoggedIn: boolean;
  authToken: string;
  userName: string;
  userHandle: string;
  userInitials: string;
  userId: number; // NEW: Added user ID
  login: (name: string, token: string) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  isLoggedIn: false,
  authToken: "",
  userName: "",
  userHandle: "",
  userInitials: "",
  userId: 0, // NEW: Default user ID
  login: () => {},
  logout: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState(defaultAuthContext);

  // NEW: Token decoding logic
  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];
      const decoded = base64.decode(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return {};
    }
  };

  const login = async (name: string, token: string) => {
    const decoded = decodeToken(token);
    const userId = decoded?.user_id || decoded?.id || 0; // Get user ID from token
    
    await AsyncStorage.multiSet([
      ['authToken', token],
      ['userName', name],
      ['userId', userId.toString()] // NEW: Store user ID
    ]);

    setState(prev => ({
      ...prev,
      isLoggedIn: true,
      authToken: token,
      userName: name,
      userId: userId,
      userInitials: name.match(/(\b\S)?/g)?.join("").slice(0, 2) || "",
    }));
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['authToken', 'userName', 'userId']); // NEW: Remove user ID
    
    setState(defaultAuthContext);
  };

  useEffect(() => {
    const loadAuthData = async () => {
      const [token, name, userId] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('userId') // NEW: Get user ID
      ]);

      if (token && name) {
        setState(prev => ({
          ...prev,
          isLoggedIn: true,
          authToken: token,
          userName: name,
          userId: parseInt(userId || '0', 10), // NEW: Set user ID
          userInitials: name.match(/(\b\S)?/g)?.join("").slice(0, 2) || "",
        }));
      }
    };

    loadAuthData();
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);