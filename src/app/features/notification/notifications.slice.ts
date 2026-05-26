import type { Notification } from "@/app/types/notification";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NotificationsState {
  items: Notification[];
  counters: { unseen: number };
  connected: boolean;
}

const initialState: NotificationsState = {
  items: [],
  counters: { unseen: 0 },
  connected: false,
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },

    addNotification(state, action: PayloadAction<Notification>) {
      // дедупликация — сервер может прислать дважды
      const exists = state.items.some((n) => n.id === action.payload.id);
      if (!exists) state.items.unshift(action.payload);
    },

    updateNotification(state, action: PayloadAction<Notification>) {
      const idx = state.items.findIndex((n) => n.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },

    removeNotification(state, action: PayloadAction<{ id: string }>) {
      state.items = state.items.filter((n) => n.id !== action.payload.id);
    },

    setCounters(state, action: PayloadAction<{ unseen: number }>) {
      state.counters = { ...state.counters, ...action.payload };
    },

    markAllSeenOptimistic(state) {
      state.counters.unseen = 0;
      state.items = state.items.map((n) => ({ ...n, seen: true }));
    },
  },
});

export const {
  setConnected,
  addNotification,
  updateNotification,
  removeNotification,
  setCounters,
  markAllSeenOptimistic,
} = notificationsSlice.actions;

export const notificationsReducer = notificationsSlice.reducer;
