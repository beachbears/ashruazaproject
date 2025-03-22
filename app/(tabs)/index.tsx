import React, { useState, useEffect, useRef } from 'react';
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
import * as Location from 'expo-location';

LogBox.ignoreLogs([
  'textShadow*',
  'shadow*',
]);

const { width } = Dimensions.get('window');

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

type CurrentLocation = {
  latitude: number;
  longitude: number;
  address: string;
};

const Home = () => {
  const router = useRouter();
  const [location, setLocation] = useState(''); // search input value
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchY, setSearchY] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);

  const touristAttractions: Attraction[] = [
    // ... (iyong listahan ng attractions)
  ];

  const filteredAttractions = touristAttractions;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("Location permission not granted");
        return;
      }
      const locationObj = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationObj.coords;
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = geocode && geocode.length > 0 
        ? `${geocode[0].name ? geocode[0].name + ', ' : ''}${geocode[0].street ? geocode[0].street + ', ' : ''}${geocode[0].city}, ${geocode[0].region}`
        : 'Unknown Location';
      setCurrentLocation({ latitude, longitude, address });
    })();
  }, []);

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

  const handleAttractionPress = (attraction: Attraction) => {
    console.log("Navigating to route with attraction", attraction);
    router.push({
      pathname: '/(tabs)/route',
      params: { 
        attraction: encodeURIComponent(JSON.stringify(attraction)),
        from: currentLocation ? encodeURIComponent(JSON.stringify(currentLocation)) : ''
      }
    });
  };

  const geocodeAddress = async (address: string) => {
    try {
      const { data } = await axios.get(
        'https://comgu20-production.up.railway.app/api/locations/search',
        { params: { term: address } }
      );
      if (data && data.length) {
        return data.map((item: any) => ({
          name: item.label,
          lat: parseFloat(item.latitude),
          lon: parseFloat(item.longitude),
        }));
      }
      return [];
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
    console.log("Selected suggestion:", suggestion);
  };

  // Kapag pinindot ang "Let's go" button, mag-navigate tayo papunta sa route.tsx
  const handleLocationSearch = () => {
    if (location.trim() !== '') {
      console.log("Navigating to route with destination:", location);
      router.push({
        pathname: '/(tabs)/route', // O '/route' kung iyon ang tamang path
        params: { 
          destination: location, 
          from: currentLocation ? encodeURIComponent(JSON.stringify(currentLocation)) : '',
          timestamp: new Date().getTime()
        }
      });
      // Optional: i-clear ang input pagkatapos mag-navigate
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
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && { paddingBottom: 300 }
          ]}
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

              <View
                onLayout={(e) => setSearchY(e.nativeEvent.layout.y)}
                style={styles.searchContainer}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Whachu lookin' for?"
                  placeholderTextColor="#000000"
                  value={location}
                  onChangeText={handleSearchInput}
                  onFocus={() =>
                    scrollViewRef.current?.scrollTo({ y: searchY - 20, animated: true })
                  }
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
                <ScrollView style={styles.suggestionList} keyboardShouldPersistTaps="handled">
                  {destinationSuggestions.map((item, index) => (
                    <TouchableWithoutFeedback key={index} onPress={() => handleSuggestionSelect(item)}>
                      <View style={styles.suggestionItem}>
                        <Text style={styles.suggestionText}>{item.name}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  ))}
                </ScrollView>
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
    maxHeight: 150,
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
