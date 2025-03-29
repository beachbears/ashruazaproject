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

  // Listahan ng tourist attractions
  const touristAttractions: Attraction[] = [
    { id: 1, name: "Rizal Park", city: "Manila", image: require('../../assets/images/rizalpark.jpg'), latitude: 14.582, longitude: 120.975 },
    { id: 2, name: "National Museum of Fine Arts", city: "Manila", image: require('../../assets/images/nationalmos.jpg'), latitude: 14.580, longitude: 120.978 },
    { id: 3, name: "SM Mall of Asia", city: "Pasay", image: require('../../assets/images/smallasia.jpg'), latitude: 14.536, longitude: 120.982 },
    { id: 4, name: "Bonifacio High Street", city: "Taguig", image: require('../../assets/images/hs.jpg'), latitude: 14.550, longitude: 121.050 },
    { id: 5, name: "Quezon Memorial Circle", city: "Quezon City", image: require('../../assets/images/attractions/circle.jpg'), latitude: 14.651, longitude: 121.046 },
    { id: 6, name: "Eastwood City", city: "Quezon City", image: require('../../assets/images/EW.png'), latitude: 14.578, longitude: 121.057 },
    { id: 7, name: "Sanctuario de San Ezekiel Moreno", city: "Manila", image: require('../../assets/images/attractions/Sanctuario.jpg'), latitude: 14.473, longitude: 120.980 },
    { id: 8, name: "Star City", city: "Pasay", image: require('../../assets/images/STCity.jpg'), latitude: 14.531, longitude: 120.979 },
    { id: 9, name: "Bonifacio Monument", city: "Caloocan City", image: require('../../assets/images/attractions/Bonmon.png'), latitude: 14.657, longitude: 120.982 },
    { id: 10, name: "San Roque", city: "Caloocan City", image: require('../../assets/images/attractions/sanroqcathed.jpg'), latitude: 14.645, longitude: 121.030 },
    { id: 11, name: "Entertainment City", city: "Paranaque City", image: require('../../assets/images/attractions/EntertainmentCity.jpg'), latitude: 14.514, longitude: 121.008 },
    { id: 12, name: "BF Aguirre/ President’s Avenue Food Strip", city: "Paranaque City", image: require('../../assets/images/attractions/bfaguirre.jpg'), latitude: 14.512, longitude: 121.019 },
    { id: 13, name: "Las Pinas – Paranaque Wetland", city: "Paranaque City", image: require('../../assets/images/attractions/Westland.png'), latitude: 14.459, longitude: 120.994 },
    { id: 14, name: "Baclaran Church", city: "Paranaque City", image: require('../../assets/images/attractions/BaclaranChurch.png'), latitude: 14.527, longitude: 121.000 },
    { id: 15, name: "Baclaran Market", city: "Paranaque City", image: require('../../assets/images/attractions/BaclaranMarket.jpg'), latitude: 14.526, longitude: 121.001 },
    { id: 16, name: "New Bilibid Prison", city: "Muntinlupa City", image: require('../../assets/images/attractions/bilibid.jpg'), latitude: 14.414, longitude: 121.044 },
    { id: 17, name: "Japanese Garden", city: "Muntinlupa City", image: require('../../assets/images/attractions/Japanesegarden.jpg'), latitude: 14.417, longitude: 121.039 },
    { id: 18, name: "Jamboree Lake", city: "Muntinlupa City", image: require('../../assets/images/attractions/Jamborelake.jpg'), latitude: 14.406, longitude: 121.037 },
    { id: 19, name: "Filinvest Corporate City", city: "Muntinlupa City", image: require('../../assets/images/attractions/filnevestcorporatecity.jpg'), latitude: 14.424, longitude: 121.047 },
    { id: 21, name: "Saint Joseph Church and the Bamboo Organ", city: "Las Pinas City", image: require('../../assets/images/attractions/Saintjosepchurch.jpg'), latitude: 14.440, longitude: 121.005 },
    { id: 22, name: "Sarao Jeepney Factory", city: "Las Pinas City", image: require('../../assets/images/attractions/jeepfactory.jpg'), latitude: 14.431, longitude: 121.010 },
    { id: 24, name: "Villar Sipag Museum", city: "Las Pinas City", image: require('../../assets/images/attractions/Villarsipag.png'), latitude: 14.435, longitude: 121.003 },
    { id: 25, name: "Bahay na Tisa (Tech House)", city: "Pasig City", image: require('../../assets/images/attractions/bahaytisa.jpg'), latitude: 14.584, longitude: 121.087 },
    { id: 26, name: "Pasig Museum", city: "Pasig City", image: require('../../assets/images/attractions/pasigmuseum.jpg'), latitude: 14.587, longitude: 121.085 },
    { id: 27, name: "Rave Rainforest Adventure Experience", city: "Pasig City", image: require('../../assets/images/attractions/Raverainforest.jpg'), latitude: 14.589, longitude: 121.090 },
    { id: 28, name: "Ortigas Center Complex", city: "Pasig City", image: require('../../assets/images/attractions/ortigascenter.png'), latitude: 14.586, longitude: 121.061 },
    { id: 29, name: "Barrio Kapitolyo Food Strip", city: "Pasig City", image: require('../../assets/images/attractions/barriocapital.jpg'), latitude: 14.591, longitude: 121.073 },
    { id: 30, name: "Pasig River", city: "Pasig City", image: require('../../assets/images/attractions/Pasigriver.jpg'), latitude: 14.589, longitude: 121.070 },
    { id: 31, name: "Kapitan Moy", city: "Marikina City", image: require('../../assets/images/attractions/moy.jpg'), latitude: 14.650, longitude: 121.107 },
    { id: 32, name: "Shoe Museum", city: "Marikina City", image: require('../../assets/images/attractions/shoemuseum.jpg'), latitude: 14.651, longitude: 121.108 },
    { id: 33, name: "Marikina Riverbanks", city: "Marikina City", image: require('../../assets/images/attractions/marikinariverbanks.jpg'), latitude: 14.652, longitude: 121.110 },
    { id: 34, name: "National Shrine of the Our Lady of Fatima", city: "Valenzuela City", image: require('../../assets/images/attractions/nationalOLFU.jpg'), latitude: 14.720, longitude: 121.040 },
    { id: 35, name: "Museo ng Valenzuela", city: "Valenzuela City", image: require('../../assets/images/attractions/museoval.jpg'), latitude: 14.722, longitude: 121.045 },
    { id: 36, name: "La Mesa Eco Park", city: "Quezon City", image: require('../../assets/images/attractions/ecopark.png'), latitude: 14.676, longitude: 121.092 },
    { id: 37, name: "Melchora Aquino (Tandang Sora) Shrine", city: "Quezon City", image: require('../../assets/images/attractions/tandangsorashrine.jpg'), latitude: 14.692, longitude: 121.065 },
    { id: 38, name: "Cry of Pugad Lawin Shrine", city: "Quezon City", image: require('../../assets/images/attractions/cryofpugad.jpg'), latitude: 14.697, longitude: 121.050 },
    { id: 39, name: "Ninoy Aquino Parks and Wildlife", city: "Quezon City", image: require('../../assets/images/attractions/ninoywildlife.jpg'), latitude: 14.678, longitude: 121.050 },
    { id: 40, name: "Araneta Center", city: "Quezon City", image: require('../../assets/images/attractions/aranetacenter.jpg'), latitude: 14.657, longitude: 121.032 },
    { id: 41, name: "UP Maginhawa Art and Food Hub", city: "Quezon City", image: require('../../assets/images/attractions/upmagin.jpg'), latitude: 14.651, longitude: 121.062 },
    { id: 42, name: "Art in Island Museum", city: "Quezon City", image: require('../../assets/images/attractions/artisland.jpg'), latitude: 14.650, longitude: 121.030 },
  ];

  const filteredAttractions = touristAttractions;

  // Humihingi ng location permissions at kinukuha ang current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // console.log("Location permission not granted");
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

  // Kapag pinindot ang isang attraction, ire-route ang user papunta sa route.tsx
  const handleAttractionPress = (attraction: Attraction) => {
    router.push({
      pathname: '/(tabs)/route',
      params: {
        attraction: encodeURIComponent(JSON.stringify(attraction)),
        from: currentLocation ? encodeURIComponent(JSON.stringify(currentLocation)) : ''
      }
    });
  };

  // Geocoding function gamit ang Railway API
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
      // console.error('Geocoding error:', error);
      return [];
    }
  };

  // Kapag nagta-type sa search input
  const handleSearchInput = async (text: string) => {
    setLocation(text);
    if (text.trim() === '') {
      setDestinationSuggestions([]);
      return;
    }
    const suggestions = await geocodeAddress(text);
    setDestinationSuggestions(suggestions);
  };

  // Kapag napili na ang suggestion mula sa dropdown, i-update lang ang input (hindi agad mag-navigate)
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setLocation(suggestion.name);
    setDestinationSuggestions([]);
    // console.log("Selected suggestion:", suggestion);
  };

  // Kapag pinindot ang search button sa search bar ("Let's go")
  const handleLocationSearch = () => {
    if (location.trim() !== '') {
      router.replace({
        pathname: '/(tabs)/route',
        params: {
          destination: location,
          from: currentLocation ? encodeURIComponent(JSON.stringify(currentLocation)) : '',
          timestamp: new Date().getTime()
        }
      });
      setLocation('');
      setDestinationSuggestions([]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      style={{ flex: 1, }}
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
                Simply Travel with <Text style={styles.highlight}>Kommutsera</Text>
              </Text>
              <Text style={styles.description}>
                Conquer the Metro with ease! <Text style={styles.boldText}>Kommutsera: Gabay ko, Byahe mo!!! </Text> your companion for hassle-free commuting, offering clear routes and navigation.
              </Text>

              {/* Capture layout position ng search container */}
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
              {/* Listahan ng suggestions */}
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

              <Image source={require('../../assets/images/image 90.png')} style={styles.conquerImage} />
            </View>
          </View>

          <View style={styles.attractionsContainer}>
            <Text style={styles.attractionsTitle}>Cities Tourist Attractions</Text>
            <View style={{
              padding: 10,
              borderRadius: 18,
              borderColor: '#C7D2FE',
              borderWidth: 2,
              width: '100%',  // Changed from fixed 700
              marginTop: 18,
              marginBottom: 100,
              height: width * 0.7 // Add fixed height
            }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  alignItems: 'center' // Vertically center items
                }}
              >
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
    marginTop: 20
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 16,
  },
  highlight: {
    color: '#6366F1',
  },
  description: {
    fontSize: 16,
    maxWidth: 500,
    textAlign: 'left',
    marginBottom: 16,
    color: '#404163'
  },
  boldText: {
    fontWeight: 'bold',
  },
  conquerImage: {
    width: '100%',
    height: width * 0.5,
    resizeMode: 'contain',
    marginTop: 30,
    marginBottom: 20,
  },
  searchContainer: {
    width: '100%',
    alignSelf: 'center',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ebebf1',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 16,
    color: '#404163',
    textAlignVertical: 'center',
  },
  clearButton: {
    marginRight: 8,
  },
  button: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 14,
    marginRight: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 700
  },
  suggestionList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    elevation: 4,
    maxHeight: 250,
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
    marginTop: 36,
  },
  attractionsTitle: {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: 20,
    color: '#404163',
  },

  attractionItem: {
    width: width * 0.7, // Reduced from 0.9
    height: width * 0.6, // Reduced height for better proportion
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 20, // Increased spacing between items
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android
  },
  attractionImage: {
    flex: 1,
    justifyContent: 'flex-end',
    resizeMode: 'cover',
  },
  attractionText: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  attractionTitle: {
    color: '#fff',
    fontSize: 16, // Fixed size instead of width-based
    fontWeight: '700',
    marginBottom: 4,
  },
  attractionCity: {
    color: '#fff',
    fontSize: 16, // Fixed size instead of width-based
  },
  noResultsText: {
    textAlign: 'center',
    color: '#555',
    fontSize: width * 0.04,
  },
});

export default Home;
