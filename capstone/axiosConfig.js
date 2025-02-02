// src/axiosConfig.js
import axios from 'axios';

// Create a custom axios instance
const axiosInstance = axios.create({
  baseURL: 'http://192.168.100.9:3000', // Your API base URL
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally, add request and response interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    // Add token if necessary (e.g., for authentication)
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = Bearer ${token};
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access!');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
