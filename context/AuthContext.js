  import React, { createContext, useState, useEffect } from 'react';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  
  export const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userInitials, setUserInitials] = useState('');
    const [userId, setUserId] = useState('');

    // Load user data from AsyncStorage when the app starts.
    useEffect(() => {
      const loadUserData = async () => {
        try {
          const storedIsLoggedIn = await AsyncStorage.getItem('isLoggedIn');
          const storedUserName = await AsyncStorage.getItem('userName');
          const storedUserEmail = await AsyncStorage.getItem('userEmail');
          const storedUserInitials = await AsyncStorage.getItem('userInitials');
          const storedUserId = await AsyncStorage.getItem('userId');
          if (storedIsLoggedIn === 'true') {
            setIsLoggedIn(true);
            setUserName(storedUserName || '');
            setUserEmail(storedUserEmail || '');
            setUserInitials(storedUserInitials || '');
            setUserId(storedUserId || '');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };
      loadUserData();
    }, []);

    const login = async (email, id = email) => {
      setIsLoggedIn(true);
      setUserEmail(email);
      const handle = email.split('@')[0];
      setUserName(handle);
      setUserId(id);
      const initials = handle.slice(0, 2).toUpperCase();
      setUserInitials(initials);
      try {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userName', handle);
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userInitials', initials);
        await AsyncStorage.setItem('userId', id);
        // Dito rin karaniwang sine-save ang token (gamit ang ibang mekanismo)
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    };

    const logout = async () => {
      setIsLoggedIn(false);
      setUserName('');
      setUserEmail('');
      setUserInitials('');
      setUserId('');
      try {
        // Tinatanggal din natin ang token upang hindi magamit sa mga susunod na request.
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('isLoggedIn');
        await AsyncStorage.removeItem('userName');
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userInitials');
        await AsyncStorage.removeItem('userId');
      } catch (error) {
        console.error('Error removing user data:', error);
      }
    };

    return (
      <AuthContext.Provider
        value={{
          isLoggedIn,
          userName,
          userEmail,
          userInitials,
          userId,
          login,
          logout,
          created_at,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };