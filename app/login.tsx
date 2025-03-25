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
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../axiosConfig';
import { RootStackParamList } from '../app';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
// Updated: Use expo-router's useRouter instead of useNavigation
import { useRouter } from 'expo-router';
import { LogBox } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

LogBox.ignoreLogs([
  'textShadow*',
  'shadow*',
]);

type LoginForm = {
  email: string;
  password: string;
};

type FormErrors = {
  email: string;
  password: string;
  form: string;
};

type LoginScreenProps = {
  // Retained the type, but navigation prop is no longer used.
  navigation: NativeStackNavigationProp<RootStackParamList, 'login'>;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
    form: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Updated: Use expo-router's useRouter
  const router = useRouter();
  // Kunin ang login function mula sa AuthContext
  const { login } = useContext(AuthContext);

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '', form: '' }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = { email: '', password: '', form: '' };

    if (!formData.email.trim()) {
      newErrors.email = 'Username is required';
      isValid = false;
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Function para i-check ang auth status
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('token:', token);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/login", { // Siguraduhing tama ang endpoint
        email: formData.email,
        password: formData.password
      });

      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        // I-update ang global auth state gamit ang login function mula sa AuthContext
        login(formData.email, response.data.token);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password";
        }
      }
      setErrors(prev => ({ ...prev, form: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const { width, height } = Dimensions.get('window');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.mainContainer}>
          <View style={styles.headerImageContainer}>
            <Image source={require('../assets/images/reg.png')} style={styles.headerImage} />
            <View style={styles.textOverlay}>
              <Text style={[styles.heading, { fontSize: width * 0.08 }]}>Kommutsera</Text>
               <Text style={[styles.description, { fontSize: width * 0.03 }]}>
                             Kommutsera is the perfect guide for exploring Metro Manila. With easy-to-follow routes, it helps you navigate the city’s cultural, historic, and modern attractions effortlessly. Whether you’re a tourist or a local, Kommutsera ensures a smooth, enjoyable, and efficient travel experience throughout Metro Manila.</Text>
            </View>

          </View>

          <View style={styles.formContainer}>
            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            <Text style={[styles.formTitle, { fontSize: width * 0.06 }]}>Welcome to Kommutsera!</Text>
            <Text style={[styles.subtitle, ]}>Please enter your credentials</Text>

            <Text style={[styles.inputnameEmail, ]}>Email</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#6366F1" style={styles.icon} />
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <Text style={[styles.inputnamePassword,  ]}>Password</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#6366F1" style={styles.icon} />
                <TextInput
                  style={[styles.input, errors.password ? styles.inputError : null]}
                  placeholder="Password"
                  secureTextEntry={true}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {errors.form && <Text style={styles.formErrorText}>{errors.form}</Text>}

            <View style={styles.row}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkedBox]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, ]}>Remember me?</Text>
              </TouchableOpacity>
            
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton, { paddingHorizontal: width * 0.1 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText]}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={[styles.linkText]}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    padding: 16,
     
  },
  mainContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    boxShadow: '0 5px 7px rgba(9, 8, 8, 0.25)',
    elevation: 5,
    width: '100%',
    maxWidth: 800,
    marginBottom: 20
  },
  headerImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200, // Adjust as needed
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden', // Ensures the border radius is applied properly
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  textOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
  },
  heading: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    color: '#FFFFFF',
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    marginTop: 20,
  },
  formTitle: {
    fontWeight: 'bold',
    color: '#424368',
    marginBottom: 2,
  },
  subtitle: {
    color: '#636E72',
    marginBottom: 40,
    fontSize: 15
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 13,
    color: '#2D3748',
    
  },
  inputError: {
    borderColor: '#F56565',
  },
  icon: {
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 23,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
    borderRadius: 4,
  },
  checkedBox: {
    backgroundColor: '#3182CE',
    borderColor: '#3182CE',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  checkboxLabel: {
    color: '#4A5568',
    fontSize: 16
  },
  linkText: {
    color: '#4B7BEC',
    textDecorationLine: 'underline',
    fontSize: 15
  },
  submitButton: {
    backgroundColor: '#6266f0',
    paddingVertical: 8,
    paddingHorizontal: 100,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 20,
    width: '90%',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#4A5568',
    fontSize: 15
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 16,
  },
  errorText: {
    color: '#F56565',
    fontSize: 12,
  },
  formErrorText: {
    color: '#F56565',
    fontSize: 12,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  inputnameEmail: {
    marginRight: 260,
    marginBottom: 10,
    color: '#44457D',
    fontSize: 15,
  },
  inputnamePassword: {
    marginRight: 230,
    marginBottom: 10,
    color: '#44457D',
    fontSize: 15,
  },
  
});

export default LoginScreen;
