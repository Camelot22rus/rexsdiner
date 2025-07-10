import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { User, UserLoginRequest, UserLoginResponse } from "./types";

const API_BASE_URL = "http://localhost:8080/api/v1";

// Async action for user login
export const loginUser = createAsyncThunk<User, UserLoginRequest>(
  "user/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<UserLoginResponse>(
        `${API_BASE_URL}/auth/login`,
        loginData
      );

      if (data.status === "success" && data.data) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.data));
        return data.data;
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
        return JSON.parse(userString);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    return null;
  }
);
