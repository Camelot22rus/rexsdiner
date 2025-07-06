import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order, OrdersSliceState } from "./types";
import {
  getOrdersFromLS,
  saveOrdersToLS,
  clearOrdersFromLS,
} from "../../utils/getOrdersFromLS";

const initialState: OrdersSliceState = {
  orders: getOrdersFromLS(),
  isOrderHistoryOpen: false,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload); // Add new order at the beginning
      saveOrdersToLS(state.orders);
    },
    clearOrders: (state) => {
      state.orders = [];
      clearOrdersFromLS();
    },
    toggleOrderHistory: (state) => {
      state.isOrderHistoryOpen = !state.isOrderHistoryOpen;
    },
    setOrderHistoryOpen: (state, action: PayloadAction<boolean>) => {
      state.isOrderHistoryOpen = action.payload;
    },
  },
});

export const {
  addOrder,
  clearOrders,
  toggleOrderHistory,
  setOrderHistoryOpen,
} = ordersSlice.actions;

export default ordersSlice.reducer;
