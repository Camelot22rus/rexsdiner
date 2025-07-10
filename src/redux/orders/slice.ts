import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order, OrdersSliceState } from "./types";
import { createOrder, fetchOrders } from "./asyncActions";

const initialState: OrdersSliceState = {
  orders: [],
  isOrderHistoryOpen: false,
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
    },
    toggleOrderHistory: (state) => {
      state.isOrderHistoryOpen = !state.isOrderHistoryOpen;
    },
    setOrderHistoryOpen: (state, action: PayloadAction<boolean>) => {
      state.isOrderHistoryOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.fulfilled, (state, action) => {
      if (action.payload) {
        state.orders.unshift(action.payload);
      }
    });
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.orders = action.payload || [];
      state.loading = false;
      state.error = null;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error?.message || 'Failed to fetch orders';
    });
  },
});

export const {
  clearOrders,
  toggleOrderHistory,
  setOrderHistoryOpen,
} = ordersSlice.actions;

export default ordersSlice.reducer;
