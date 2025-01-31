import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput,} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

type CommentItem = {
  id: number;
  text: string;
  commenterName: string;
  userHandle: string;
  commenterEmail: string;
};

export default function TabTwoScreen() {
  const [inputText, setInputText] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);

  const handlePost = () => {
    if (inputText.trim()) {
      const newComment: CommentItem = {
        id: comments.length + 1,
        text: inputText,
        commenterName: 'Ash Ruaza',
        userHandle: '@ashleyruaza',
        commenterEmail: 'AR',
      };

      setComments([...comments, newComment]); // Save new comment to state
      setInputText(''); // Clear input after posting
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

  return (
  <ScrollView style={styles.maincontainer}>

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
    
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}

      <View style={[{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, gap: 2, width: '100%',  }]}>
          
          <TextInput style={styles.commenttextbox} placeholder="Write a comment" placeholderTextColor="#666" multiline={true} value={inputText}
               onChangeText={setInputText} />
          
          <TouchableOpacity style={styles.button} onPress={handlePost}>
              <Text style={styles.buttonText}>Post</Text>
          </TouchableOpacity>


          

      </View>
  </ScrollView>
);

}


const styles = StyleSheet.create({

  maincontainer: {flexDirection: 'column', padding: 30, backgroundColor: '#F9FAFB', width: '100%' },

  experience: { fontSize: 12, color: '#6B7280', marginVertical: 8,},
  commentcircle: {width: 20, height: 20, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  numofcomments: {fontSize: 10, color: '#6366f1', fontWeight: 700,},

  commenterDetails: {flexDirection: 'row', alignItems: 'center', marginBottom:8, marginTop: 18,} ,
  circlecomment: {width: 36, height: 36, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 16,},
  commenterinitial: { color: '#fff', fontSize: 11, fontWeight: 'bold',},
  commentername: {fontSize: 13, color: '#6B7280', fontWeight: '700',},
  commenteremail: { fontSize: 12, color: '#6B7280',},
  comment: { fontSize: 12, color: '#6B7280',},

  commenttextbox: {backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 8, padding: 6,fontSize: 11, color: '#374151', width: '85%'}, 
  button: {backgroundColor: '#6366F1', paddingHorizontal: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center', height: 30},
  buttonText: {color: 'white', fontSize: 11, paddingVertical: 2},

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
})
