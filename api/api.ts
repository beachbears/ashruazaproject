import axios from "axios"; // ✅ Import axios directly for error checking
import axiosInstance from "../utils/axiosInstance";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from "axios"; // ✅ Import AxiosError for proper error typing

// Helper function to handle API errors
const handleApiError = (error: unknown) => {
    const axiosError = error as AxiosError<{ message?: string }>; // ✅ Explicitly type response data
    
    if (axiosError.response) {
      console.error("API Error:", axiosError.response.data?.message || axiosError.message);
      throw new Error(axiosError.response.data?.message || "An error occurred");
    } else {
      console.error("Unexpected Error:", error);
      throw new Error("An unexpected error occurred");
    }
  };
  

// 🔹 LOGIN (POST request)
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post("/login", { email, password }); // 🔴 CHANGE ENDPOINT IF NEEDED
    const token = response.data.token;
    
    if (token) {
      await AsyncStorage.setItem("token", token); // 🔴 Ensure the backend returns a token
    } else {
      throw new Error("No token received from server");
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 GET USER DETAILS
export const fetchUserDetails = async () => {
  try {
    const response = await axiosInstance.get("/user-details"); // 🔴 CHANGE ENDPOINT IF NEEDED
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 UPDATE USER PROFILE
export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    const response = await axiosInstance.put(`/users/${userId}`, userData); // 🔴 CHANGE ENDPOINT IF NEEDED
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 DELETE USER ACCOUNT
export const deleteUserAccount = async (userId: string) => {
  try {
    const response = await axiosInstance.delete(`/users/${userId}`); // 🔴 CHANGE ENDPOINT IF NEEDED
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
