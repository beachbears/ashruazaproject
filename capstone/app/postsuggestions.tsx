import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { 
  usePostContext,
  type Post,
  type VehicleType
} from './PostContext';
import PostModal from './postmodal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { APP_NAME } from "../constants";

const dropdownOptions = ['Destination', 'Fare Cost', 'Popularity', 'Time'];

interface DropdownProps {
  options: string[];
  onSelect?: (option: string) => void;
  defaultValue?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect, defaultValue = 'Select Option' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>(defaultValue);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  return (
    <View style={styles.dropdowncontainer}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownButton}>
        <Text style={styles.buttonText}>{selectedOption}</Text>
        <Entypo name="chevron-down" size={20} color="#44457D" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => selectOption(option)} 
              style={styles.option}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<Post, 'category'>) => void;
}

const vehicleIcons: Record<VehicleType, JSX.Element> = {
  "Jeep": <MaterialCommunityIcons name="jeepney" size={24} color="#4F46E5" />,
  "E-jeep": <FontAwesome5 name="bus" size={20} color="#4F46E5" />,
  "Bus": <FontAwesome5 name="bus-alt" size={22} color="#4F46E5" />,
  "UV Exp.": <FontAwesome5 name="car" size={22} color="#4F46E5" />,
  "Train": <FontAwesome6 name="train-subway" size={24} color="#4F46E5" />
};

export default function PostSuggestions() {
  const { posts, addPost, handleUpvote, handleDownvote, experienceOnly, setExperienceOnly } = usePostContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('Time');

  const suggestionPosts = posts.filter(post => post.category === 'postsuggestions');

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  // PostSuggestions.tsx
const handlePostSubmit = (formData: Omit<Post, 'category' | 'isExperienceOnly'>) => {
  // Add experienceOnly state to the post data
  addPost({ 
    ...formData,
    isExperienceOnly: experienceOnly 
  }, 'postsuggestions');
  
  // Reset experience mode
  setExperienceOnly(false);
};

  const sortedPosts = suggestionPosts.sort((a, b) => {
    switch(selectedOption) {
      case 'Time': 
        return b.timestamp - a.timestamp;
      case 'Fare Cost':
        return a.fare - b.fare;
      case 'Popularity':
        return b.upvotes - a.upvotes;
      case 'Destination':
        return a.destination.localeCompare(b.destination);
      default:
        return 0;
    }
  });

  const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return 'Just now';
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    return `${Math.floor(diff / day)}d ago`;
  };

  return (  
    <ScrollView style={styles.maincontainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Route Post Suggestion</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.postbutton}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={{ zIndex: 1000 }}>
        <Dropdown
          options={dropdownOptions}
          onSelect={handleOptionSelect}
          defaultValue="Select Option"
        />
      </View>

      <View style={{marginBottom: 200}}> 
        {sortedPosts.map((post) => (
          <View key={post.id} style={styles.containerpost}>
            <View style={styles.suggestordetails}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1}}>
                <View style={styles.profile}>
                  <Text style={styles.initial}>{post.userinitial}</Text>
                </View>
                <View style={styles.suggestor}>
                  <Text style={styles.suggestorname}>{post.loginusername}</Text>
                  <Text style={styles.suggestorusername}>{post.username}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.postTimestamp}>
                  {timeAgo(post.timestamp)}
                </Text>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <View style={{flexDirection: 'column', marginRight: 90}}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.locationText}>{post.location}</Text>
              </View>
              <View style={{flexDirection: 'column'}}>
                <Text style={styles.label}>Destination</Text>
                <Text style={styles.locationText}>{post.destination}</Text>
              </View>
            </View>

            {!post.isExperienceOnly && (
              <View style={styles.routecontainer}>
                <View style={styles.position}> 
                  <Text style={styles.conlabel}>Types of Vehicles</Text>
                  <Text style={styles.fare}>Fare: ₱{post.fare}.00</Text>
                </View>
                
                <View style={styles.vehiclesContainer}>
                  {post.vehicles?.length > 0 ? (
                    post.vehicles.map((vehicle, index) => (
                      <View key={index} style={styles.vehicleItem}>
                        {vehicleIcons[vehicle]}
                        <Text style={styles.vehicleText}>{vehicle}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.vehicleText}>No vehicles selected</Text>
                  )}
                </View>
                
                <Text style={styles.estimatedTime}>Estimated Time: 45 minutes to 1.5 hours depending on traffic.</Text>
                
                <View style={{ marginTop: 20, marginBottom: 10 }}>
                  <Text style={styles.conlabel}>Route Overview</Text>
                </View>
                
                <Text style={styles.description}>{post.description}</Text>
              </View>
            )}

            <View style={{flexDirection: 'column', gap: 8, marginTop: 20}}>
              <Text style={{fontSize: 14, fontWeight: '500', color: '#44457D'}}>
                {post.isExperienceOnly ? 'Your Experience' : 'Your Suggestions'}
              </Text>
              <Text style={styles.experience}>{post.suggestiontextbox}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={styles.content}>
                <Octicons name="shield-check" size={18} color="#6366F1" />
                <Text style={styles.status}>Status</Text>
                <View style={styles.badge}>
                  <Entypo name="check" size={14} color="#03C04A" />
                  <Text style={styles.cert}>Certified {APP_NAME}</Text>
                </View>
              </View>

              <View style={styles.arrowcontainer}>
                <TouchableOpacity 
                  style={styles.arrowup} 
                  onPress={() => handleUpvote(post.id)}
                >
                  <AntDesign name="arrowup" size={12} color="#22C55E" />
                  <Text style={[styles.arrowupnum, { color: '#22C55E' }]}>
                    {post.upvotes}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.arrowdown} 
                  onPress={() => handleDownvote(post.id)}
                >
                  <AntDesign name="arrowdown" size={12} color="#C52222" />
                  <Text style={[styles.arrowdownnum, { color: '#C52222' }]}>
                    {post.downvotes}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
      
      <PostModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setExperienceOnly(false);
        }}
        onSubmit={handlePostSubmit}
      />
    </ScrollView>
  );
}

 
 

 

const styles = StyleSheet.create({
  maincontainer: {flexDirection: 'column', backgroundColor: '#F9FAFB', width: '100%', padding: 15},
  content: {flexDirection: 'row',alignItems: 'center',gap: 4},
  headerText: {color: '#44457D',fontWeight: '500',fontSize: 16,},
  postbutton: {backgroundColor: '#6366F1',paddingHorizontal: 14,paddingVertical: 6,borderRadius: 10,justifyContent: 'center',alignItems: 'center'},
  postButtonText: {color: 'white',fontSize: 12, },
  detailsContainer: { marginBottom: 16, flexDirection: 'row',  paddingHorizontal: 10, },
  locationText: {fontSize: 12, fontWeight: '400', color: '#44457D'},
  label: { fontSize: 14, fontWeight: '500', color: '#44457D',  marginTop: 10},
  
  routecontainer:{borderWidth: 1, borderColor: '#C7D2FE',borderRadius: 8, padding:10, flexDirection: 'column', width: '100%', },
  position: { flexDirection: 'row', justifyContent: 'space-between',},
  fare: {fontSize: 12, fontWeight: '400', color: '#44457D',},
  estimatedTime: {fontSize: 10,color: '#44457D', textAlign: 'center',},
  conlabel: {fontSize: 13, fontWeight: '400', color: '#44457D'},
  vehiclesContainer: {  flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#EEF2FF', borderRadius: 8, padding: 4, marginTop:10},
  vehicleItem: { alignItems: 'center', marginTop: 4},
  vehicleText: {fontSize: 11, color: '#44457D', marginVertical: 4,},
  getOnOff: {fontSize: 12, fontWeight: 'bold',  },
  description: {fontSize: 12,color: '#44457D', marginBottom: 6},
  experience: {fontSize: 12,color: '#6B7280', fontWeight: 400},

  status: {fontSize: 11,color: '#404163',flexDirection: 'row',alignItems: 'center',fontWeight: '700',},
  badge: {borderWidth: 1,borderColor: '#ABEBA2',borderRadius: 6,paddingHorizontal: 3,paddingVertical: 1,backgroundColor: '#ecfdf5',flexDirection: 'row',alignItems: 'center',marginLeft: 4,},
  dropdowncontainer: {justifyContent: 'flex-end', flexDirection: 'row', marginBottom: 10},
  dropdownButton: {backgroundColor: '#F5F7FF',borderWidth: 1,borderColor: '#C7D2FE',borderRadius: 8,width: 125, alignItems: 'center',flexDirection: 'row',justifyContent: 'space-between',padding: 6,},
  buttonText: {color: '#44457D',fontSize: 12,fontWeight: '400',},
  dropdownList: {position: 'absolute',backgroundColor: '#fff',borderWidth: 1,borderRadius: 8,borderColor: '#E5E7EB',zIndex: 1000,width: 125, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", elevation: 4,top: 40, },
  option: {borderBottomWidth: 1,borderBottomColor: '#E5E7EB',padding: 4,alignItems: 'center',},
  optionText: {fontSize: 13,color: '#44457D',},
  profile: {width: 36,height: 36,borderRadius: 24,backgroundColor: '#6366f1',alignItems: 'center',justifyContent: 'center',marginRight: 16,},
  username: {fontSize: 12,color: '#6B7280',},
  suggestion: {fontSize: 12,color: '#6B7280',flexWrap: 'wrap',marginLeft: 50,},
  suggestorsdestination: {fontSize: 12,color: '#6B7280',fontWeight: '500',marginLeft: 50,marginTop: 10,marginBottom: 6,},
  cert: { color: '#22c55e', fontWeight: '500', fontSize: 11, }, 
  arrowup: {  borderWidth: 1,  borderColor: '#4ade80',  borderRadius: 6,  paddingHorizontal: 3,  paddingVertical: 1, flexDirection: 'row',  alignItems: 'center',},
  arrowdown: {borderWidth: 1,borderColor: '#f47357',borderRadius: 6,paddingHorizontal: 3,paddingVertical: 1,flexDirection: 'row',alignItems: 'center', },
  arrowcontainer: {  flexDirection: 'row',  alignItems: 'center',  gap: 4,},
  arrowupnum: { marginLeft: 6, fontSize: 10, fontWeight: '700',},
  arrowdownnum: { marginLeft: 6, fontSize: 10, fontWeight: '700', },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16, marginTop:16},
  sectionTitle: { color: '#44457D', fontWeight: '500', fontSize: 16,},
  dest: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginLeft: 50, },
  usersuggestion: {  fontSize: 12, marginVertical: 4, color: '#6B7280', fontWeight: '500', marginLeft: 50, },
  suggestordetails: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 2, justifyContent: "space-between" },
  containerpost: { borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#C7D2FE', padding: 12, elevation: 4, marginBottom: 20, width: '100%', borderWidth: 1},
  suggestor: { flexDirection: 'column' },
  initial: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  suggestorname: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  suggestorusername: { fontSize: 11, color: '#6B7280' },
  suggestordestination: {  fontSize: 11, color: '#6B7280', flexWrap: 'wrap', marginLeft: 0 },
  postTimestamp: { fontSize: 10, color: '#999', marginTop: 5, textAlign: 'right' }
});