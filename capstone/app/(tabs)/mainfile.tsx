import React, { useState, useEffect } from 'react';

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



import { View, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalComponent from './custommodal';
import AntDesign from '@expo/vector-icons/AntDesign';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';

const App: React.FC = () => {
  const [PostData, setPostData] = useState<PostItem[]>([
     {
       id: 1,
       upvotes: 0,
       downvotes: 0,
       userinitial: "AR",
       loginusername: "Ashley Ruaza",
       username: "@ashruaza",
       location: "North Olympus",
       fare: 500,
       destination: "National Museum",
       description: "Good",
       suggestiontextbox: "Some suggestion text here.",
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
     const updatedTexts = [...submittedTexts, text]; // Append new text
     await AsyncStorage.setItem('submittedTexts', JSON.stringify(updatedTexts));
     setSubmittedTexts(updatedTexts); // Update state
   } catch (error) {
     console.error('Failed to save text:', error);
   }
 };

 const handleNewPost = (newPost: PostItem) => {
   setPostData((prevPostData) => [...prevPostData, newPost]);
 };

 const PostCard: React.FC<{ Post: PostItem }> = ({ Post }) => (
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
    
    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginTop: 7}}>
    <Text style={styles.dest}>Destination: </Text>
    <Text style={styles.suggestordestination}>{Post.destination}</Text>
    </View>

    <View>
    <Text style={styles.touristexp}>Tourist Experience: </Text>
    <Text style={styles.usersuggestion}>{Post.suggestiontextbox}</Text>
    </View>

  <View style={{flexDirection: 'row', marginTop: 16, alignItems: 'center', justifyContent: 'space-between'}}>

    <View style={styles.content}>
          <Octicons name="shield-check" size={18} color="#6366F1" />
          <Text style={styles.status}>Status</Text>
          <View style={styles.badge}>
            <Entypo name="check" size={14} color="#03C04A" />
            <Text style={styles.cert}>Certified Kommutsera</Text>
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

 return (
  
   <View style={styles.container}>
     <Button title="Open Modal" onPress={() => setModalVisible(true)} />
     <Text style={styles.title}>Submitted Texts:</Text>
     
     <ModalComponent
       visible={modalVisible}
       onClose={() => setModalVisible(false)}
       onSubmit={handleSubmit}
       onNewPost={handleNewPost}  // New prop to handle adding a new post
     />
     {PostData.map((post) => (
       <PostCard key={post.id} Post={post} />
     ))}
   </View>
 );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  submittedText: {
    marginTop: 5,
    fontSize: 16,
  },
  PostContainer: {
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    width: '90%',
    height: 'auto',
    minHeight: '40%',
    maxHeight: '90%',
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
  },
  userdetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 50,
    gap: 11,
    marginBottom: 20,
  },
  userprofile: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userinitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  user: {
    flexDirection: 'column',
  },
  loginusername: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  username: {
    fontSize: 11,
    color: '#6B7280',
  },
  location: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  fare: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  destination: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  description: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
  },
  suggestordetails: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 11 },
  feedbackcontainer: { borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#EEF2FF', padding: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, marginBottom: 10, width: '100%'},
  profile: { width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  suggestor: { flexDirection: 'column' },
  initial: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  suggestorname: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  suggestorusername: { fontSize: 11, color: '#6B7280' },
  usersuggestion: { fontSize: 11, color: '#6B7280', flexWrap: 'wrap', marginLeft: 50, marginTop: 0 },
  suggestordestination: { fontSize: 11, color: '#6B7280', flexWrap: 'wrap', marginLeft: 0, marginBottom: 10,  },
  touristexp: { fontSize: 11, color: '#6B7280', flexWrap: 'wrap', marginLeft: 50, },
  dest: { fontSize: 11, color: '#6B7280', flexWrap: 'wrap', marginLeft: 50, marginBottom: 10 },
  
  suggestiontextbox: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#374151',
    marginVertical: 8,
    width: '100%',
    height: 120,
    textAlignVertical: 'top',
  },
  arrowup: { borderWidth: 1, borderColor: '#ABEBA2', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' },
  num: { marginLeft: 6, fontSize: 10, fontWeight: '900' },
  arrowdown: { borderWidth: 1, borderColor: '#EBA2A2', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' },
  arrowcontainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  iconStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    marginTop: 16,
  },
  cert: {
    color: '#22c55e',
    fontWeight: '500',
    fontSize: 11,
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
});

export default App;
