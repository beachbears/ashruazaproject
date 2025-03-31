import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import axiosInstance from '@/axiosConfig';
import { StackNavigationProp } from '@react-navigation/stack';
import { router } from 'expo-router';

interface Profile {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  profile_picture_url: string | null;
}

type RootStackParamList = {
  userProfile: undefined;
  changePassword: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'userProfile'>;

const UserProfile = ({ navigation }: { navigation: NavigationProp }) => {
  const { authToken } = useContext(AuthContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstname: profile.firstname || '',
        lastname: profile.lastname || '',
        username: profile.username,
        email: profile.email,
      });
      setSuccessMessage(null); // Clear success message when profile updates
    }
  }, [profile]);

  const renderAvatar = () => {
    const initial = profile?.username ? profile.username.charAt(0).toUpperCase() : 'U';
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
    );
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    // Client-side validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid email format');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await axiosInstance.patch(
        '/api/profile',
        {
          user: {
            firstname: formData.firstname,
            lastname: formData.lastname,
            username: formData.username,
            email: formData.email,
          },
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setProfile(response.data);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
    } catch (err: any) {
      console.error('Save error:', err);
      if (err.response?.data?.detailed_errors) {
        setError(err.response.data.detailed_errors.join(', '));
      } else {
        setError('Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error && !isEditing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isEditing) {
    return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <View style={styles.avatarContainer}>{renderAvatar()}</View>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              placeholder="Enter username"
              accessibilityLabel="Username"
            />
          </View>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              keyboardType="email-address"
              accessibilityLabel="Email"
            />
          </View>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="text-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.firstname}
              onChangeText={(text) => setFormData({ ...formData, firstname: text })}
              placeholder="Enter first name"
              accessibilityLabel="First Name"
            />
          </View>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="text-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.lastname}
              onChangeText={(text) => setFormData({ ...formData, lastname: text })}
              placeholder="Enter last name"
              accessibilityLabel="Last Name"
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={saveProfile}
            disabled={saving}
            accessibilityLabel="Save Changes"
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setIsEditing(false)}
            accessibilityLabel="Cancel"
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  } else {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>{renderAvatar()}</View>
          <Text style={styles.userName}>{profile?.username}</Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>
          {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
          <View style={styles.profileContent}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.infoText}>First Name: {profile?.firstname || 'Not set'}</Text>
            <Text style={styles.infoText}>Last Name: {profile?.lastname || 'Not set'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
            accessibilityLabel="Edit Profile"
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/changePassword')}
            accessibilityLabel="Change Password"
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView >
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    width: '100%',
  },
  formContainer: {
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: '#6366F1',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 20,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  profileContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#1F2937',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default UserProfile;