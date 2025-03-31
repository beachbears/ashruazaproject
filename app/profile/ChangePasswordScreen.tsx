import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import axiosInstance from '@/axiosConfig';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { authToken } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await axiosInstance.patch('/api/profile', {
        user: {
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        }
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#6366F1" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-open" size={20} color="#6366F1" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="checkmark-circle" size={20} color="#6366F1" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 30,
    textAlign: 'center',
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
  button: {
    backgroundColor: '#6366F1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ChangePasswordScreen;