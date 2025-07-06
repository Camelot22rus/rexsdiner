import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ThemeSliceState {
  isDarkMode: boolean;
}

const initialState: ThemeSliceState = {
  isDarkMode: localStorage.getItem("darkMode") === "true" || false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem("darkMode", String(state.isDarkMode));
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      localStorage.setItem("darkMode", String(state.isDarkMode));
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
