import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput,} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabTwoScreen() {
    const stepsCount = 4; // Replace with actual number of steps
const lineHeight = stepsCount * 38; // Adjust the multiplier based on step spacing

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
                  <MaterialCommunityIcons name="jeepney" size={27} color='#4F46E5' />
                  <Text style={styles.vehicleText}>Jeep</Text>
              </View>
              <View style={styles.vehicleItem}>
                  <View style={{ paddingBottom: 2, paddingTop: 2 }}>
                      <FontAwesome5 name="bus" size={22} color="#4F46E5" />
                  </View>
                  <Text style={[styles.vehicleText]}>Modern jeep</Text>
              </View>
              <View style={styles.vehicleItem}>
                  <FontAwesome5 name="bus-alt" size={24} color='#4F46E5' />
                  <Text style={styles.vehicleText}>Bus</Text>
              </View>
          </View>

          <Text style={styles.estimatedTime}>Estimated Time: 45 minutes to 1.5 hours depending on traffic.</Text>
          <View style={{ marginTop: 22, marginBottom: 5 }}>
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

      <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '700', marginTop: 15 }}>Your Experiences</Text>
      <Text style={styles.experience}>We started our journey at the Intramuros gates, aiming to explore the historic walled city. We initially struggled with finding parking, but a guard directed us to a nearby lot. The cobblestone streets were enchanting but tricky to navigate without a map. A tricycle driver offered a short tour, which made it easier to locate iconic spots like Fort Santiago and San Agustin Church. Getting lost led us to a quaint café serving authentic Filipino dishes.</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '700', marginTop: 10 }}>Comments</Text>
          <View style={styles.commentcircle}>
              <Text style={styles.numofcomments}>12</Text>
          </View>
      </View>

      <View style={styles.commenterDetails}>
          <View style={styles.circlecomment}>
              <Text style={styles.commenterinitial}>AR</Text>
          </View>
          <View style={[{ flexDirection: 'column' }]}>
              <Text style={styles.commentername}>Ashley Ruaza</Text>
              <Text style={styles.commenteremail}>@ashruaza</Text>
          </View>
      </View>

      <Text style={styles.comment}>We started our journey at the Intramuros gates, aiming to explore the historic walled city. We initially struggled with finding parking, but a guard directed us to a nearby lot. The cobblestone streets.</Text>
      <View style={[{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, gap: 8 }]}>
          <TextInput style={styles.commenttextbox} placeholder="Write a comment" placeholderTextColor="#666" />
          <TouchableOpacity style={styles.button} onPress={() => { }}>
              <Text style={styles.buttonText}>Post</Text>
          </TouchableOpacity>
      </View>

      <View style={[{ borderWidth: 1, borderColor: '#C7D2FE', backgroundColor: '#EEF2FF', borderRadius: 8, padding: 10, flexDirection: 'column', width: '100%', marginVertical: 15, height: '10%' }]}>
          <Text>MAP</Text>
      </View>

      <View style={styles.picturecontainer}>
          <View style={styles.imageWrapper}>
              <Image
                  source={require('../../assets/images/intramuros.jpg')}
                  style={styles.image}
              />
              <View style={{ flexDirection: 'column', gap: 6 }}>
                  <Text style={styles.firsttext}>Intramuros</Text>
                  <Text style={styles.secondtext}>Manila City</Text>
              </View>
          </View>
      </View>

      <Text style={styles.comment}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to national hero José Rizal. The ornate Manila Cathedral houses bronze carvings and stained glass windows.</Text>

      <View style={[{ flexDirection: 'column', borderWidth: 1, borderColor: '#21de6b', backgroundColor: '#f0fae5', borderRadius: 8, padding: 8, width: '100%', marginTop: 20, marginBottom: 10 }]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
              <Ionicons name="sparkles-sharp" size={14} color='#21de6b' />
              <Text style={[{ fontWeight: '600', color: '#21de6b' }]}> Trivia & Facts</Text>
          </View>
          <Text style={styles.comment}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
      </View>

      <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '700', marginTop: 10, marginBottom: 8 }}>Tourist Attraction Feedbacks</Text>

      <ScrollView 
      nestedScrollEnabled={true}
      style={styles.imageScrollBox}
      contentContainerStyle={[styles.imageScrollContainer, { flexGrow: 1 }]} // Added flexGrow: 1 here
   >
          
              <View style={styles.feedbackbox}>
                  <View style={styles.feedback}>
                      <Text style={styles.feedbacktitle}>Juan Dela Cruz</Text>
                      <Text style={styles.comment}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
                  </View>
              </View>

              <View style={styles.feedbackbox}>
                  <View style={styles.feedback}>
                      <Text style={styles.feedbacktitle}>Juan Dela Cruz</Text>
                      <Text style={styles.comment}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
                  </View>
              </View>

              <View style={styles.feedbackbox}>
                  <View style={styles.feedback}>
                      <Text style={styles.feedbacktitle}>Juan Dela Cruz</Text>
                      <Text style={styles.comment}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
                  </View>
              </View>

              <View style={styles.feedbackbox}>
                  <View style={styles.feedback}>
                      <Text style={styles.feedbacktitle}>Juan Dela Cruz</Text>
                      <Text style={styles.comment}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
                  </View>
              </View>

              <View style={styles.feedbackbox}>
                  <View style={styles.feedback}>
                      <Text style={styles.feedbacktitle}>Juan Dela Cruz</Text>
                      <Text style={styles.comment}>Old-world Intramuros is home to Spanish-era landmarks like Fort Santiago, with a large stone gate and a shrine to.</Text>
                  </View>
              </View>
  
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 25 }}>
          <TouchableOpacity
              style={{
                  backgroundColor: '#E0E7FF',
                  borderRadius: 10,
                  padding: 11
              }}
              onPress={() => console.log('Button Pressed!')}
          >
              <Text style={{
                  color: '#6366F1',
                  fontSize: 13,
                  fontWeight: '600'
              }}>Close</Text>
          </TouchableOpacity>
      </View>
  </ScrollView>
);}


const styles = StyleSheet.create({

  maincontainer: {flexDirection: 'column', padding: 30, backgroundColor: '#F9FAFB', width: '100%' },
  userDetails: {flexDirection: 'row', alignItems: 'center', marginBottom:14, marginTop: 30},
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
  estimatedTime: {fontSize: 8,color: '#6B7280', textAlign: 'center',},
 
  routeline: { paddingLeft: 14, borderLeftWidth: 3  ,borderLeftColor: 'green', marginTop: 6},
  greencircle: {position: 'absolute',left: -7 ,paddingHorizontal: 6,paddingVertical: 6, borderRadius: 24, backgroundColor: 'green', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  bluecircle: {position: 'absolute',left: -4.5 ,paddingHorizontal: 6,paddingVertical: 6, borderRadius: 24, backgroundColor: 'blue', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  routes: {flexDirection: 'column', marginVertical: 6, marginLeft: 3},
  getOnOff: {fontSize: 12, fontWeight: 'bold',  },
  directionText: {fontSize: 10,color: '#6B7280',marginBottom: 8,marginLeft: 50,},
  startendroute:{fontSize: 10,color: '#6B7280',marginBottom: 10,marginLeft: 5, flexWrap: 'wrap', flex: 1},
  walkroutes: {fontSize: 10, color: '#6B7280', marginVertical: 6, marginLeft: 3},

  experience: { fontSize: 12, color: '#6B7280', marginVertical: 8,},
  commentcircle: {width: 20, height: 20, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  numofcomments: {fontSize: 10, color: '#6366f1', fontWeight: 700,},

  commenterDetails: {flexDirection: 'row', alignItems: 'center', marginBottom:8, marginTop: 18,} ,
  circlecomment: {width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  commenterinitial: { color: '#fff', fontSize: 11, fontWeight: 'bold',},
  commentername: {fontSize: 13, color: '#6B7280', fontWeight: '700',},
  commenteremail: { fontSize: 12, color: '#6B7280',},
  comment: { fontSize: 12, color: '#6B7280',},

  commenttextbox: {backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 8, padding: 6,fontSize: 11, color: '#374151', width:'80%'}, 
  button: {backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 0, borderRadius: 10, justifyContent: 'center', alignItems: 'center',},
  buttonText: {color: 'white', fontSize: 11, paddingVertical: 2},

  picturecontainer: {justifyContent: 'center',alignItems: 'center',marginVertical: 10},
  imageWrapper: {position: 'relative', width: '100%',height: 200,},
  image: {width: '100%', height: '100%',borderRadius: 8,},
  firsttext: {
    position: 'absolute',
    bottom: 10,  
    left: 10,  
    color: 'white',  
    fontSize: 19,
    marginBottom: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,},

   secondtext: {
    position: 'absolute',
    bottom: 10,      
    left: 10,  
    color: 'white', 
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 30,},

    feedbackcontainer: { flexDirection: 'column', backgroundColor: '#F9FAFB', width: '100%', flex:1, borderWidth: 1, marginVertical: 8},
    feedback: {flexDirection: 'column', },
    feedbackbox: {borderWidth: 1, borderColor: '#C7D2FE', backgroundColor: '#FBFCFF', borderRadius: 14, padding: 5, width: '100%', marginVertical: 5},  
    feedbacktitle: {fontSize: 13, color: '#6B7280', fontWeight: '700', },

    imageScrollBox: {
      height: 350,  // Fixed height for the box to enable scrolling
    },
    imageScrollContainer: {
      paddingBottom: 16, // Optional padding at the bottom for spacing
    },
})
