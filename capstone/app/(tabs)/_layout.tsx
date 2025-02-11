import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { StyleSheet, View, Image, Text, TouchableOpacity} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { APP_NAME } from '@/constants';
import { flatMap, wrap } from 'lodash';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false, 
        headerStyle: styles.headerStyle, 
        header: () => (
        <View style={styles.header}>
          <View style={styles.headerContainer}>
            
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
            />
         
          <Text style={{fontSize: 16, fontWeight: 800, color: '#424368', left: -90}}>{APP_NAME}</Text>
          </View>
          <View style={styles.account}>
              <Text style={{fontSize: 12, fontWeight: 800, color: '#FFFFFF',}}>A</Text>
            </View>
        </View>
        ),
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
            <Feather name="home" size={20} color={focused ? '#fff' : '#6366F1'} />
            </View>
          ),
          tabBarItemStyle: [styles.tabBarItem],
        }}
      />
      <Tabs.Screen
        name="routedropdown"
        options={{
          title: ' ',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
            <FontAwesome5 name="route" size={16} color={focused ? '#fff' : '#6366F1'} />
            </View>
            
          ),
          tabBarItemStyle: styles.tabBarItem,
        }}
      />

        <Tabs.Screen
            name="about"
            options={{
            title: 'About',
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
         tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
            <Entypo name="message" size={20} color={focused ? '#fff' : '#6366F1'} />
            </View>
          ),
        tabBarItemStyle: [styles.tabBarItem ],
     
      }}
    />

    </Tabs>
      

  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#F9FAFB',
    position: 'absolute'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#F9FAFB',
    gap: 100
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  account: {
    width: 30, height: 30, borderRadius: 24, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center'
  },
  circle: {
    width: 40, height: 40, borderRadius: 24, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center'
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderColor: '#C7D2FE',
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    height: 60,  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginHorizontal: 90,
    marginVertical: 0,
    justifyContent: 'center',   
  },
  tabBarItem: {
    borderRadius: 15,
    backgroundColor: 'transparent',
    padding: 5,  
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 25,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -10, 
  },
  iconContainerFocused: {
    backgroundColor: '#6366F1',
  },
});

