import {
  createSlice,
  createAction,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastIcon =
  | {
      type: "image";
      cdn: string;
    }
  | {
      type: "icon";
      name: string;
      className?: string;
    };

export interface Toast {
  id: string;
  type: ToastType;
  icon?: ToastIcon;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastsState {
  items: Toast[];
}

export const addToast = createAction(
  "toasts/add",
  (payload: Omit<Toast, "id">) => ({
    payload: { ...payload, id: nanoid() },
  }),
);

const toastsSlice = createSlice({
  name: "toasts",
  initialState: { items: [] } as ToastsState,
  reducers: {
    removeToast(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addToast, (state, action) => {
      state.items.unshift(action.payload);
      state.items = state.items.slice(0, 3);
    });
  },
});

export const { removeToast } = toastsSlice.actions;
export const toastsReducer = toastsSlice.reducer;
export const selectToasts = (state: { toasts: ToastsState }) =>
  state.toasts.items;
