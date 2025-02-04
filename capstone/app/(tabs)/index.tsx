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
} from 'react-native';
import { APP_NAME} from "../../constants";




const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const touristAttractions = [
    { id: 1, name: "Intramuros", city: "Manila", image: require('../../assets/images/intramuros.jpg') },
    { id: 2, name: "Rizal Park", city: "Manila", image: require('../../assets/images/intramuros.jpg') },
    { id: 3, name: "National Museum of Fine Arts", city: "Manila", image: require('../../assets/images/intramuros.jpg') },
    { id: 4, name: "SM Mall of Asia", city: "Pasay", image: require('../../assets/images/intramuros.jpg') },
    { id: 5, name: "Bonifacio High Street", city: "Taguig", image: require('../../assets/images/intramuros.jpg')},
    { id: 6, name: "Quezon Memorial Circle", city: "Quezon City", image: require('../../assets/images/intramuros.jpg')},
    { id: 7, name: "Eastwood City", city: "Quezon City", image: require('../../assets/images/intramuros.jpg')},
    { id: 8, name: "Star City", city: "Pasay", image: require('../../assets/images/intramuros.jpg')},
  ];

  const filteredAttractions = touristAttractions.filter(attraction =>
    attraction.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && styles.scrollViewWithKeyboard,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroContainer}>
            <View style={styles.headerContent}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Official application</Text>
              </View>
              <Text style={styles.title}>
                Simply Travel with <Text style={styles.highlight}>{APP_NAME}</Text>
              </Text>
                <Text style={styles.description}>
                  Conquer the Metro with ease! <Text style={styles.boldText}>{APP_NAME}</Text> your companion for hassle-free commuting, offering clear routes, and navigation to make every journey stress-free.
                </Text>

              <Image source={require('../../assets/images/intramuros.jpg')} style={styles.conquerImage} />

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Whachu lookin' for?"
                  placeholderTextColor="#000000"
                />
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Let's go</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.attractionsContainer}>
            <Text style={styles.attractionsTitle}>Cities Tourist Attractions</Text>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchBar}
                placeholder="Search Attractions"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Scrollable container for tourist attractions */}
            <View style={[styles.scrollableBox, { flex: 1 }]}>
              <ScrollView
                nestedScrollEnabled={true}
                style={styles.imageScrollBox}
                contentContainerStyle={[styles.imageScrollContainer, { flexGrow: 1 }]} // Added flexGrow: 1 here
              >
                {filteredAttractions.map((attraction) => (
                  <TouchableOpacity key={attraction.id} style={styles.attractionItem}>
                    <ImageBackground
                      source={attraction.image}
                      style={styles.attractionImage}
                    >
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
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  scrollViewWithKeyboard: {
    paddingBottom: 100, // Adjust bottom padding when keyboard is visible
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
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 16,
  },
  highlight: {
    color: '#4F46E5',
  },
  description: {
    fontSize: 16,
    maxWidth: 500,
    textAlign: 'left',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: 'bold',  // Bold text style
  },
  conquerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginTop: 16,
  },
  searchContainer: {
    width: '100%',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#4F46E5',
    borderWidth: 1,
    borderRadius: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  attractionsContainer: {
    width: '100%',
    marginTop: 32,
  },
  attractionsTitle: {
    textAlign: 'left',
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 18,
  },
  searchBarContainer: {
    marginTop: 16,
    marginBottom: 16,
    width: '100%',
  },
  searchBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderColor: '#4F46E5',
    borderWidth: 1,
    width: '70%',
  },
  scrollableBox: {
    marginTop: 16, // Some margin for spacing
    flexDirection: 'column',  // Ensure the images stack vertically
  },
  imageScrollBox: {
    height: 250,  // Fixed height for the box to enable scrolling
  },
  imageScrollContainer: {
    paddingBottom: 16, // Optional padding at the bottom for spacing
  },
  attractionItem: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  attractionImage: {
    width: '100%',
    height: '100%',// Fix the height to make sure the image doesn't overflow
    borderRadius: 16,
    resizeMode: 'cover',
  },
  attractionText: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    color: 'white',
  },
  attractionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  attractionCity: {
    fontSize: 14,
    color: 'white',
  },
});

export default Home;