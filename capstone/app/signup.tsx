import React, { useState, useEffect } from 'react';
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
  useWindowDimensions
} from 'react-native';
import axiosInstance from '../axiosConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'textShadow*',
  'shadow*',
]);


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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // New: Ensure you're using await properly in checkAuthStatus:
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Updated validateForm function with new email validation logic:
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

    if (!formData.firstname.trim()) newErrors.firstname = 'First Name is required';
    if (!formData.lastname.trim()) newErrors.lastname = 'Last Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Confirm password is required';
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleInputChange = (field: keyof SignupForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

const handleSubmit = async () => {
  if (!validateForm()) return;
  setIsLoading(true);

  // Prepare payload as Rails expects:
  const payload = {
    user: {
      firstname: formData.firstname,
      lastname: formData.lastname,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.passwordConfirmation, // note the underscore
    },
  };

  console.log('Payload being sent:', payload); // Debug log

  try {
    const response = await axiosInstance.post("/api/users", payload);
    console.log('Response received:', response.data); // Debug log

    if (response.status === 201) {
      await AsyncStorage.setItem("token", response.data.token);
      router.replace("/(tabs)/about");
    }
  } catch (error: any) {
    console.error('Registration error:', error); // Debug log
    let errorMessage = "Registration failed";
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
      if (error.response.data.errors) {
        // Handle field-specific errors from server
        const serverErrors = error.response.data.errors;
        setErrors(prev => ({
          ...prev,
          ...serverErrors,
        }));
      }
    }
    setErrors(prev => ({ ...prev, form: errorMessage }));
  } finally {
    setIsLoading(false);
  }
};



  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.mainContainer}>
            <View style={styles.headerImageContainer}>
              <Image source={require('../assets/images/reg.png')} style={styles.headerImage} />
              <View style={styles.textOverlay}>
                <Text style={[styles.heading, { fontSize: width * 0.08 }]}>Kommutsera</Text>
                <Text style={[styles.description, { fontSize: width * 0.04 }]}>
                  Kommutsera is the perfect guide for exploring Metro Manila. With easy-to-follow routes, it helps you navigate the city's cultural, historic, and modern attractions effortlessly.
                </Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              <Image source={require('../assets/images/logo.png')} style={styles.logo} />
              <Text style={[styles.formTitle, { fontSize: width * 0.06 }]}>Register to Kommutsera!</Text>
              <Text style={styles.subtitle}>Please enter your credentials</Text>

              {Object.keys(formData).map((field) => {
                const key = field as keyof SignupForm;
                return (
                  <View key={field} style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {field.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                    </Text>

                    <View style={styles.passwordContainer}>
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
                            ? 'youremail@example.com'
                            : key === 'username'
                            ? 'E.g johndoe12'
                            : ''
                        }
                        secureTextEntry={key.toLowerCase().includes('password')}
                        value={formData[key]}
                        onChangeText={(value) => handleInputChange(key, value)}
                        placeholderTextColor="#888"
                      />
                    </View>

                    {errors[key] && (
                      <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                        <Text style={styles.errorText}>{errors[key]}</Text>
                      </View>
                    )}
                  </View>
                );
              })}

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Registering...' : 'Register'}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.linkText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const getStyles = (width: number) =>
  StyleSheet.create({
    scrollContentContainer: {
      flexGrow: 1,
      backgroundColor: '#F9FAFB',
      alignItems: 'center',
      padding: 16,
      marginTop: 40,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mainContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      boxShadow: '0 2px 4px rgba(0,0,0,0.25)', // Replaced shadow props with boxShadow
      elevation: 5,
      width: '100%',
      maxWidth: 800,
      marginBottom: 50,
    },
    headerImageContainer: {
      height: 200,
      position: 'relative',
    },
    headerImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    textOverlay: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
    },
    heading: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 8,
      textAlign: 'left',
    },
    description: {
      fontSize: width * 0.04,
      color: '#FFFFFF',
      textAlign: 'left',
      lineHeight: 20,
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
      marginBottom: 20,
    },
    formTitle: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      color: '#2D3436',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: width * 0.04,
      color: '#636E72',
      textAlign: 'center',
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 12,
      color: '#2D3436',
      marginBottom: 8,
      fontWeight: '600',
      textAlign: 'left',
      marginLeft: 15,
    },
    input: {
      backgroundColor: '#F5F7FF',
      borderRadius: 10,
      paddingVertical: 9,
      paddingHorizontal: 10,
      width: '90%',
      fontSize: 12,
      color: '#2D3436',
      textAlign: 'left',
      borderWidth: 1,
      borderColor: '#C7D2FE',
      marginLeft: 15,
    },
    inputError: {
      borderColor: '#FF3B30',
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 12,
      marginLeft: 4,
    },
    submitButton: {
      backgroundColor: '#6266f0',
      borderRadius: 10,
      paddingVertical: 12,
      marginTop: 30,
      width: '70%',
      alignSelf: 'center',
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
    },
    linkText: {
      color: '#4B7BEC',
      fontWeight: 'bold',
    },
  });

export default RegisterScreen;
