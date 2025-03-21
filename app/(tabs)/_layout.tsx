import { LogBox } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { Tabs, useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { Ionicons } from '@expo/vector-icons';
import { APP_NAME } from '@/constants';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePostContext, type Post } from '../../contexts/PostContext';
import { useRouteContext } from '../../contexts/RouteContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: textShadow',
  'Warning: shadow',
  'VirtualizedLists',
]);

type RootStackParamList = {
  Community: { origin: string; destination: string; route: string };
  // other routes...
};
type NavigationProp = StackNavigationProp<RootStackParamList, 'Community'>;

export default function TabLayout() {
  const { isLoggedIn, userName, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { routeDetails } = useRouteContext();

  // Local state for route data.
  // Initially, these are empty or placeholders.
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [route, setRoute] = useState([
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 0 },
  ]);

  // Compute addresses from routeDetails or URL params.
  const origin_address =
    routeDetails?.location ||
    (params.origin_address ? decodeURIComponent(params.origin_address as string) : '');
  const destination_address =
    routeDetails?.destination ||
    (params.destination_address ? decodeURIComponent(params.destination_address as string) : '');

  // Update origin and destination state when computed values change.
  useEffect(() => {
    if (origin_address) {
      setOrigin(origin_address);
    }
    if (destination_address) {
      setDestination(destination_address);
    }
  }, [origin_address, destination_address]);

  // Update route coordinates from URL parameters if available.
  useEffect(() => {
    if (
      params.origin_lat &&
      params.origin_lon &&
      params.destination_lat &&
      params.destination_lon
    ) {
      setRoute([
        { latitude: Number(params.origin_lat), longitude: Number(params.origin_lon) },
        { latitude: Number(params.destination_lat), longitude: Number(params.destination_lon) },
      ]);
    }
  }, [params]);

  const userInitial = userName ? userName.charAt(0).toUpperCase() : '';

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  useEffect(() => {
    if (params.origin_address) {
      setOrigin(decodeURIComponent(params.origin_address as string));
    }
    if (params.destination_address) {
      setDestination(decodeURIComponent(params.destination_address as string));
    }
    if (
      params.origin_lat &&
      params.origin_lon &&
      params.destination_lat &&
      params.destination_lon
    ) {
      setRoute([
        { latitude: Number(params.origin_lat), longitude: Number(params.origin_lon) },
        { latitude: Number(params.destination_lat), longitude: Number(params.destination_lon) },
      ]);
    }
  }, [params]);
  

  // Navigation: using expo-router's router.push.
  const handleNavigate = () => {
    // Ensure route has at least two points and origin/destination are non-empty.
    if (route.length < 2 || origin === '' || destination === '') {
      console.warn("Missing required parameters:", { origin, destination, route });
      return;
    }
    console.log('Navigating with:', { origin, destination, route });
    router.push({
      pathname: '/community',
      params: {
        location: encodeURIComponent(origin || 'DefaultOrigin'),
        destination: encodeURIComponent(destination || 'DefaultDestination'),
        origin_address: encodeURIComponent( origin || 'DefaultOrigin'),
        destination_address: encodeURIComponent( destination || 'DefaultDestination'),
     
        origin_lat: route[0].latitude.toString(),
        origin_lon: route[0].longitude.toString(),
        destination_lat: route[1].latitude.toString(),
        destination_lon: route[1].longitude.toString(),
 
      },
    });
  };

  useEffect(() => {
    console.log('URL Params:', params);
    console.log('Updated origin:', origin);
    console.log('Updated destination:', destination);
    console.log('Updated route:', route);
  }, [params, origin, destination, route]);
  

  console.log('Navigating with:', { origin, destination, route });

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        headerStyle: styles.headerStyle,
        header: () => (
          <View style={styles.header}>
            <View style={styles.headerContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
              />
              <Text style={styles.headerTitle}>{APP_NAME}</Text>
            </View>
            <View style={styles.authContainer}>
              {isLoggedIn ? (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    onPress={() => setShowDropdown(!showDropdown)}
                    style={styles.account}
                  >
                    <Text style={styles.accountText}>{userInitial}</Text>
                  </TouchableOpacity>
                  {showDropdown && (
                    <View style={styles.dropdown}>
                      <TouchableOpacity onPress={handleLogout} style={styles.dropdown}>
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
                  <TouchableOpacity onPress={handleLogin} style={styles.authButton}>
                    <Text style={styles.authButtonText}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSignup} style={styles.authButton}>
                    <Text style={styles.authButtonText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ),
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', color: '#44457D', marginTop: 6 },
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
          tabBarButton: (props) => {
            const {
              delayLongPress,
              disabled,
              onBlur,
              onFocus,
              onPressIn,
              onPressOut,
              onLongPress,
              onPress,
              ...restProps
            } = props;
            return (
              <TouchableOpacity
                {...restProps}
                delayLongPress={delayLongPress ?? undefined}
                disabled={disabled ?? false}
                onBlur={onBlur ?? undefined}
                onFocus={onFocus ?? undefined}
                onPressIn={onPressIn ?? undefined}
                onPressOut={onPressOut ?? undefined}
                onLongPress={onLongPress ?? undefined}
                onPress={handleNavigate}
              />
            );
          },
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
    width: 30,
    height: 30,
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
    width: 30,
    height: 30,
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
