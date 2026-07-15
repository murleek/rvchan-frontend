import { type Middleware } from "@reduxjs/toolkit";
import { io, type Socket } from "socket.io-client";
import {
  addNotification,
  removeNotification,
  setConnected,
  setCounters,
  updateNotification,
} from "../features/notification/notifications.slice";
import { notificationsApi } from "../features/notification/notifications.api";
import { type Notification } from "../types/notification";
import { addToast } from "../features/toasts/toasts.slice";
import { userApi } from "../features/user/user.api";
import type { AppDispatch, RootState } from "../store";
import {
  actions,
  PING_INTERVAL_MS,
  isSocketAction,
  type SocketAction,
} from "./socket.types";
import { buildToast } from "./socket.toasts";
import { handlePostCreated, type PostCreatedData } from "./socket.handlers";

// Re-export for convenience (used by other modules importing from this path)
export {
  socketConnect,
  socketDisconnect,
  socketEmit,
  type SocketEvent,
} from "./socket.types";

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:3000";

export const socketMiddleware: Middleware = (store) => {
  let socket: Socket | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let isConnecting = false;
  const dispatch = store.dispatch as AppDispatch;

  function startPing() {
    pingTimer = setInterval(() => {
      if (socket?.connected) {
        socket.emit("ping");
        const profile = userApi.endpoints.me.select()(
          store.getState() as RootState,
        )?.data;

        if (!profile) return;

        dispatch(
          userApi.util.updateQueryData(
            "getUserByUsername",
            profile.username,
            (draft) => {
              draft.lastActiveAt = "now";
            },
          ),
        );
      }
    }, PING_INTERVAL_MS);
  }

  function stopPing() {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
  }

  function attach(token: string) {
    socket = io(WS_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socket.on("connect", () => {
      isConnecting = false;
      dispatch(setConnected(true));
      startPing();
    });

    socket.on("disconnect", (reason) => {
      dispatch(setConnected(false));
      stopPing();
      if (reason === "io server disconnect") {
        socket = null;
        isConnecting = false;
      }
    });

    socket.on("reconnect_failed", () => {
      console.error("[socket] reconnect_failed: exhausted all attempts");
      dispatch(setConnected(false));
      isConnecting = false;
      socket = null;
    });

    socket.on("connect_error", (err) => {
      console.warn("[socket] connect_error:", err.message);
    });

    socket.on(
      "notification:new",
      async (data: { notification: Notification; unseen: number }) => {
        dispatch(addNotification(data.notification));
        dispatch(setCounters({ unseen: data.unseen }));
        dispatch(
          notificationsApi.util.updateQueryData(
            "getNotifications",
            undefined,
            (draft) => {
              draft?.pages?.[0]?.notifications.data.unshift(data.notification);
            },
          ),
        );

        dispatch(addToast(await buildToast(data.notification)));
      },
    );

    socket.on("notification:update", (notification: Notification) => {
      dispatch(updateNotification(notification));
    });

    socket.on("notification:delete", (data: { id: string }) => {
      dispatch(removeNotification(data));
      dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
    });

    socket.on("notification:counters", (data: { unseen: number }) => {
      dispatch(setCounters(data));
      dispatch(
        notificationsApi.util.updateQueryData(
          "getNotifications",
          undefined,
          (draft) => {
            if (draft) {
              draft.pages.forEach((page) => {
                page.unseen = data.unseen;
              });
            }
          },
        ),
      );
    });

    socket.on("post:created", (data: PostCreatedData) => {
      handlePostCreated(dispatch, data);
    });
  }

  function detach() {
    stopPing();
    socket?.disconnect();
    socket = null;
    isConnecting = false;
    store.dispatch(setConnected(false));
  }

  return (next) => (unknownAction) => {
    const action = unknownAction as SocketAction;

    if (isSocketAction(action)) {
      switch (action.type) {
        case actions.SOCKET_CONNECT:
          if (!socket && !isConnecting) {
            isConnecting = true;
            attach(action.payload);
          }
          break;

        case actions.SOCKET_DISCONNECT:
          detach();
          break;

        case actions.SOCKET_EMIT:
          if (socket?.connected) {
            try {
              socket.emit(action.payload.event, action.payload.data);
            } catch (err) {
              console.error("[socket] emit error:", err);
            }
          }
          break;
      }
    }

    return next(unknownAction);
  };
};
