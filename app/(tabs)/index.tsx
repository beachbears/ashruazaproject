import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LogBox } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';

LogBox.ignoreLogs([
  'textShadow*',
  'shadow*',
]);

const { width } = Dimensions.get('window');

// Metro Manila bounding box
const METRO_MANILA_BOUNDS = {
  minLat: 14.40,
  maxLat: 14.85,
  minLon: 120.90,
  maxLon: 121.20,
};

type Attraction = {
  id: number;
  name: string;
  city: string;
  image: any;
  latitude: number;
  longitude: number;
};

type Suggestion = {
  name: string;
  lat: number;
  lon: number;
};

const Home = () => {
  const router = useRouter();
  const [location, setLocation] = useState(''); // search input value
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Updated attractions include coordinates and the new list
  const touristAttractions: Attraction[] = [
    { id: 1, name: "Intramuros", city: "Manila", image: require('../../assets/images/rizalpark.png'), latitude: 14.591, longitude: 120.976 },
    { id: 2, name: "Rizal Park", city: "Manila", image: require('../../assets/images/rizalpark.png'), latitude: 14.582, longitude: 120.975 },
    { id: 3, name: "National Museum of Fine Arts", city: "Manila", image: require('../../assets/images/rizalpark.png'), latitude: 14.580, longitude: 120.978 },
    { id: 4, name: "SM Mall of Asia", city: "Pasay", image: require('../../assets/images/rizalpark.png'), latitude: 14.536, longitude: 120.982 },
    { id: 5, name: "Bonifacio High Street", city: "Taguig", image: require('../../assets/images/rizalpark.png'), latitude: 14.550, longitude: 121.050 },
    { id: 6, name: "Quezon Memorial Circle", city: "Quezon City", image: require('../../assets/images/rizalpark.png'), latitude: 14.649, longitude: 121.043 },
    { id: 7, name: "Eastwood City", city: "Quezon City", image: require('../../assets/images/rizalpark.png'), latitude: 14.578, longitude: 121.057 },
    { id: 8, name: "Star City", city: "Pasay", image: require('../../assets/images/rizalpark.png'), latitude: 14.531, longitude: 120.979 },

    // Caloocan City
    { id: 9, name: "Bonifacio Monument", city: "Caloocan City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 10, name: "San Roque", city: "Caloocan City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },

    // Paranaque City
    { id: 11, name: "Entertainment City", city: "Paranaque City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 12, name: "BF Aguirre/ President’s Avenue Food Strip", city: "Paranaque City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 13, name: "Las Pinas – Paranaque Wetland (formerly LPPCHEA – Las Pinas-Paranaque Critical Habitat and Ecotourism Area)", city: "Paranaque City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 14, name: "Baclaran Church (Redemptorist Church)", city: "Paranaque City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 15, name: "Baclaran Market", city: "Paranaque City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },

    // Muntinlupa City
    { id: 16, name: "New Bilibid Prison (NBP)", city: "Muntinlupa City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 17, name: "Japanese Garden", city: "Muntinlupa City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 18, name: "Jamboree Lake", city: "Muntinlupa City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 19, name: "Filinvest Corporate City", city: "Muntinlupa City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },

    // Las Pinas City
    { id: 20, name: "Las Pinas –Paranaque Wetland (formerly LPPCHEA – Las Pinas-Paranaque Critical Habitat and Ecotourism Area)", city: "Las Pinas City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 21, name: "Saint Joseph Church and the Bamboo Organ", city: "Las Pinas City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 22, name: "Sarao Jeepney Factory", city: "Las Pinas City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 23, name: "Sanctuario de San Ezekiel Moreno", city: "Las Pinas City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 24, name: "Villar Sipag Museum", city: "Las Pinas City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },

    // Pasig City
    { id: 25, name: "Bahay na Tisa (Tech House)", city: "Pasig City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 26, name: "Pasig Museum", city: "Pasig City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 27, name: "Rave Rainforest Adventure Experience", city: "Pasig City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 28, name: "Ortigas Center Complex", city: "Pasig City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 29, name: "Barrio Kapitolyo Food Strip", city: "Pasig City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 30, name: "Pasig River", city: "Pasig City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },

    // Marikina City
    { id: 31, name: "Kapitan Moy", city: "Marikina City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 32, name: "Shoe Museum", city: "Marikina City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 33, name: "Marikina Riverbanks", city: "Marikina City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },

    // Valenzuela City
    { id: 34, name: "National Shrine of the Our Lady of Fatima", city: "Valenzuela City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 35, name: "Museo ng Valenzuela", city: "Valenzuela City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },

    // Quezon City (additional attractions)
    // Note: "Quezon Memorial Circle" already exists above.
    { id: 36, name: "La Mesa Eco Park", city: "Quezon City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 37, name: "Melchora Aquino (Tandang Sora) Shrine", city: "Quezon City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 38, name: "Cry of Pugad Lawin Shrine", city: "Quezon City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 39, name: "Ninoy Aquino Parks and Wildlife", city: "Quezon City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 40, name: "Araneta Center", city: "Quezon City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 41, name: "UP Maginhawa Art and Food Hub", city: "Quezon City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
    { id: 42, name: "Art in Island Museum", city: "Quezon City", image: require('../../assets/images/rizalpark.png'), latitude: 0, longitude: 0 },
  ];

  // For now, show all attractions (filtering can be added later)
  const filteredAttractions = touristAttractions;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Navigate to route screen for an attraction when tapped.
  // Now, the attraction object includes latitude and longitude.
  const handleAttractionPress = (attraction: Attraction) => {
    router.push({ 
      pathname: '/route',
      params: { attraction: JSON.stringify(attraction) }
    });
  };

  // Geocoding function using Nominatim API (restricted to Metro Manila)
  const geocodeAddress = async (address: string) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=5&bounded=1&viewbox=${METRO_MANILA_BOUNDS.minLon},${METRO_MANILA_BOUNDS.maxLat},${METRO_MANILA_BOUNDS.maxLon},${METRO_MANILA_BOUNDS.minLat}`,
        { headers: { 'User-Agent': 'MyTravelApp/1.0 (contact@mytravelapp.com)' } }
      );
      const suggestions = response.data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
      return suggestions;
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  };

  const handleSearchInput = async (text: string) => {
    setLocation(text);
    if (text.trim() === '') {
      setDestinationSuggestions([]);
      return;
    }
    const suggestions = await geocodeAddress(text);
    setDestinationSuggestions(suggestions);
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setLocation(suggestion.name);
    setDestinationSuggestions([]);
  };

  const handleLocationSearch = () => {
    if (location.trim() !== '') {
      router.replace({
        pathname: '/route',
        params: { destination: location, timestamp: new Date().getTime() }
      });
      setLocation('');
      setDestinationSuggestions([]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, keyboardVisible && { paddingBottom: 300 }]}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          style={styles.container}
        >
          <View style={styles.heroContainer}>
            <View style={styles.headerContent}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  <Ionicons name="sparkles-sharp" size={14} /> Official application
                </Text>
              </View>
              <Text style={styles.title}>
                Simply Travel with <Text style={styles.highlight}>kommutsera</Text>
              </Text>
              <Text style={styles.description}>
                Conquer the Metro with ease! <Text style={styles.boldText}>Kommutsera: Gabay ko, Byahe Mo!!!</Text> your companion for hassle-free commuting, offering clear routes and navigation.
              </Text>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Whachu lookin' for?"
                  placeholderTextColor="#000000"
                  value={location}
                  onChangeText={handleSearchInput}
                  textAlignVertical="center"
                  multiline={false}
                />
                {location !== '' && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setLocation('')}
                  >
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.button} onPress={handleLocationSearch}>
                  <Text style={styles.buttonText}>Let's go</Text>
                </TouchableOpacity>
              </View>
              {destinationSuggestions.length > 0 && (
                <View style={styles.suggestionList}>
                  {destinationSuggestions.map((item, index) => (
                    <TouchableWithoutFeedback key={index} onPress={() => handleSuggestionSelect(item)}>
                      <View style={styles.suggestionItem}>
                        <Text style={styles.suggestionText}>{item.name}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  ))}
                </View>
              )}

              <Image source={require('../../assets/images/homelogo.png')} style={styles.conquerImage} />
            </View>
          </View>

          <View style={styles.attractionsContainer}>
            <Text style={styles.attractionsTitle}>Cities Tourist Attractions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollableBox}>
              {filteredAttractions.length === 0 ? (
                <Text style={styles.noResultsText}>No results found</Text>
              ) : (
                filteredAttractions.map((attraction) => (
                  <TouchableOpacity
                    key={attraction.id}
                    style={styles.attractionItem}
                    onPress={() => handleAttractionPress(attraction)}
                  >
                    <ImageBackground source={attraction.image} style={styles.attractionImage}>
                      <View style={styles.attractionText}>
                        <Text style={styles.attractionTitle}>
                          {attraction.name}
                        </Text>
                        <Text style={styles.attractionCity}>
                          {attraction.city}
                        </Text>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fe',
  },
  scrollContent: {
    padding: 16,
  },
  heroContainer: {
    paddingRight: 16,
  },
  headerContent: {
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  badge: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9999,
    marginBottom: 16,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 12,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 16,
  },
  highlight: {
    color: '#4F46E5',
  },
  description: {
    fontSize: width * 0.04,
    maxWidth: 500,
    textAlign: 'left',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  conquerImage: {
    width: '100%',
    height: width * 0.5,
    resizeMode: 'contain',
    marginTop: 16,
  },
  searchContainer: {
    width: '100%',
    alignSelf: 'center',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ebebf1',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 16,
    color: '#333',
    textAlignVertical: 'center',
  },
  clearButton: {
    marginRight: 8,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 10,
    marginRight: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  suggestionList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    elevation: 4,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  suggestionText: {
    color: '#444',
  },
  attractionsContainer: {
    width: '100%',
    marginTop: 32,
  },
  attractionsTitle: {
    textAlign: 'left',
    marginBottom: 16,
    fontWeight: '700',
    fontSize: width * 0.05,
  },
  scrollableBox: {
    marginTop: 20,
    marginBottom: 100,
  },
  attractionItem: {
    width: width * 0.9,
    height: width * 0.6,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 15,
  },
  attractionImage: {
    flex: 1,
    justifyContent: 'flex-end',
    resizeMode: 'cover',
  },
  attractionText: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  attractionTitle: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: '700',
  },
  attractionCity: {
    color: '#fff',
    fontSize: width * 0.04,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#555',
    fontSize: width * 0.04,
  },
});

export default Home;
