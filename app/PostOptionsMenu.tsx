import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AuthContext } from './../contexts/AuthContext';
import { Post } from '@/contexts/PostContext'; // Ensure Post type is defined

// Define an interface for the component props.
interface PostOptionsMenuProps {
  post: Post;
  onReport: (id: number) => void;
  onDelete: (id: number) => void;
}

const PostOptionsMenu: React.FC<PostOptionsMenuProps> = ({ post, onReport, onDelete }) => {
  // Use userHandle from AuthContext for comparison.
  const { user } = useContext(AuthContext);
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(prev => !prev);

  // Check if the current user owns the post by comparing user handles.
  const isCurrentUserPost = user?.id === post.user?.id;

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={toggleMenu} style={styles.optionsButton}>
        <MaterialIcons name="more-vert" size={24} color="black" />
      </TouchableOpacity>
      {menuVisible && (
        <View style={styles.menu}>
          {isCurrentUserPost ? (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                if (post.id !== undefined) {
                  onDelete(post.id);
                }
              }}
            >
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                if (post.id !== undefined) {
                  onReport(post.id);
                }
              }}
            >
              <Text style={styles.menuText}>Report</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'relative',
  },
  optionsButton: {
    padding: 4,
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    elevation: 4, // For Android shadow
    zIndex: 100,
  },
  menuItem: {
    padding: 8,
  },
  menuText: {
    fontSize: 16,
  },
});

export default PostOptionsMenu;
