import { Tabs } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { APP_NAME } from '@/constants';
import { PostProvider } from '../PostContext'; // Import PostProvider

export default function TabLayout() {
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
                <Text style={{ fontSize: 16, fontWeight: 800, color: '#424368', left: -90 }}>
                  {APP_NAME}
                </Text>
              </View>
              <View style={styles.account}>
                <Text style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>A</Text>
              </View>
            </View>
          ),
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: { fontSize: 11, fontWeight: 500, color: '#44457D', marginTop: 6 },
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
            tabBarItemStyle: [styles.tabBarItem],
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
            tabBarItemStyle: [styles.tabBarItem],
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
    height: 60,
    backgroundColor: '#F9FAFB',
    gap: 100,
  },
  logo: {
    width: 30,
    height: 30,
  },
  account: {
    width: 30,
    height: 30,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'hidden',
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
  hidden: {
    display: 'none', // Hides the right-side item
  },
});