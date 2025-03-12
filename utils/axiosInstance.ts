import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosInstance = axios.create({
  baseURL: "https://comgu20-production.up.railway.app", // 🔴 CHANGE THIS TO YOUR API BASE URL
  headers: { "Content-Type": "application/json" },
});

// Add Authorization Token Automatically
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token"); // 🔴 Ensure you store 'token' correctly
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
