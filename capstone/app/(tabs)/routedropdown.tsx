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
<ScrollView style={styles.maincontainer}>
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 30}}>
        <Text style={{ color: '#44457D', fontWeight: '500', fontSize: 16, }}>Details</Text>
        <TouchableOpacity style={styles.postbutton} onPress={() => { }}>
            <Text style={{color: 'white', fontSize: 12 }}>Post</Text>
        </TouchableOpacity>
    </View>

    <View style={styles.container}>
        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.userlocation} placeholder="Novaliches, Bayan Glori" placeholderTextColor="#666" />
        <Text style={[styles.label]}>Destination</Text>
        <TextInput style={styles.userdestination} placeholder="Intramuros, Manila City" placeholderTextColor="#666" />
    </View>

</ScrollView>
  );
}

const styles = StyleSheet.create({
    maincontainer: { flexDirection: 'column', padding: 30, backgroundColor: '#F9FAFB', width: '100%' },
    postbutton: {backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, justifyContent: 'center',alignItems: 'center',},
    container:{padding:8,},
    label:{fontSize: 12, fontWeight: '500', color: '#6B7280', marginTop: 10},
    userlocation: {backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 8, padding: 8, fontSize: 11, color: '#374151', marginVertical: 8,}, 
    userdestination: {backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 8, padding: 8,fontSize: 11, color: '#374151', marginVertical: 8,}, 
  
});