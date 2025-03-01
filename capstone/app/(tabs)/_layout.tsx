import { LogBox } from 'react-native';
import React, { useState, useContext } from 'react';
import { Tabs, useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { Ionicons } from '@expo/vector-icons';
import { APP_NAME } from '@/constants';
import { AuthContext } from '../../AuthContext'; // adjust path as necessary

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: textShadow',
  'Warning: shadow',
  'VirtualizedLists',
]);

export default function TabLayout() {
  const { isLoggedIn, userName, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

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
    marginTop: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
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
    top: 15,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 0,
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
