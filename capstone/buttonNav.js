import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './views/home';
import RoutesScreen from './views/route';
import AboutScreen from './views/about';
import FeedbackScreen from './views/feedback';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, Dimensions, SafeAreaView, Image, TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// Reusable Header Component
const Header = ({ title, onToggleDropdown, showDropdown, isLoggedIn, navigation }) => {
  const profileInitial = isLoggedIn ? 'U' : 'G'; // Replace 'U' with the user's initial if logged in

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image source={require('./assets/Logo.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View>
        <TouchableOpacity onPress={onToggleDropdown} style={styles.profileIconContainer}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>{profileInitial}</Text>
          </View>
        </TouchableOpacity>
        {showDropdown && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>
              You are currently browsing as a{' '}
              <Text style={styles.boldText}>{isLoggedIn ? 'User' : 'Guest'}</Text>
            </Text>
            {isLoggedIn ? (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  console.log('Logout clicked');
                  // Handle logout logic here
                }}
              >
                <Text style={styles.dropdownButtonText}>Logout</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.dropdownButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dropdownButton, styles.signupButton]}
                  onPress={() => navigation.navigate('Signup')}
                >
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const ButtonNav = ({ navigation }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulate login state

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F6FB' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconName;
            if (route.name === 'home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'route') {
              iconName = focused ? 'git-branch' : 'git-branch-outline';
            } else if (route.name === 'about') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'feedback') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            }
            return (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <Icon name={iconName} size={22} color={focused ? '#FFFFFF' : '#6A5AE0'} />
              </View>
            );
          },
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBarStyle,
        })}
      >
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{
            headerShown: true,
            header: () => (
              <Header
                title="Logo Name"
                onToggleDropdown={toggleDropdown}
                showDropdown={showDropdown}
                isLoggedIn={isLoggedIn}
                navigation={navigation}
              />
            ),
          }}
        />
        <Tab.Screen
          name="route"
          component={RoutesScreen}
          options={{
            headerShown: true,
            header: () => (
              <Header
                title="Routes"
                onToggleDropdown={toggleDropdown}
                showDropdown={showDropdown}
                isLoggedIn={isLoggedIn}
                navigation={navigation}
              />
            ),
          }}
        />
        <Tab.Screen
          name="about"
          component={AboutScreen}
          options={{
            headerShown: true,
            header: () => (
              <Header
                title="About"
                onToggleDropdown={toggleDropdown}
                showDropdown={showDropdown}
                isLoggedIn={isLoggedIn}
                navigation={navigation}
              />
            ),
          }}
        />
        <Tab.Screen
          name="feedback"
          component={FeedbackScreen}
          options={{
            headerShown: true,
            header: () => (
              <Header
                title="Feedback"
                onToggleDropdown={toggleDropdown}
                showDropdown={showDropdown}
                isLoggedIn={isLoggedIn}
                navigation={navigation}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    height: 70,
    width: width * 0.6,
    backgroundColor: '#F5F6FB',
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginHorizontal: width * 0.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderTopWidth: 0,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
  },
  focusedIcon: {
    backgroundColor: '#6A5AE0',
    shadowColor: '#6A5AE0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    backgroundColor: '#6A5AE0',
    paddingVertical: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 35,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileIconContainer: {
    padding: 8,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 16,
    zIndex: 10,
    width: 200,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownTitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  boldText: {
    fontWeight: '700',
    color: '#374151',
  },
  dropdownButton: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#4F46E5',
  },
  signupButtonText: {
    color: '#FFFFFF',
  },
});

export default ButtonNav;