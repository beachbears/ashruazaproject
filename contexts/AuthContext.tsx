import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';



export interface AuthContextType {
  isLoggedIn: boolean;
  authToken: string;
  userName: string;
  userHandle: string;
  userInitials: string;
  login: (name: string, token: string) => void; // ✅ Accepts both name and token
  logout: () => void;
}


// ✅ Provide default values for the context to avoid 'null' issues
const defaultAuthContext: AuthContextType = {
  isLoggedIn: false,
  authToken: "",
  userName: "",
  userHandle: "",
  userInitials: "",
  login: () => { },
  logout: () => { },
};

// ✅ Use a default value instead of `null`
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [userName, setUserName] = useState("");
  const [userHandle, setUserHandle] = useState("");
  const [userInitials, setUserInitials] = useState("");


  const login = async (name: string, token: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    setAuthToken(token);

    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("userName", name); // ✅ Store userName
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserName("");
    setAuthToken("");
    setUserHandle("");
    setUserInitials("");

    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userName"); // ✅ Remove userName as well
  };


  useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = await AsyncStorage.getItem("authToken");
      const storedName = await AsyncStorage.getItem("userName");

      if (storedToken && storedName) { // Ensure both are available
        setAuthToken(storedToken);
        setUserName(storedName);
        setIsLoggedIn(true);
      }
    };

    loadAuthData();
  }, []);


  return (
    <AuthContext.Provider value={{ isLoggedIn, authToken, userName, userHandle, userInitials, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};