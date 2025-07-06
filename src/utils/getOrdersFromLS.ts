import { Order } from "../redux/orders/types";

const ORDERS_STORAGE_KEY = "rex-diner-orders";
const ORDER_COUNTER_KEY = "rex-diner-order-counter";

export const getOrdersFromLS = (): Order[] => {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn("Failed to load orders from localStorage:", error);
    return [];
  }
};

export const saveOrdersToLS = (orders: Order[]): void => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.warn("Failed to save orders to localStorage:", error);
  }
};

export const clearOrdersFromLS = (): void => {
  try {
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    localStorage.removeItem(ORDER_COUNTER_KEY);
  } catch (error) {
    console.warn("Failed to clear orders from localStorage:", error);
  }
};

export const getNextOrderNumber = (): number => {
  try {
    const counter = localStorage.getItem(ORDER_COUNTER_KEY);
    const nextNumber = counter ? parseInt(counter, 10) + 1 : 1;
    localStorage.setItem(ORDER_COUNTER_KEY, nextNumber.toString());
    return nextNumber;
  } catch (error) {
    console.warn("Failed to get next order number:", error);
    return Date.now(); // Fallback to timestamp
  }
};
