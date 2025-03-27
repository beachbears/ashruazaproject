import React, { useEffect, useState, useContext, useCallback } from 'react';
import { LogBox, StyleSheet, View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons, Feather } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';
import { APP_NAME } from '@/constants';
import { AuthContext } from '../../contexts/AuthContext';

LogBox.ignoreLogs(['Warning: shadow', 'VirtualizedLists']);

export default function TabLayout() {
  const { isLoggedIn, userName, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const router = useRouter();

  const userInitial = userName ? userName.charAt(0).toUpperCase() : '';
  // // Function to check location permissions
  // const checkLocationPermission = useCallback(async () => {
  //   const { status } = await Location.requestForegroundPermissionsAsync();
  //   const servicesEnabled = await Location.hasServicesEnabledAsync();
  //   setLocationEnabled(status === 'granted' && servicesEnabled);
  // }, []);

  // // Run permission check once when the app starts
  // useEffect(() => {
  //   checkLocationPermission();
  // }, [checkLocationPermission]);

  // // Show loading screen while checking permissions
  // if (locationEnabled === null) {
  //   return (
  //     <View style={styles.centered}>
  //       <Text style={styles.text}>Checking location permissions...</Text>
  //     </View>
  //   );
  // }

  // // Show permission prompt if location is not enabled
  // if (!locationEnabled) {
  //   return (
  //     <View style={styles.centered}>
  //       <Text style={styles.errorText}>
  //         This app requires location permissions to function.
  //       </Text>
  //       <Text style={styles.text}>
  //         Please enable location services in your device settings to continue.
  //       </Text>
  //       <TouchableOpacity
  //         style={styles.button}
  //         onPress={() => {
  //           Linking.openSettings().catch(() => {
  //             alert('Unable to open settings. Please enable location manually.');
  //           });
  //         }}
  //       >
  //         <Text style={styles.buttonText}>Go to Settings</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }
  // Render tabs directly unless location check is explicitly needed
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        headerStyle: styles.headerStyle,
        header: () => (
          <View style={styles.header}>
            <View style={styles.headerContainer}>
              <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
              <Text style={styles.headerTitle}>{APP_NAME}</Text>
            </View>
            <View style={styles.authContainer}>
              {isLoggedIn ? (
                <View style={styles.dropdownContainer}>
                  <View
                    style={{
                      width: 41,
                      height: 41,
                      backgroundColor: '#EEF2FF',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 15,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setShowDropdown(!showDropdown)}
                      style={styles.account}
                    >
                      <Text style={styles.accountText}>{userInitial}</Text>
                    </TouchableOpacity>
                  </View>
                  {showDropdown && (
                    <View style={styles.dropdown}>
                      <TouchableOpacity onPress={logout} style={styles.dropdown}>
                        <Ionicons
                          name="log-out-outline"
                          size={18}
                          color="#fff"
                          style={styles.dropdownIcon}
                        />
                        <Text style={styles.dropdownText}>Logout</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.authButtonsContainer}>
                  <TouchableOpacity onPress={() => router.push('/login')} style={styles.authButton}>
                    <Text style={styles.authButtonText}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/signup')} style={styles.authButton}>
                    <Text style={styles.authButtonText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ),
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          color: '#44457D',
          marginTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Feather name="home" size={20} color={focused ? '#fff' : '#6366F1'} />
            </View>
          ),
          tabBarItemStyle: styles.tabBarItem,
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          title: 'Route',
          tabBarLabel: 'Route',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <FontAwesome5 name="route" size={16} color={focused ? '#fff' : '#6366F1'} />
            </View>
          ),
          tabBarItemStyle: styles.tabBarItem,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarLabel: 'Community',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <FontAwesome6 name="people-group" size={16} color={focused ? '#fff' : '#6366F1'} />
            </View>
          ),
          tabBarItemStyle: styles.tabBarItem,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarLabel: 'About',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Feather name="book-open" size={20} color={focused ? '#fff' : '#6366F1'} />
            </View>
          ),
          tabBarItemStyle: styles.tabBarItem,
        }}
      />
      <Tabs.Screen
        name="loginfeedback"
        options={{
          title: 'Feedback',
          tabBarLabel: 'Feedback',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Entypo name="message" size={20} color={focused ? '#fff' : '#6366F1'} />
            </View>
          ),
          tabBarItemStyle: styles.tabBarItem,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  headerStyle: {
    backgroundColor: '#F9FAFB',
    position: 'absolute',

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    elevation: 1
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#F9FAFB',
    gap: 100,
  },
  logo: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#424368',
    left: -90,
  },
  authContainer: {
    position: 'relative',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    right: 20
  },
  authButton: {
    marginHorizontal: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#6366F1',
    borderRadius: 5,
  },
  authButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownContainer: {
    position: 'relative',

  },
  account: {
    width: 31,
    height: 31,
    borderRadius: 15,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dropdown: {
    position: 'absolute',
    top: 20,
    right: 1,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 3,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  dropdownIcon: {
    marginRight: 4,
  },
  dropdownText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    position: 'absolute',
    bottom: 10,
    left: '5%',
    right: '5%',
    height: 70,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#C7D2FE',
    borderWidth: 2,
    marginHorizontal: 10,
    paddingHorizontal: 4,
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerFocused: {
    backgroundColor: '#6366F1',
  },
});