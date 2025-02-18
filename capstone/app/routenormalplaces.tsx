import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Link } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';

export default function TabTwoScreen() {

  const navigation = useNavigation();

return (
  <ScrollView style={styles.maincontainer}>
      <View style={styles.userDetails}>
          <View style={styles.circle}>
              <Text style={styles.userinitial}>AR</Text>
          </View>
          <View style={[{ flexDirection: 'column' }]}>
              <Text style={styles.username}>Ashley Ruaza</Text>
              <Text style={styles.email}>@ashruazaa</Text>
          </View>
      </View>

      <View style={styles.container}>
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.userlocation} placeholder="Novaliches, Bayan Glori" placeholderTextColor="#666" />
          <Text style={[styles.label]}>Destination</Text>
          <TextInput style={styles.userdestination} placeholder="Intramuros, Manila City" placeholderTextColor="#666" />
      </View>

      <View style={styles.routecontainer}>
          <View style={styles.position}>
              <Text style={styles.label}>Types of Vehicles</Text>
              <Text style={styles.fare}>Fare: ₱200.00</Text>
          </View>

          <View style={styles.vehicleTypes}>
              <View style={styles.vehicleItem}>
                  <TouchableOpacity> <MaterialCommunityIcons name="jeepney" size={27} color='#4F46E5' /></TouchableOpacity>
                  <Text style={styles.vehicleText}>Jeep</Text>
              </View>
              <View style={styles.vehicleItem}>
                  <View style={{ paddingBottom: 2, paddingTop: 2 }}>
                       <TouchableOpacity> <FontAwesome5 name="bus" size={22} color="#4F46E5" /> </TouchableOpacity>
                  </View>
                  <Text style={[styles.vehicleText]}>Modern jeep</Text>
              </View>
              <View style={styles.vehicleItem}>
              <TouchableOpacity> <FontAwesome5 name="bus-alt" size={24} color='#4F46E5' />  </TouchableOpacity>
                  <Text style={styles.vehicleText}>Bus</Text>
              </View>
          </View>

          <Text style={styles.estimatedTime}>Estimated Time: 45 minutes to 1.5 hours depending on traffic.</Text>
          <View style={{ marginTop: 10, marginBottom: 5 }}>
              <Text style={styles.label}>Route Overview</Text>
          </View>

          <View style={styles.routeline}>
              <View style={{ flexDirection: 'row' }}>
                  <Text style={[styles.getOnOff, { color: 'green' }]}>Get On  </Text>
                  <Text style={styles.startendroute}>Ride a jeepney from Glori Bayan, Novaliches, going towards Monumento or EDSA.</Text>
              </View>
              <View style={styles.greencircle} />
              <View style={styles.routes}>
                  <Text style={styles.directionText}>Get down at North Avenue along EDSA.</Text>
                  <Text style={styles.directionText}>Take a jeep or bus heading towards Quezon Avenue.</Text>
                  <Text style={styles.directionText}>Get down at the intersection of Quezon Avenue and España Boulevard.</Text>
                  <Text style={styles.directionText}>Get down at the intersection of Quezon Avenue and España Boulevard.</Text>
            
              </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.getOnOff, { color: 'blue', width: 50, marginLeft: 16}]}>Get Off</Text>
              <Text style={styles.startendroute}>Ride a jeep to Manila, then get off at Lerma Street.</Text>
              <View style={styles.bluecircle} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 40, gap: 14,}}>
              <FontAwesome5 name="walking" size={20} color="#6B7280" />
              <Text style={styles.walkroutes}>Walk to Intramuros via Padre Burgos or General Luna Street.</Text>
          </View>
      </View>

     



      <View style={[{ borderWidth: 1, borderColor: '#C7D2FE', backgroundColor: '#EEF2FF', borderRadius: 2, padding: 2, flexDirection: 'column', width: '100%', marginVertical: 15, }]}>
      
    {/* <View style={{ flex: 1 }}>
        <MapView
          style={{ width: '100%', height: 300 }}
          initialRegion={{
            latitude: 14.5896,
            longitude: 120.9793,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{ latitude: 14.5896, longitude: 120.9793 }}
            title="Intramuros"
          />
        </MapView>
      </View>  */}

      </View>

   

      

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 25 }}>

          <Link href="/routedropdown" asChild>
          <TouchableOpacity
              style={{
                  backgroundColor: '#E0E7FF',
                  borderRadius: 10,
                  marginBottom: 80,
                  padding: 11}}
                  onPress={() => {
                    console.log('Button Pressed');
                }}
          >
              <Text style={{
                  color: '#6366F1',
                  fontSize: 13,
                  fontWeight: '600'
              }}>Close</Text>
          </TouchableOpacity>
          </Link>
      </View>

     

  </ScrollView>
);}


const styles = StyleSheet.create({

  maincontainer: {flexDirection: 'column', padding: 30, backgroundColor: '#F9FAFB', width: '100%' },
  userDetails: {flexDirection: 'row', alignItems: 'center', marginBottom:14,},
  circle: {width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  userinitial: { color: '#fff', fontSize: 11, fontWeight: 'bold',},
  username: {fontSize: 13, color: '#6B7280', fontWeight: '700',},
  email: { fontSize: 12, color: '#6B7280',},
  
  container:{padding:8},
  label:{fontSize: 12, fontWeight: '500', color: '#6B7280',  marginTop: 10},
  userlocation: {backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 8, padding: 8, fontSize: 11, color: '#374151', marginVertical: 8,}, 
  userdestination: {backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 8, padding: 8,fontSize: 11, color: '#374151', marginVertical: 8,}, 
  
  routecontainer:{borderWidth: 1, borderColor: '#C7D2FE',borderRadius: 8, padding:10, flexDirection: 'column', width: '100%', },
  fare: {fontSize: 12, fontWeight: '500', color: '#6B7280',},
  position: { flexDirection: 'row', justifyContent: 'space-between',},
  vehicleTypes : { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#EEF2FF', borderRadius: 8, padding: 4, marginTop:10},
  vehicleItem: { alignItems: 'center',},
  vehicleText: {fontSize: 9, color: '#6B7280', marginVertical: 4,},
  estimatedTime: {fontSize: 10,color: '#6B7280', textAlign: 'center',},
 
  routeline: { paddingLeft: 14, borderLeftWidth: 3  ,borderLeftColor: 'green', marginTop: 6},
  greencircle: {position: 'absolute',left: -7 ,paddingHorizontal: 6,paddingVertical: 6, borderRadius: 24, backgroundColor: 'green', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  bluecircle: {position: 'absolute',left: -4.5 ,paddingHorizontal: 6,paddingVertical: 6, borderRadius: 24, backgroundColor: 'blue', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  routes: {flexDirection: 'column', marginVertical: 6, marginLeft: 3},
  getOnOff: {fontSize: 12, fontWeight: 'bold',  },
  directionText: {fontSize: 10,color: '#6B7280',marginBottom: 8,marginLeft: 50,},
  startendroute:{fontSize: 10,color: '#6B7280',marginBottom: 10,marginLeft: 5, flexWrap: 'wrap', flex: 1},
  walkroutes: {fontSize: 10, color: '#6B7280', marginVertical: 6, marginLeft: 3},


})
