import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import axiosInstance from '@/axiosConfig';

// For testing locally, create a separate axios instance.
// In production, you may use your production axios instance.
const localAxios = axios.create({
  baseURL: 'http://10.0.2.2:3000', // For Android emulator; replace with your IP if needed.
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

interface Profile {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  profile_picture_url: string | null;
}

const UserProfile = () => {
  const { authToken, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
  });

  // Fetch profile from the API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  // When the component mounts, load the profile
  useEffect(() => {
    fetchProfile();
  }, []);

  // When profile data is loaded, populate the formData
  useEffect(() => {
    if (profile) {
      setFormData({
        firstname: profile.firstname,
        lastname: profile.lastname,
        username: profile.username,
        email: profile.email,
      });
    }
  }, [profile]);

  // Save the updated profile data
  const saveProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.patch(
        '/api/profile',
        { user: formData },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Render the user's avatar
  const renderAvatar = () => {
    if (profile?.profile_picture_url) {
      return (
        <Image
          source={{ uri: profile.profile_picture_url }}
          style={styles.avatarImage}
        />
      );
    }
    const initial = profile?.username ? profile.username.charAt(0).toUpperCase() : 'U';
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        {renderAvatar()}
        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              placeholder="Username"
            />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Email"
            />
          </>
        ) : (
          <>
            <Text style={styles.userName}>{profile?.username || 'User Name'}</Text>
            <Text style={styles.userEmail}>{profile?.email || 'user@example.com'}</Text>
          </>
        )}
      </View>
      <View style={styles.profileContent}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={formData.firstname}
              onChangeText={(text) => setFormData({ ...formData, firstname: text })}
              placeholder="First Name"
            />
            <TextInput
              style={styles.input}
              value={formData.lastname}
              onChangeText={(text) => setFormData({ ...formData, lastname: text })}
              placeholder="Last Name"
            />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.aboutText}>
              This is a brief bio about you. You can share your interests, travel experiences,
              or any personal details you'd like to display.
            </Text>
          </>
        )}
        {isEditing ? (
          <TouchableOpacity style={styles.saveProfileButton} onPress={saveProfile}>
            <Text style={styles.saveProfileButtonText}>Save Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editProfileButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    backgroundColor: '#6366F1',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#718096',
  },
  profileContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 20,
  },
  editProfileButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveProfileButton: {
    backgroundColor: '#3182CE',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
    width: '80%',
    fontSize: 16,
  },
});
