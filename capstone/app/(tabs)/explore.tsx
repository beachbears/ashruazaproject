import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

export default function TabTwoScreen() {
  const [location, setLocation] = useState('');
  const [destination, setDestination] = useState('');

  const [selectedOption, setSelectedOption] = useState('Select an option');

  const toggleDropdown = () => { setShowDropdown(!showDropdown); };
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>

      
            
      <View style={styles.width}>




        <View style={styles.posting}>
          <Text style={styles.detailsText}>Details</Text>
          <TouchableOpacity style={styles.button} onPress={() => { }}>
            <Text style={styles.buttonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Novaliches, Bayan Glori"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={setDestination}
          placeholder="Intramuros, Manila City"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.text}>Best Way</Text>

        <View style={styles.card}>
          <View style={styles.top}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NN</Text>
            </View>
            <Text style={styles.app}>App Name</Text>
          </View>
          <Text style={styles.destination}>Destination: Intramuros, Manila</Text>
          <Text style={styles.description}>Tourist Spot Description</Text>
          <Text style={styles.comment}>
            Intramuros represents the Philippines' colonial past,
            where the Spanish influence is deeply woven into the country's
            culture, architecture, and traditions. It is a symbol of both
            the glory and the struggles during the Spanish colonization.
            Today, it serves as a popular tourist destination that offers
            a look back in time, showcasing historical landmarks, museums,
            and the enduring spirit of the Filipino people
          </Text>

          <View style={styles.iconStatus}>
            <Octicons name="shield-check" size={18} color="blue" />
            <Text style={styles.status}>Status</Text>
            <View style={styles.badge}>
              <Entypo name="check" size={14} color="#03C04A" />
              <Text style={styles.cert}>Certified AppName</Text>
            </View>
          </View>
        </View>



        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginVertical: 20,
         }}>
          <Text style={{ color: '#4B5563', fontWeight: 'bold', fontSize: 16, flexShrink: 1 }}>
            Route Post Suggestion
          </Text>

          <View style={{
            position: 'absolute',
            right: 0,
            top: 0,
          }}>
            <TouchableOpacity
              onPress={() => setShowDropdown(!showDropdown)}

              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 4,
                backgroundColor: 'white',
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#ccc',
                width: 150,
                
              }}
            >
              <Text>{selectedOption}</Text>
              <Text style={{ marginLeft: 'auto' }}>▼</Text>
            </TouchableOpacity>

            {showDropdown && (
              <View style={{
                
                top: '10%',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#ccc',
                marginTop: 5,
              
              }}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedOption('Time');
                    setShowDropdown(false);
                  }}
                  style={{ padding: 10 }}
                >
                  <Text>Time</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedOption('Fare Cost');
                    setShowDropdown(false);
                  }}
                  style={{ padding: 10 }}
                >
                  <Text>Fare Cost</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedOption('Destination');
                    setShowDropdown(false);
                  }}
                  style={{ padding: 10 }}
                >
                  <Text>Destination</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedOption('Popularity');
                    setShowDropdown(false);
                  }}
                  style={{ padding: 10 }}
                >
                  <Text>Popularity</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>

        </View>

        <View style={styles.usercard}>
          <View style={styles.id}>
            <View style={styles.profile}>
              <Text style={styles.nn}>NN</Text>
            </View>
            <View style={styles.user}>
              <Text style={styles.name}>User</Text>
              <Text style={styles.username}>@username</Text>
            </View>
            <Text style={styles.timedate}>12 Hours ago</Text>
          </View>
          <Text style={styles.userdestination}>Destination: Intramuros, Manila</Text>
          <Text style={styles.touristexp}>Tourist Experience:</Text>
          <Text style={styles.suggestion}>
            Intramuros represents the Philippines' colonial past,
            where the Spanish influence is deeply woven into the country's
            culture, architecture, and traditions. It is a symbol of both
            the glory and the struggles during the Spanish colonization.
            Today, it serves as a popular tourist destination that offers
            a look back in time, showcasing historical landmarks, museums,
            and the enduring spirit of the Filipino people
          </Text>

          <View style={styles.iconStatus}>
            <Octicons name="shield-check" size={18} color="blue" />
            <Text style={styles.status}>Status</Text>
            <View style={styles.badge}>
              <Entypo name="check" size={14} color="#03C04A" />
              <Text style={styles.cert}>Certified AppName</Text>
            </View>

            <View style={styles.arrowup}>
              <AntDesign name="arrowup" size={15} color="#03C04A" />
              <Text style={[styles.num, { color: '#22c55e' }]}>11</Text>
            </View>

            <View style={styles.arrowdown}>
              <AntDesign name="arrowdown" size={15} color="red" />
              <Text style={[styles.num, { color: 'red' }]}>4</Text>
            </View>
          </View>
        </View>

      </View>

      <TouchableOpacity style={styles.floatingButton}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', },

  width: {
    flexDirection: 'column', padding: 16, backgroundColor: '#F9FAFB', width: '90%', maxWidth:
      640, alignSelf: 'center',
    borderRadius: 8,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 50,
    width: '90%', alignSelf: 'center', marginBottom: 20,
  },

  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  profileIconContainer: {
    padding: 8,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondcircle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 5,
    padding: 16,
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

  posting: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
    backgroundColor: '#F9FAFB', width: '100%', maxWidth: 640, alignSelf: 'center', borderRadius: 8,
  },
  detailsText: { color: '#4B5563', fontWeight: 'bold', fontSize: 16, },

  button: {
    backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: 'white', fontSize: 12
  },

  label: {
    marginTop: 8, color: '#6B7280', fontSize: 14,
  },

  input: {
    backgroundColor: '#E0E7FF', borderColor: '#C7D2FE', color: '#374151', borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 12, marginTop: 4, fontSize: 14, width: '100%', marginBottom: 16,
  },

  text: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
  },

  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  app: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  username: {
    fontSize: 12,
    color: '#6B7280',
  },
  destination: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
    marginTop: 6,
  },
  description: {
    fontSize: 12,
    marginVertical: 4,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
  },
  comment: {
    fontSize: 12,
    color: '#6B7280',
    flexWrap: 'wrap',
    marginLeft: 50,
  },
  iconStatus: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  status: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: '#ecfdf5',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  cert: {
    color: '#22c55e',
    fontWeight: '500',
    fontSize: 12, 
  },

  usercard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 2,
    zIndex: -1
  },

  profile: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  nn: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  userdestination: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
    marginTop: 6,
  },
  suggestion: {
    fontSize: 12,
    color: '#6B7280',
    flexWrap: 'wrap',
    marginLeft: 50,
  },

  user: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  name: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  touristexp: {
    marginVertical: 10,
    marginLeft: 50,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  timedate: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 380,
  },
  id: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  arrowup: {
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 260,
  },
  arrowdown: {
    borderWidth: 1,
    borderColor: '#f47357',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  num: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },

  floatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});