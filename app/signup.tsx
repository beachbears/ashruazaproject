import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import axiosInstance from '../axiosConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';
import { AuthContext } from '../contexts/AuthContext'; // Adjust path as needed

LogBox.ignoreLogs(['textShadow*', 'shadow*']);

type SignupForm = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type FormErrors = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

const RegisterScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = getStyles(width);
  const { login } = useContext(AuthContext); // Access login from AuthContext

  const [formData, setFormData] = useState<SignupForm>({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First Name is required';
    } else if (formData.firstname.length > 50) {
      newErrors.firstname = 'First Name cannot be longer than 50 characters';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last Name is required';
    } else if (formData.lastname.length > 50) {
      newErrors.lastname = 'Last Name cannot be longer than 50 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username cannot be longer than 20 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 20) {
      newErrors.password = 'Password cannot be longer than 20 characters';
    }

    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Confirm password is required';
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleInputChange = (field: keyof SignupForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setGeneralError('');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setGeneralError('');

    const payload = {
      user: {
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.passwordConfirmation,
      },
    };

    try {
      const response = await axiosInstance.post('/api/users', payload);
      console.log('Server response:', response.data);
      if (response.status === 201) {
        const token = response.data.token;
        const userName = response.data.user.firstname; // Use firstname as userName
        if (!token) {
          throw new Error('No token received from server');
        }
        await login(userName, token); // Update AuthContext
        alert(`Account created successfully! Welcome, ${userName}!`);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      if (__DEV__) {
        console.log('Error response data:', error.response?.data);
      }

      const newErrors: FormErrors = {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
      };

      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.error && Array.isArray(data.error)) {
          data.error.forEach((errMsg: string) => {
            const lowerMsg = errMsg.toLowerCase();
            if (lowerMsg.includes('email')) {
              newErrors.email = errMsg;
            } else if (lowerMsg.includes('username')) {
              newErrors.username = errMsg;
            } else if (lowerMsg.includes('first name')) {
              newErrors.firstname = errMsg;
            } else if (lowerMsg.includes('last name')) {
              newErrors.lastname = errMsg;
            } else if (lowerMsg.includes('password confirmation')) {
              newErrors.passwordConfirmation = errMsg;
            } else if (lowerMsg.includes('password')) {
              newErrors.password = errMsg;
            } else {
              setGeneralError((prev) => (prev ? `${prev}, ${errMsg}` : errMsg));
            }
          });
          setErrors(newErrors);
        } else if (data.message) {
          setGeneralError(data.message);
        } else {
          setGeneralError('Please check your details and try again.');
        }
      } else {
        setGeneralError('Unable to reach the server. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // The rest of the component (UI rendering) remains unchanged
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            <View style={styles.headerImageContainer}>
              <Image source={require('../assets/images/reg.png')} style={styles.headerImage} />
              <View style={styles.textOverlay}>
                <Text style={[styles.heading, { fontSize: width * 0.08 }]}>Kommutsera</Text>
                <Text style={[styles.description, { fontSize: width * 0.03 }]}>
                  Kommutsera is the perfect guide for exploring Metro Manila. With
                  easy-to-follow routes, it helps you navigate the city’s cultural,
                  historic, and modern attractions effortlessly. Whether you’re a
                  tourist or a local, Kommutsera ensures a smooth, enjoyable, and
                  efficient travel experience throughout Metro Manila.
                </Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              <Image source={require('../assets/images/logo.png')} style={styles.logo} />
              <Text style={[styles.formTitle]}>Register to Kommutsera!</Text>
              <Text style={styles.subtitle}>Please enter your credentials</Text>

              {generalError ? (
                <View style={styles.generalErrorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" style={styles.errorIcon} />
                  <Text style={styles.generalErrorText}>{generalError}</Text>
                </View>
              ) : null}

              {Object.keys(formData).map((field) => {
                const key = field as keyof SignupForm;
                return (
                  <View key={field} style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {field
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </Text>
                    <TextInput
                      style={[styles.input, errors[key] ? styles.inputError : null]}
                      placeholder={
                        key === 'firstname'
                          ? 'E.g John'
                          : key === 'lastname'
                            ? 'E.g Doe'
                            : key === 'password'
                              ? 'Enter a password'
                              : key === 'passwordConfirmation'
                                ? 'Confirm your password'
                                : key === 'email'
                                  ? 'E.g johndoe123@example.com'
                                  : key === 'username'
                                    ? 'E.g johndoe12'
                                    : ''
                      }
                      secureTextEntry={key.toLowerCase().includes('password')}
                      value={formData[key]}
                      onChangeText={(value) => handleInputChange(key, value)}
                      placeholderTextColor="#888"
                    />
                    {errors[key] ? (
                      <View style={styles.errorContainer}>
                        <Ionicons
                          name="alert-circle"
                          size={16}
                          color="#FF3B30"
                          style={styles.errorIcon}
                        />
                        <Text style={styles.errorMessage}>{errors[key]}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.linkText}>Login here</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Styles remain unchanged
const getStyles = (width: number) =>
  StyleSheet.create({
    scrollContentContainer: {
      flexGrow: 1,
      backgroundColor: '#F9FAFB',
      alignItems: 'center',
      padding: 16,
    },
    mainContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      elevation: 5,
      width: '100%',
      maxWidth: 800,
      marginBottom: 30,
    },
    headerImageContainer: {
      height: 260,
      position: 'relative',
      borderRadius: 8,
    },
    headerImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    textOverlay: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 20,
    },
    heading: {
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 8,
      textAlign: 'left',
    },
    description: {
      color: '#FFFFFF',
      textAlign: 'left',
      lineHeight: 14,
    },
    formContainer: {
      paddingHorizontal: width * 0.1,
      paddingTop: 40,
      paddingBottom: 30,
    },
    logo: {
      width: 80,
      height: 80,
      alignSelf: 'center',
      marginBottom: 10,
      borderRadius: 8,
    },
    formTitle: {
      fontWeight: 'bold',
      color: '#2D3436',
      textAlign: 'center',
      marginBottom: 2,
      fontSize: 23,
    },
    subtitle: {
      color: '#636E72',
      textAlign: 'center',
      marginBottom: 40,
    },
    generalErrorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFEAEA',
      padding: 10,
      borderRadius: 5,
      marginBottom: 15,
      marginHorizontal: 15,
    },
    generalErrorText: {
      color: '#FF3B30',
      fontSize: 14,
      marginLeft: 5,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      marginBottom: 6,
      color: '#44457D',
      fontSize: 15,
    },
    input: {
      backgroundColor: '#F5F7FF',
      borderRadius: 10,
      paddingVertical: 9,
      paddingHorizontal: 10,
      width: '100%',
      fontSize: 12,
      color: '#2D3436',
      borderWidth: 1,
      borderColor: '#C7D2FE',
    },
    inputError: {
      borderColor: '#FF3B30',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      marginLeft: 15,
    },
    errorIcon: {
      marginRight: 4,
    },
    errorMessage: {
      color: '#FF3B30',
      fontSize: 12,
    },
    submitButton: {
      backgroundColor: '#6266f0',
      borderRadius: 10,
      paddingVertical: 8,
      marginTop: 26,
      width: '90%',
      alignSelf: 'center',
      marginBottom: 2,
    },
    disabledButton: {
      opacity: 0.7,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },
    footerText: {
      color: '#4A5568',
      fontSize: 15,
    },
    linkText: {
      color: '#4B7BEC',
      marginLeft: 4,
      fontSize: 14,
      textDecorationLine: 'underline',
    },
  });

export default RegisterScreen;