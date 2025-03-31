import { Slot, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '../contexts/AuthContext';
import { PostProvider } from '../contexts/PostContext';
import { RouteProvider } from '../contexts/RouteContext';
import React from 'react';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: textShadow',
  'Warning: shadow',
  'VirtualizedLists',
]);

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        router.replace(token ? '/(tabs)' : '/(tabs)');
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <AuthProvider>
      <PostProvider>
        <RouteProvider>
          <View style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="postsuggestions"
                options={{ title: ' ' }}
              />
              <Stack.Screen
                name="login"
                options={{ headerShown: false, title: 'login' }}
              />
              <Stack.Screen
                name="signup"
                options={{ headerShown: false, title: 'signup' }}
              />
              <Stack.Screen
                name="userProfile"
                options={{ title: 'User Profile' }}
              />
              <Stack.Screen
                name="changePassword"
                options={{ title: 'Change Password' }}
              />
            </Stack>
            {isLoading && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
          </View>
        </RouteProvider>
      </PostProvider>
    </AuthProvider>
  );
}