import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchMenuItemsFromAPI } from "../pizza/asyncActions";
import { MenuItem, MenuSliceState, Status } from "../pizza/types";

const initialState: MenuSliceState = {
  items: [],
  status: Status.LOADING,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<MenuItem[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMenuItemsFromAPI.pending, (state, action) => {
      state.status = Status.LOADING;
      state.items = [];
    });

    builder.addCase(fetchMenuItemsFromAPI.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = Status.SUCCESS;
    });

    builder.addCase(fetchMenuItemsFromAPI.rejected, (state, action) => {
      state.status = Status.ERROR;
      state.items = [];
    });
  },
});

export const { setItems } = menuSlice.actions;

export default menuSlice.reducer;
