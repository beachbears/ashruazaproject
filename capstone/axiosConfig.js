import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your local IP address and port
const axiosInstance = axios.create({
  baseURL: 'http://192.168.202.224:8081',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;