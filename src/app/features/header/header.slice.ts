import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type HeaderState = {
  title: string | null;
  hideTitle: boolean;
  isClickable: boolean;
  hasClick: boolean;
};

const initialState: HeaderState = {
  title: null,
  hideTitle: false,
  isClickable: false,
  hasClick: false,
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
    setHasClick(state, action: PayloadAction<boolean>) {
      state.hasClick = action.payload;
    },
  },
});

export const { setTitle, setHideTitle, setIsClickable, setHasClick } =
  headerSlice.actions;
export const headerReducer = headerSlice.reducer;
