import { RootState } from "../store";

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectIsOrderHistoryOpen = (state: RootState) =>
  state.orders.isOrderHistoryOpen;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectCreateOrderLoading = (state: RootState) => state.orders.createOrderLoading;
export const selectCreateOrderError = (state: RootState) => state.orders.createOrderError;
