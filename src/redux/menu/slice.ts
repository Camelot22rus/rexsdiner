import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchMenuItems } from "../pizza/asyncActions";
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
    builder.addCase(fetchMenuItems.pending, (state, action) => {
      state.status = Status.LOADING;
      state.items = [];
    });

    builder.addCase(fetchMenuItems.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = Status.SUCCESS;
    });

    builder.addCase(fetchMenuItems.rejected, (state, action) => {
      state.status = Status.ERROR;
      state.items = [];
    });
  },
});

export const { setItems } = menuSlice.actions;

export default menuSlice.reducer;
