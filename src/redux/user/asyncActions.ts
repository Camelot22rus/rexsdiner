import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { User, UserLoginRequest, UserLoginResponse } from "./types";
import { API_BASE_URL, DEFAULT_BUSINESS_ID } from "../../config";

// Async action for user login
export const loginUser = createAsyncThunk<User, UserLoginRequest>(
  "user/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      // Use business-specific endpoint if businessId is provided
      const endpoint = loginData.businessId 
        ? `/auth/login?business=${loginData.businessId}`
        : "/auth/login";
        
      const { data } = await axios.post<UserLoginResponse>(
        `${API_BASE_URL}${endpoint}`,
        loginData
      );

      if (data.status === "success" && data.data) {
        // Store user data with business info
        const userWithBusiness = {
          ...data.data,
          businessId: loginData.businessId || DEFAULT_BUSINESS_ID
        };
        localStorage.setItem("user", JSON.stringify(userWithBusiness));
        
        // Update current business in localStorage
        const businessId = loginData.businessId || DEFAULT_BUSINESS_ID;
        localStorage.setItem("currentBusiness", businessId);
        
        return userWithBusiness;
      } else {
        return rejectWithValue(data.message || "Login failed");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

// Async action for logout
export const logoutUser = createAsyncThunk<void, void>(
  "user/logoutUser",
  async () => {
    // Remove user data from localStorage
    localStorage.removeItem("user");
  }
);

// Load user from localStorage on app initialization
export const loadUserFromStorage = createAsyncThunk<User | null, void>(
  "user/loadUserFromStorage",
  async () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        // Update current business from user's business info
        if (user.businessId) {
          localStorage.setItem("currentBusiness", user.businessId);
        }
        return user;
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    return null;
  }
);
