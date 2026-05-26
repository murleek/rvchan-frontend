import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type HeaderState = {
  title: string | null;
  hideTitle: boolean;
  isClickable: boolean;
};

const initialState: HeaderState = {
  title: null,
  hideTitle: false,
  isClickable: false,
};

const headerSlice = createSlice({
  name: "header",
  initialState,
  reducers: {
    setTitle(state, action: PayloadAction<string | null>) {
      state.title = action.payload;
    },
    setHideTitle(state, action: PayloadAction<boolean>) {
      state.hideTitle = action.payload;
    },
    setIsClickable(state, action: PayloadAction<boolean>) {
      state.isClickable = action.payload;
    },
  },
});

export const { setTitle, setHideTitle, setIsClickable } = headerSlice.actions;
export const headerReducer = headerSlice.reducer;
