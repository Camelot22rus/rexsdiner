import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Order, OrderItem } from "./types";

const API_BASE_URL = "http://localhost:8080/api/v1";

export interface CreateOrderRequest {
  items: OrderItem[];
  totalPrice: number;
  totalCount: number;
  thirtyPercent: number;
  seventyPercent: number;
  userId?: number;
  usedIngredients?: Array<{ name: string; amount: number }>;
  notes?: string;
}

export const createOrder = createAsyncThunk<Order, CreateOrderRequest>(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/orders`,
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

export const fetchOrders = createAsyncThunk<Order[], { userId?: number }>(
  "orders/fetchOrders",
  async ({ userId }, { rejectWithValue }) => {
    try {
      let url = `${API_BASE_URL}/orders`;
      if (userId) {
        url += `?userId=${userId}`;
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
  { orderIds: string[]; userId?: number },
  { rejectValue: string }
>(
  "orders/markOrdersPaid",
  async ({ orderIds, userId }, { dispatch, rejectWithValue }) => {
    try {
      await axios.post(`${API_BASE_URL}/orders/mark-paid`, { orderIds });
      // Refetch orders after marking as paid
      await dispatch(fetchOrders({ userId }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to mark orders as paid";
      return rejectWithValue(message);
    }
  }
); 