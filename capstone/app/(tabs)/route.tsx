import React, { useState } from 'react';
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ReviewModal from '../reviewmodal';


const RouteScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
  return (
    
    <ScrollView style={styles.maincontainer}>
        
      <View style={[{ borderWidth: 2, flex: 1, borderColor: '#C7D2FE', backgroundColor: '#EEF2FF', flexDirection: 'column', width: '100%', marginTop: 15, }]}>
            <Text>MAP HERE </Text>
       </View>
           
        <View style={styles.container}>
            <Text style={styles.text}>Details</Text>
                <View style={{padding: 8,marginBottom: 10,}}>
                    <Text style={styles.label}>Location</Text>
                        <TextInput
                        style={styles.userlocation}
                        placeholder="Novaliches, Bayan Glori"
                        placeholderTextColor="#666"
                        />
                    <Text style={styles.label}>Destination</Text>
                        <TextInput
                        style={styles.userdestination}
                        placeholder="Intramuros, Manila City"
                        placeholderTextColor="#666"
                        />
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={styles.box}>
                        <Entypo name="location-pin" size={23} color='#44457D'/>
                        <Text style={styles.boxlabel}>10 km</Text>
                    </View>
                    <View style={styles.box}>
                        <FontAwesome6 name="peso-sign" size={14} color='#44457D' style={{ paddingVertical: 4 }} />
                        <Text style={styles.boxlabel}>Fare: 300</Text>
                    </View>
                    <View style={styles.box}>
                        <FontAwesome5 name="running" size={20} color='#44457D' />
                        <Text style={styles.boxlabel}>8 hr</Text>
                    </View>
                    <View style={styles.box}>
                        <MaterialCommunityIcons name="jeepney" size={22} color='#44457D' />
                        <Text style={styles.boxlabel}>1hr 30 min</Text>
                    </View>
                    <View style={styles.box}>
                        <FontAwesome6 name="bus-simple" size={18} color='#44457D' style={{ paddingVertical: 1 }} />
                        <Text style={styles.boxlabel}>1hr 30 min</Text>
                    </View>
                </View>

                
                <View style={styles.routecontainer}>
                    <Text style={{fontSize: 13, fontWeight: '500', color: '#6B7280', marginBottom: 18}}>Route Overview</Text>
                    <View style={styles.routeline}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.getOnOff, { color: 'green' }]}>Get On  </Text>
                            <Text style={styles.startroute}>Ride a jeepney from Glori Bayan, Novaliches, going towards Monumento or EDSA.</Text>
                        </View>
                        <View style={styles.greencircle} />
                            <View style={styles.routes}>
                                <Text style={styles.directionText}>Get down at North Avenue along EDSA.</Text>
                                <Text style={styles.directionText}>Take a jeep or bus heading towards Quezon Avenue.</Text>
                                <Text style={styles.directionText}>Get down at the intersection of Quezon Avenue and España Boulevard.</Text>
                                <Text style={styles.directionText}>Get down at the intersection of Quezon Avenue and España Boulevard.</Text>
                            </View>
                    </View>

                    <View style={{ flexDirection: 'row', }}>
                        <Text style={[styles.getOnOff, { color: 'blue', width: 50, marginLeft: 16}]}>Get Off</Text>
                        <Text style={styles.endroute}>Ride a jeep to Manila, then get off at Lerma Street.</Text>
                        <View style={styles.bluecircle} />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 40, gap: 14,}}>
                        <FontAwesome5 name="walking" size={20} color="#6B7280" />
                        <Text style={styles.walkroutes}>Walk  to  Intramuros via Padre Burgos or General Luna Street.</Text>
                    </View>

                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8}}>
                        <TouchableOpacity style={styles.twobox} onPress={() => setModalVisible(true)}>
                            <Text style={styles.texttwo}>Review</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.twobox} onPress={() => router.push("/community")}>
                            <Text style={styles.texttwo}>Route Post Suggestions</Text>
                        </TouchableOpacity>
                    </View>
                    <ReviewModal visible={modalVisible} onClose={() => setModalVisible(false)} />
            </View>

        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: 'column',
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
  text: {
    color: '#44457D',
    fontWeight: '500',
    fontSize: 16,
  },
  container: {
    padding: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 10,
  },
  userlocation: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  userdestination: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  box: {flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F4F6FF', padding: 8},
  boxlabel: {fontSize: 11, fontWeight: 700, color: '#44457D'},

  routecontainer:{borderWidth: 1, borderColor: '#C7D2FE',borderRadius: 8, padding: 16, flexDirection: 'column', width: '100%', marginTop: 18, marginBottom: 100},
  routeline: { paddingLeft: 14, borderLeftWidth: 3  ,borderLeftColor: 'green', },
  greencircle: {position: 'absolute',left: -7 ,paddingHorizontal: 6,paddingVertical: 6, borderRadius: 24, backgroundColor: 'green', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  bluecircle: {position: 'absolute',left: -4.5 ,paddingHorizontal: 6,paddingVertical: 6, borderRadius: 24, backgroundColor: 'blue', alignItems: 'center', justifyContent: 'center', marginRight: 16},
  routes: {flexDirection: 'column', marginVertical: 6, marginLeft: 3},
  getOnOff: {fontSize: 12, fontWeight: 'bold',  },
  directionText: {fontSize: 10,color: '#6B7280',marginBottom: 8,marginLeft: 50,},
  startroute:{fontSize: 10,color: '#6B7280',marginBottom: 10,marginLeft: 5, flexWrap: 'wrap', flex: 1},
  endroute:{fontSize: 10,color: '#6B7280',marginBottom: 10,marginLeft: 5, flexWrap: 'wrap', flex: 1},
  walkroutes: {fontSize: 10, color: '#6B7280', marginVertical: 6, marginLeft: 5,  flexWrap: 'wrap', flex: 1},
  twobox: {borderRadius: 6, backgroundColor: '#E0E7FF', paddingVertical: 5, paddingHorizontal: 12, margin: 4},
  texttwo: {fontSize: 12, color: '#6366F1', fontWeight: 500}
});

export default RouteScreen;
