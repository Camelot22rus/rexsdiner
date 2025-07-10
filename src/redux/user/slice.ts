import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserSliceState } from "./types";
import { loginUser, logoutUser, loadUserFromStorage } from "./asyncActions";

const initialState: UserSliceState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle loadUserFromStorage
    builder.addCase(loadUserFromStorage.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadUserFromStorage.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    });
    builder.addCase(loadUserFromStorage.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Handle loginUser
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload as string;
    });

    // Handle logoutUser
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError, setUser } = userSlice.actions;
export default userSlice.reducer;
