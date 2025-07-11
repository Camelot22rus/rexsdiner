import { configureStore } from "@reduxjs/toolkit";
import filter from "./filter/slice";
import cart from "./cart/slice";
import pizza from "./pizza/slice";
import theme from "./theme/slice";
import orders from "./orders/slice";
import menu from "./menu/slice";
import { useDispatch } from "react-redux";

export const store = configureStore({
  reducer: {
    filter,
    cart,
    pizza,
    theme,
    orders,
    menu,
  },
});

export type RootState = ReturnType<typeof store.getState>;

type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
