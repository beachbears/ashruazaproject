import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import axiosInstance from '../../axiosConfig'; // Ensure your axios instance is configured

interface Profile {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  profile_picture_url: string | null;
}

const UserProfile = () => {
  // Only use minimal auth data from context (token, logout)
  const { authToken, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the full profile data from the API
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

  useEffect(() => {
    fetchProfile();
  }, []);

  // Render avatar from API data (profile_picture_url), or fallback to first letter of username.
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
        <Text style={styles.userName}>{profile?.username || 'User Name'}</Text>
        <Text style={styles.userEmail}>{profile?.email || 'user@example.com'}</Text>
      </View>
      <View style={styles.profileContent}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.aboutText}>
          This is a brief bio about you. You can share your interests, travel experiences,
          or any personal details you'd like to display.
        </Text>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
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
});