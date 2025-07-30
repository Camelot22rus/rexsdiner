import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Order, OrderItem } from "./types";
import { API_BASE_URL, DEFAULT_BUSINESS_ID } from "../../config";

export interface CreateOrderRequest {
  items: OrderItem[];
  totalPrice: number;
  totalCount: number;
  thirtyPercent: number;
  seventyPercent: number;
  userId?: number;
  usedIngredients?: Array<{ name: string; amount: number }>;
  notes?: string;
  businessId?: string; // Add business ID for multi-business support
}

export const createOrder = createAsyncThunk<Order, CreateOrderRequest>(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      // Get current business from localStorage or use default
      const currentBusiness = orderData.businessId || localStorage.getItem("currentBusiness") || DEFAULT_BUSINESS_ID;
      
      const { data } = await axios.post(
        `${API_BASE_URL}/orders?business=${currentBusiness}`,
        orderData
      );
      if (data.status === "success" && data.data) {
        return data.data;
      } else {
        return rejectWithValue(data.message || "Order creation failed");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Order creation failed";
      return rejectWithValue(message);
    }
  }
);

export const fetchOrders = createAsyncThunk<Order[], { userId?: number; businessId?: string }>(
  "orders/fetchOrders",
  async ({ userId, businessId }, { rejectWithValue }) => {
    try {
      // Get current business from localStorage or use default
      const currentBusiness = businessId || localStorage.getItem("currentBusiness") || DEFAULT_BUSINESS_ID;
      
      let url = `${API_BASE_URL}/orders?business=${currentBusiness}`;
      if (userId) {
        url += `&userId=${userId}`;
      }
      const { data } = await axios.get(url);
      if (data.status === "success" && data.data) {
        return data.data;
      } else {
        return rejectWithValue(data.message || "Failed to fetch orders");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch orders";
      return rejectWithValue(message);
    }
  }
);

export const markOrdersPaid = createAsyncThunk<
  void,
  { orderIds: string[]; userId?: number; businessId?: string },
  { rejectValue: string }
>(
  "orders/markOrdersPaid",
  async ({ orderIds, userId, businessId }, { dispatch, rejectWithValue }) => {
    try {
      // Get current business from localStorage or use default
      const currentBusiness = businessId || localStorage.getItem("currentBusiness") || DEFAULT_BUSINESS_ID;
      
      await axios.post(`${API_BASE_URL}/orders/mark-paid?business=${currentBusiness}`, { orderIds });
      // Refetch orders after marking as paid
      await dispatch(fetchOrders({ userId, businessId: currentBusiness }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to mark orders as paid";
      return rejectWithValue(message);
    }
  }
); 