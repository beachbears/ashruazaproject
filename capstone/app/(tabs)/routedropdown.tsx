import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList
} from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';
import { Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { APP_NAME } from "../../constants";
import RouteUserScreen from '../routeuser';
import ModalComponent from '../postmodal';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VehicleType = "Jeep" | "E-jeep" | "Bus" | "UV Exp.";

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

const dropdownOptions = ['Destination', 'Fare Cost', 'Popularity', 'Time'];

// Rest of the interfaces and PostCard component remain the same
interface PostItem {
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
  timestamp: number;
  vehicles: VehicleType[];
}

interface PostCardProps {
  post: PostItem;
  handleUpvote: (id: number) => void;
  handleDownvote: (id: number) => void;
  onSelect: (post: PostItem) => void;
}

const timeAgo = (timestamp: number | string): string => {
  if (!timestamp) return 'Unknown time';
  const postDate = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInSeconds / 3600);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInHours < 1) return `${diffInMinutes} minute's ago`;
  if (diffInHours < 24) return `${diffInHours} hour's ago`;
  if (diffInDays < 7) return `${diffInDays} day's ago`;
  if (diffInDays === 7) return '1 week ago';
  return '1 month ago';
};

const PostCard: React.FC<PostCardProps> = ({ post, handleUpvote, handleDownvote, onSelect }) => {
  const [timeString, setTimeString] = useState<string>(timeAgo(post.timestamp));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeString(timeAgo(post.timestamp));
    }, 60000);
    return () => clearInterval(timer);
  }, [post.timestamp]);

  return (
    <TouchableOpacity style={styles.containerpost} onPress={() => onSelect(post)}>
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
          <Text style={styles.postTimestamp}>{timeString}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 7}}>
        <Text style={styles.dest}>Destination: </Text>
        <Text style={styles.suggestordestination}>{post.destination}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 7 }}>
        <Text style={styles.dest}>Fare: </Text>
        <Text style={styles.suggestordestination}>{post.fare.toFixed(2)}</Text>
      </View>

      <View>
        <Text style={styles.usersuggestion}>Tourist Experience: </Text>
        <Text style={styles.suggestion}>{post.suggestiontextbox}</Text>
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
          <TouchableOpacity style={styles.arrowup} onPress={() => handleUpvote(post.id)}>
            <AntDesign name="arrowup" size={12} color="#22C55E" />
            <Text style={[styles.arrowupnum, { color: '#22C55E' }]}>{post.upvotes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowdown} onPress={() => handleDownvote(post.id)}>
            <AntDesign name="arrowdown" size={12} color="#C52222" />
            <Text style={[styles.arrowdownnum, { color: '#C52222' }]}>{post.downvotes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TabTwoScreen() {
  const [posts, setPosts] = useState<PostItem[]>([
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
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      vehicles: ["Jeep"],
    },
  ]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const savedPosts = await AsyncStorage.getItem('posts');
        if (savedPosts) {
          setPosts(JSON.parse(savedPosts));
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    loadPosts();
  }, []);

  // Save posts to AsyncStorage whenever they change
  useEffect(() => {
    const savePosts = async () => {
      try {
        await AsyncStorage.setItem('posts', JSON.stringify(posts));
      } catch (error) {
        console.error('Error saving posts:', error);
      }
    };

    savePosts();
  }, [posts]);

  const handleUpvote = (id: number): void => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === id ? { ...post, upvotes: post.upvotes + 1 } : post
      )
    );
  };

  const handleDownvote = (id: number): void => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === id ? { ...post, downvotes: post.downvotes + 1 } : post
      )
    );
  };

  const handleSubmitPost = (newPost: PostItem) => {
    setPosts(prevPosts => [...prevPosts, { ...newPost, id: prevPosts.length + 1 }]);
    setModalVisible(false);
  };


  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

    

  const handleOptionSelect = (option: string) => {
    setPosts(prevPosts => {
      const sortedPosts = [...prevPosts];
      switch (option) {
        case 'Time':
          return sortedPosts.sort((a, b) => b.timestamp - a.timestamp);
        case 'Fare Cost':
          return sortedPosts.sort((a, b) => a.fare - b.fare);
        case 'Popularity':
          return sortedPosts.sort((a, b) => b.upvotes - a.upvotes);
        case 'Destination':
          return sortedPosts.sort((a, b) => a.destination.localeCompare(b.destination));
        default:
          return sortedPosts;
      }
    });
  };

  if (selectedPost) {
    return <RouteUserScreen post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  return (
    <ScrollView style={styles.maincontainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Details</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.postbutton}>
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

      <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Best Way</Text>
        <View style={{ zIndex: 1000 }}>
          <Dropdown
            options={dropdownOptions}
            onSelect={handleOptionSelect}
            defaultValue="Select Option"
          />
        </View>
      </View>

      <Link href="/routetouristspots" asChild>
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

    <View style={{marginBottom: 200}}>
      <FlatList
          data={posts}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              handleUpvote={handleUpvote}
              handleDownvote={handleDownvote}
              onSelect={setSelectedPost}
            />
          )}
        />
</View>
      <ModalComponent 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={handleSubmitPost} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {flexDirection: 'column',padding: 30, backgroundColor: '#F9FAFB',width: '100%',},
  header: {flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: 8,},
  content: {flexDirection: 'row',alignItems: 'center',gap: 4},
  headerText: {color: '#44457D',fontWeight: '500',fontSize: 16,},
  postbutton: {backgroundColor: '#6366F1',paddingHorizontal: 14,paddingVertical: 6,borderRadius: 10,justifyContent: 'center',alignItems: 'center'},
  postButtonText: {color: 'white',fontSize: 12, },
  container: {padding: 8,marginBottom: 20},
  label: {fontSize: 12,fontWeight: '500',color: '#6B7280',marginTop: 10,},
  userlocation: {backgroundColor: '#F5F7FF',borderWidth: 1,borderColor: '#C7D2FE',borderRadius: 8,padding: 8,fontSize: 11,color: '#374151',marginVertical: 8,},
  userdestination: {backgroundColor: '#F5F7FF',borderWidth: 1,borderColor: '#C7D2FE',borderRadius: 8,padding: 8,fontSize: 11,color: '#374151',marginVertical: 8,},
  bestwaycard: {backgroundColor: '#FFFFFF',borderColor: '#E5E7EB',borderWidth: 1,borderRadius: 8,padding: 16,elevation: 4,shadowColor: '#000', shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.2,shadowRadius: 4,marginBottom: 28,},
  bestwayHeader: {flexDirection: 'row',alignItems: 'center', },
  avatar: {width: 36,height: 36,borderRadius: 24,backgroundColor: '#6366f1',alignItems: 'center',justifyContent: 'center',marginRight: 16,},
  avatarinitial: {color: '#fff',fontSize: 11,fontWeight: 'bold',},
  appname: {fontSize: 13,fontWeight: '700',color: '#4B5563',},
  bestwaydestination: {fontSize: 12,color: '#6B7280',fontWeight: '500',marginLeft: 50,marginVertical: 16,},
  bestwaydescription: {fontSize: 12,marginVertical: 4,color: '#6B7280',fontWeight: '500',marginLeft: 50,marginBottom: 6,},
  bestway: {fontSize: 12,color: '#6B7280',flexWrap: 'wrap',marginLeft: 50,marginBottom: 10,},
  bestwayStatus: {marginLeft: 4,flexDirection: 'row',alignItems: 'center',gap: 6,marginTop: 10,},
  status: {fontSize: 11,color: '#404163',flexDirection: 'row',alignItems: 'center',fontWeight: '700',},
  badge: {borderWidth: 1,borderColor: '#ABEBA2',borderRadius: 6,paddingHorizontal: 3,paddingVertical: 1,backgroundColor: '#ecfdf5',flexDirection: 'row',alignItems: 'center',marginLeft: 4,},
  certified: {color: '#22C55E',fontWeight: '700',fontSize: 12,},
  dropdowncontainer: {justifyContent: 'flex-end',alignItems: 'center',},
  dropdownButton: {backgroundColor: '#F5F7FF',borderWidth: 1,borderColor: '#C7D2FE',borderRadius: 8,width: 125, alignItems: 'center',flexDirection: 'row',justifyContent: 'space-between',padding: 6,},
  buttonText: {color: '#44457D',fontSize: 13,fontWeight: '400',},
  dropdownList: {position: 'absolute',backgroundColor: '#fff',borderWidth: 1,borderRadius: 8,borderColor: '#E5E7EB',zIndex: 1000,width: 125,shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.1,shadowRadius: 4,elevation: 4,top: 40, },
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
  floatingButtonContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 300, marginBottom: 100,},
  floatingButton: {position: 'relative', width: 40, height: 40, borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 4, elevation: 6, marginTop: 30,},
  floatingButtonText: {flexDirection: 'row',alignItems: 'center',justifyContent: 'center',color: '#fff',fontSize: 20,fontWeight: '400', },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 20, marginBottom: 23,},
  sectionTitle: { color: '#44457D', fontWeight: '500', fontSize: 16,},
  dest: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginLeft: 50, },
  usersuggestion: {  fontSize: 12, marginVertical: 4, color: '#6B7280', fontWeight: '500', marginLeft: 50, },
  suggestordetails: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 2, justifyContent: "space-between" },
  containerpost: { borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#EEF2FF', padding: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, marginBottom: 20, width: '100%',},
  suggestor: { flexDirection: 'column' },
  initial: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  suggestorname: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  suggestorusername: { fontSize: 11, color: '#6B7280' },
  suggestordestination: {  fontSize: 11, color: '#6B7280', flexWrap: 'wrap', marginLeft: 0 },
  postTimestamp: { fontSize: 10, color: '#999', marginTop: 5, textAlign: 'right' }
});

