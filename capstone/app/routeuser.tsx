import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Animated, Keyboard} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

type VehicleType = "Jeep" | "E-jeep" | "Bus" | "UV Exp." | "Train";
type CommentItem = {
    id: number;
    text: string;
    commenterName: string;
    userHandle: string;
    commenterEmail: string;
  };

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
  timestamp?: number;
  vehicles: VehicleType[];
}

const vehicleIcons: Record<VehicleType, JSX.Element> = {
  "Jeep": <MaterialCommunityIcons name="jeepney" size={24} color="#4F46E5" />,
  "E-jeep": <FontAwesome5 name="bus" size={20} color="#4F46E5" />,
  "Bus": <FontAwesome5 name="bus-alt" size={22} color="#4F46E5" />,
  "UV Exp.": <FontAwesome5 name="car" size={22} color="#4F46E5" />,
  "Train": <FontAwesome6 name="train-subway" size={24} color="#4F46E5" />
};


const RouteUserScreen: React.FC<{ post: PostItem; onBack: () => void }> = ({ post, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);

   
  useEffect(() => {
    const loadComments = async () => {
      try {
        const savedComments = await AsyncStorage.getItem(`comments_${post.id}`); // Unique key per post
        if (savedComments) {
          setComments(JSON.parse(savedComments));
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };
    loadComments();
  }, [post.id]); // Ensure it reloads when the post changes
  
 
  const handlePost = async () => {
    if (inputText.trim()) {
      const newComment: CommentItem = {
        id: comments.length + 1,
        text: inputText,
        commenterName: 'Ash Ruaza',
        userHandle: '@ashleyruaza',
        commenterEmail: 'AR',
      };
  
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      setInputText('');
  
      try {
        await AsyncStorage.setItem(`comments_${post.id}`, JSON.stringify(updatedComments)); // Unique key per post
      } catch (error) {
        console.error('Error saving comments:', error);
      }
    }
  };
  
      
      const Comment: React.FC<{ comment: CommentItem }> = ({ comment }) => (
          <View>
            <View style={styles.commenterDetails}>
              <View style={styles.circlecomment}>
                <Text style={styles.commenterinitial}>{comment.commenterEmail}</Text>
              </View>
              <View style={{ flexDirection: 'column' }}>
                <Text style={styles.commentername}>{comment.commenterName}</Text>
                <Text style={styles.commenteremail}>{comment.userHandle}</Text>
              </View>
            </View>
            <Text style={styles.comment}>{comment.text}</Text>
          </View>
        ); 
       
        const [keyboardOffset] = useState(new Animated.Value(0));

        useEffect(() => {
          const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            Animated.timing(keyboardOffset, {
              toValue: -100, // Move up when keyboard appears
              duration: 300,
              useNativeDriver: false,
            }).start();
          });
      
          const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            Animated.timing(keyboardOffset, {
              toValue: 0, // Move back to center when keyboard hides
              duration: 300,
              useNativeDriver: false,
            }).start();
          });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (

    
    <ScrollView style={styles.maincontainer}>
     <Animated.View style={[ { transform: [{ translateY: keyboardOffset }] }]}>
      <View style={styles.userDetails}>
        <View style={styles.circle}>
          <Text style={styles.userinitial}>{post.userinitial}</Text>
        </View>
        <View>
          <Text style={styles.username}>{post.loginusername}</Text>
          <Text style={styles.email}>{post.username}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.locationText}>{post.location}</Text>

        <Text style={styles.label}>Destination</Text>
        <Text style={styles.locationText}>{post.destination}</Text>
        </View>

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
      <View style={{flexDirection: 'column', gap: 8, marginTop: 20}}>
        <Text style={{fontSize: 14, fontWeight: 500, color: '#44457D'}}>Your Experiences </Text>
        <Text style={styles.experience}>{post.suggestiontextbox}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '700', marginTop: 10 }}>Comments</Text>
          <View style={styles.commentcircle}>
              <Text style={styles.numofcomments}>{comments.length}</Text>
          </View>
      </View>

      
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
      
     
      <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, width: '100%', gap: 4 }]}>
        <View style={{ width: '85%' }}>  
          <TextInput
          style={styles.commenttextbox}
          placeholder="Write a comment"
          placeholderTextColor="#666"
          multiline={true}
          value={inputText}
          onChangeText={setInputText}
        />
        </View>

        <TouchableOpacity style={[styles.button]} onPress={handlePost}>
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
      </View>

      </Animated.View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 25, marginBottom: 100 }}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Close</Text>
          </TouchableOpacity>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  maincontainer: { flex: 1,   padding: 30, backgroundColor: '#F9FAFB', width: '100%' },
  backButton: { padding: 10, alignSelf: 'flex-start', backgroundColor: '#E0E7FF', borderRadius: 10, marginBottom: 80,},
  backText: { color: '#6366F1', fontSize: 13, fontWeight: '600'},
  userDetails: {flexDirection: 'row', alignItems: 'center', marginBottom:14,},
  circle: {width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  userinitial: { color: '#fff', fontSize: 13, fontWeight: 'bold',},
  username: {fontSize: 14, color: '#404163', fontWeight: '700',},
  email: { fontSize: 11, color: '#686A9C',},
  detailsContainer: { marginBottom: 16 },
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
  commentcircle: {width: 20, height: 20, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  numofcomments: {fontSize: 10, color: '#6366f1', fontWeight: 700,},
  commenterDetails: {flexDirection: 'row', alignItems: 'center', marginBottom:8, marginTop: 18,} ,
  circlecomment: {width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  commenterinitial: { color: '#fff', fontSize: 11, fontWeight: 'bold',},
  commentername: {fontSize: 13, color: '#6B7280', fontWeight: '700',},
  commenteremail: { fontSize: 12, color: '#6B7280',},
  comment: { fontSize: 12, color: '#6B7280',},
  commenttextbox: {backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 8, padding: 6,fontSize: 11, color: '#374151',}, 
  button: {backgroundColor: '#6366F1', paddingHorizontal: 2, borderRadius: 10, justifyContent: 'center', alignItems: 'center', height: 30, width: '15%'},
  buttonText: {color: 'white', fontSize: 11, fontWeight: 500},
});
export default RouteUserScreen;
