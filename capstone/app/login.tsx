import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons'; // For icons

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
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
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

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/login", { user: formData });
      const { token } = response.data;

      if (token) {
        await AsyncStorage.setItem("token", token);
      }
      AsyncStorage.getItem("token").then((token) => console.log("Stored token:", token));
      await AsyncStorage.setItem('isLoggedIn', 'true');
      navigation.replace('ButtonNav');
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.response?.status === 401) {
        setErrors(prev => ({ ...prev, form: 'Invalid username or password' }));
      } else {
        setErrors(prev => ({ ...prev, form: 'An error occurred. Please try again later.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const { width } = Dimensions.get('window');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.mainContainer}>
          <View style={styles.headerImageContainer}>
            <Image source={require('../assets/images/reg.png')} style={styles.headerImage} />
            <View style={styles.textOverlay}>
              <Text style={styles.heading}>Kommutsera</Text>
              <Text style={styles.description}>
                Kommutsera is the perfect guide for exploring Metro Manila. With easy-to-follow routes, it helps you navigate the city's cultural, historic, and modern attractions effortlessly.
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.formTitle}>Welcome to Kommutsera!</Text>
            <Text style={styles.subtitle}>Please enter your credentials</Text>


          <Text style={styles.inputnameEmail}>Email</Text>
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
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <Text style={styles.inputnamePassword}>Password</Text>
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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {errors.form && (
              <Text style={styles.formErrorText}>{errors.form}</Text>
            )}

            <View style={styles.row}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkedBox]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Remember me?</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.disabledButton]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.linkText}>Create account</Text>
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
    marginTop: 40,
  },
  mainContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: '100%',
    maxWidth: 800,
  },
  headerImageContainer: {
    position: 'relative',
    height: 200,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 75,
    height: 75,
    marginBottom: 16,
    marginTop: 50,
  },
  formTitle: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#424368',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#44457De',
    marginBottom: 50,
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
    fontSize: 14,
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
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
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
    fontSize: 14,
    color: '#4A5568',
  },
  linkText: {
    fontSize: 14,
    color: '#3182CE',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#6266f0',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4A5568',
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
  inputnameEmail:{
    marginRight:260,
    marginBottom:10,
    color:'#44457D'
  },
   inputnamePassword:{
    marginRight:240,
    marginBottom:10,
    color:'#44457D'
  }
});

export default LoginScreen;




