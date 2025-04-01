// PostOptionsMenu.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Post } from '@/contexts/PostContext';
import { AuthContext } from '@/contexts/AuthContext'; // Adjust path as needed

interface PostOptionsMenuProps {
  post: Post;
  onReport: (id: number) => void;
  onDelete: (id: number) => void;
}

const PostOptionsMenu: React.FC<PostOptionsMenuProps> = ({ post, onReport, onDelete }) => {
  const { userId } = useContext(AuthContext); // Get userId from context
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(prev => !prev);

  // Check if the post belongs to the current user
  const isOwnPost = post.user?.id === userId && userId !== null;

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={toggleMenu} style={styles.optionsButton}>
        <MaterialIcons name="more-vert" size={18} color="#6B7280" />
      </TouchableOpacity>
      {menuVisible && (
        <View style={styles.menu}>
          {isOwnPost ? (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => post.id !== undefined && onDelete(post.id)}
            >
              <MaterialIcons name="delete" size={16} color="#DC2626" />
              <Text style={[styles.menuText, { color: '#DC2626' }]}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => post.id !== undefined && onReport(post.id)}
            >
              <MaterialIcons name="flag" size={16} color="#F97316" />
              <Text style={[styles.menuText, { color: '#F97316' }]}>Report</Text>
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
    borderColor: '#ccc',
    borderRadius: 10,
    elevation: 4,
    zIndex: 100,
    flexDirection: 'column',
    width: 100,
    shadowColor: '#000',
  },
  menuItem: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  menuText: {
    fontSize: 14,
    marginRight: 10,
    fontWeight: '600',
  },
});

export default PostOptionsMenu;