import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../utils/axiosInstance";

// Define user data structure
type User = {
  firstName: string;
  lastName: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Fetch user details from API
  const fetchUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const response = await axiosInstance.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Run fetchUserDetails when the app starts
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Login function
  const login = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    await fetchUserDetails(); // Fetch user details after login
  };

  // Logout function
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
