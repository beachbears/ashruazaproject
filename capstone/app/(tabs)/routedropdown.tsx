import React, { useState } from 'react';
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,TextInput,} from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalComponent from '../postmodal';
import FeedbackModal from '../feedbackmodal';
import AntDesign from '@expo/vector-icons/AntDesign';
import { APP_NAME} from "../../constants";



// Dropdown Component
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
            <TouchableOpacity key={index} onPress={() => selectOption(option)} style={styles.option}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Post Item
type PostItem = {
  id: number;
  upvotes: number;
  downvotes: number;
  userinitial: string;
  loginusername: string;
  username: string;
  location: string;
  fare: number;
  destination: string;
  description: string;
  suggestiontextbox: string;
};

// PostCard Component
const PostCard: React.FC<{ Post: PostItem; handleUpvote: (id: number) => void; handleDownvote: (id: number) => void }> = ({
  Post,
  handleUpvote,
  handleDownvote,
}) => (
  <View style={styles.feedbackcontainer}>
    <View style={styles.suggestordetails}>
      <View style={styles.profile}>
        <Text style={styles.initial}>{Post.userinitial}</Text>
      </View>
      <View style={styles.suggestor}>
        <Text style={styles.suggestorname}>{Post.loginusername}</Text>
        <Text style={styles.suggestorusername}>{Post.username}</Text>
      </View>
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 7,}}>
      <Text style={styles.dest}>Destination: </Text>
      <Text style={styles.suggestordestination}>{Post.destination}</Text>
    </View>

    <View>
      <Text style={styles.usersuggestion}>Tourist Experience: </Text>
      <Text style={styles.suggestion}>{Post.suggestiontextbox}</Text>
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
        <TouchableOpacity style={styles.arrowup} onPress={() => handleUpvote(Post.id)}>
          <AntDesign name="arrowup" size={12} color="#22C55E" />
          <Text style={[styles.num, { color: '#22C55E' }]}>{Post.upvotes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.arrowdown} onPress={() => handleDownvote(Post.id)}>
          <AntDesign name="arrowdown" size={12} color="#C52222" />
          <Text style={[styles.num, { color: '#C52222' }]}>{Post.downvotes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const dropdownOptions = ['Destination', 'Fare Cost', 'Popularity', 'Time',];

const handleOptionSelect = (option: string) => {
  console.log('Selected option:', option);
};


// Main Screen Component
export default function TabTwoScreen() {
  const [PostData, setPostData] = useState<PostItem[]>([
    {
      id: 1,
      upvotes: 0,
      downvotes: 0,
      userinitial: 'AR',
      loginusername: 'Ashley Ruaza',
      username: '@ashruaza',
      location: 'North Olympus',
      fare: 500,
      destination: 'National Museum',
      description: 'Good',
      suggestiontextbox: 'Some suggestion text here.',
    },
  ]);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [submittedTexts, setSubmittedTexts] = useState<string[]>([]);

  const handleUpvote = (id: number): void => {
    setPostData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
  };

  const handleDownvote = (id: number): void => {
    setPostData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, downvotes: item.downvotes + 1 } : item
      )
    );
  };

  const handleSubmit = async (text: string) => {
    try {
      const updatedTexts = [...submittedTexts, text];
      await AsyncStorage.setItem('submittedTexts', JSON.stringify(updatedTexts));
      setSubmittedTexts(updatedTexts);
    } catch (error) {
      console.error('Failed to save text:', error);
    }
  };

  const handleNewPost = (newPost: PostItem) => {
    setPostData((prevPostData) => [...prevPostData, newPost]);
  };


  
  return (
    <ScrollView style={styles.maincontainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Details</Text>
        <TouchableOpacity style={styles.postbutton} onPress={() => setModalVisible(true)}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
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

      <Text style={styles.sectionTitle}>Best Way</Text>

      <Link href="/routes" asChild>
        <TouchableOpacity style={styles.bestwaycard}>
          <View style={styles.bestwayHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarinitial}>KT</Text>
            </View>
            <Text style={styles.appname}>{APP_NAME}</Text>
          </View>
          <Text style={styles.bestwaydestination}>Destination: Intramuros, Manila</Text>
          <Text style={styles.bestwaydescription}>Tourist Spot Description</Text>
          <Text style={styles.bestway}>
            Intramuros represents the Philippines' colonial past, where the Spanish influence is deeply woven into the country's culture, architecture, and traditions. It is a symbol of both the glory and the struggles during the Spanish colonization. Today, it serves as a popular tourist destination that offers a look back in time, showcasing historical landmarks, museums, and the enduring spirit of the Filipino people.
          </Text>
          <View style={styles.bestwayStatus}>
            <Octicons name="shield-check" size={16} color="#6366F1" />
            <Text style={styles.status}>Status</Text>
            <View style={styles.badge}>
              <Entypo name="check" size={14} color="#22C55E" />
              <Text style={styles.certified}>Certified {APP_NAME}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Route Post Suggestion</Text>
        <View style={{ zIndex: 1000 }}>
          <Dropdown
            options={dropdownOptions}
            onSelect={handleOptionSelect}
            defaultValue="Select Option"
          />
        </View>
      </View>

      {/* Post Cards */}
      {PostData.map((post) => (
        <PostCard
          key={post.id}
          Post={post}
          handleUpvote={handleUpvote}
          handleDownvote={handleDownvote}
        />
      ))}

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ModalComponent
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onNewPost={handleNewPost}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: 'column',
    padding: 30,
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  headerText: {
    color: '#44457D',
    fontWeight: '500',
    fontSize: 16,
  },
  postbutton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontSize: 12,
  },
  container: {
    padding: 8,
    marginBottom: 20
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
  bestwaycard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 18,
  },
  bestwayHeader: {
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
  avatarinitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  appname: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  bestwaydestination: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
    marginVertical: 16,
  },
  bestwaydescription: {
    fontSize: 12,
    marginVertical: 4,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
    marginBottom: 6,
  },
  bestway: {
    fontSize: 12,
    color: '#6B7280',
    flexWrap: 'wrap',
    marginLeft: 50,
    marginBottom: 10,
  },
  bestwayStatus: {
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  status: {
    fontSize: 11,
    color: '#404163',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: '700',
  },
  badge: {
    borderWidth: 1,
    borderColor: '#ABEBA2',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    backgroundColor: '#ecfdf5',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  certified: {
    color: '#22C55E',
    fontWeight: '700',
    fontSize: 12,
  },
  dropdowncontainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dropdownButton: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    width: 125,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
  },
  buttonText: {
    color: '#44457D',
    fontSize: 13,
    fontWeight: '400',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E5E7EB',
    zIndex: 1000,
    width: 125,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    top: 40,
  },
  option: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 4,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
    color: '#44457D',
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
  username: {
    fontSize: 12,
    color: '#6B7280',
  },
  suggestion: {
    fontSize: 12,
    color: '#6B7280',
    flexWrap: 'wrap',
    marginLeft: 50,
  },
  suggestorsdestination: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
    marginTop: 10,
    marginBottom: 6,
  },
  cert: {
    color: '#22c55e',
    fontWeight: '500',
    fontSize: 11,
  },
  
   
  arrowup: {
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowdown: {
    borderWidth: 1,
    borderColor: '#f47357',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  num: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '700',
  },
  floatingButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 300,
    marginBottom: 100,
  },
  floatingButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 6,
    marginTop: 30,
  },
  floatingButtonText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: '400',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    marginBottom: 13,
  },
  sectionTitle: {
    color: '#44457D',
    fontWeight: '500',
    fontSize: 16,
  },
  dest: { fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50, },
    usersuggestion: {  fontSize: 12,
      marginVertical: 4,
      color: '#6B7280',
      fontWeight: '500',
      marginLeft: 50,
      },
  suggestordetails: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 2 },
  feedbackcontainer: { borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#EEF2FF', padding: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, marginBottom: 10, width: '100%'},
  suggestor: { flexDirection: 'column' },
  initial: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  suggestorname: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  suggestorusername: { fontSize: 11, color: '#6B7280' },
  suggestordestination: {  fontSize: 11, color: '#6B7280', flexWrap: 'wrap', marginLeft: 0 },
    
    
});