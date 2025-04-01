// AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthContextType {
  isLoggedIn: boolean;
  authToken: string;
  userName: string;
  userHandle: string;
  userInitials: string;
  userId: number | null; // Add userId
  login: (name: string, token: string, id: number) => void; // Update login to accept id
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  isLoggedIn: false,
  authToken: "",
  userName: "",
  userHandle: "",
  userInitials: "",
  userId: null,
  login: () => { },
  logout: () => { },
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [userName, setUserName] = useState("");
  const [userHandle, setUserHandle] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [userId, setUserId] = useState<number | null>(null); // Add userId state

  const login = async (name: string, token: string, id: number) => {
    setIsLoggedIn(true);
    setUserName(name);
    setAuthToken(token);
    setUserId(id);

    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("userName", name);
    await AsyncStorage.setItem("userId", id.toString());
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserName("");
    setAuthToken("");
    setUserHandle("");
    setUserInitials("");
    setUserId(null);

    await AsyncStorage.multiRemove(["authToken", "userName", "userId"]);
  };

  useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = await AsyncStorage.getItem("authToken");
      const storedName = await AsyncStorage.getItem("userName");
      const storedId = await AsyncStorage.getItem("userId");

      if (storedToken && storedName && storedId) {
        setAuthToken(storedToken);
        setUserName(storedName);
        setUserId(parseInt(storedId, 10));
        setIsLoggedIn(true);
      }
    };

    loadAuthData();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, authToken, userName, userHandle, userInitials, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};