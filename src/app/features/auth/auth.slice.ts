import { PAGES, STORAGE_KEYS } from "@/constants";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  isAuthenticated: Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload);
      state.isAuthenticated = true;
    },
    logout: (state, action: PayloadAction<boolean | undefined>) => {
      state.accessToken = null;
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      state.isAuthenticated = false;
      if (action.payload) {
        window.location.href = PAGES.LOGIN;
      }
    },
  },
});

export const { setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
