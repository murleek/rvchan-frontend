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
import {
  NotificationType,
  type Notification,
  type ParsedUserAgent,
} from "../types/notification";
import {
  addToast,
  type Toast,
  type ToastIcon,
} from "../features/toasts/toasts.slice";
import i18n from "@/utils/i18n";
import { postsApi } from "../features/posts/posts.api";
import { userApi } from "../features/user/user.api";
import type { AppDispatch, RootState } from "../store";
import type { PublicPost } from "../types/post";

// ---------------------------------------------------------------------------
// Типизированные события
// ---------------------------------------------------------------------------

export type SocketEvent = "notification:seen" | "ping";

// Actions
const actions = {
  SOCKET_CONNECT: "socket/connect",
  SOCKET_DISCONNECT: "socket/disconnect",
  SOCKET_EMIT: "socket/emit",
} as const;
const PING_INTERVAL_MS = 30_000;

export const socketConnect = (token: string) => ({
  type: actions.SOCKET_CONNECT,
  payload: token,
});

export const socketDisconnect = () => ({
  type: actions.SOCKET_DISCONNECT,
});

export const socketEmit = (event: SocketEvent, data?: unknown) => ({
  type: actions.SOCKET_EMIT,
  payload: { event, data },
});

type SocketAction =
  | ReturnType<typeof socketConnect>
  | ReturnType<typeof socketDisconnect>
  | ReturnType<typeof socketEmit>;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:3000";

function isSocketAction(action: unknown): action is SocketAction {
  return (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    Object.values(actions).includes(
      (action as { type: SocketAction["type"] }).type,
    )
  );
}

async function buildToast(
  notification: Notification,
): Promise<Omit<Toast, "id">> {
  if (!i18n.hasLoadedNamespace("notification")) {
    await i18n.loadNamespaces("notification");
  }

  const t = (key: string, options?: Record<string, unknown>) =>
    i18n.t(key, { ns: "notification", ...options });

  switch (notification.type) {
    case NotificationType.FOLLOW: {
      const { actor } = notification;
      return {
        type: "info",
        // ✅ Отдельные ключи для title и description
        title: actor
          ? t("follow.title_known", {
              firstName: actor.firstName,
              lastName: actor.lastName,
            })
          : t("follow.unknown"),
        description: actor ? t("follow.known") : undefined,
        icon: {
          type: "image",
          cdn: actor?.avatar ?? "",
        } satisfies ToastIcon,
      };
    }

    case NotificationType.FOLLOW_ACCEPTED: {
      const { actor } = notification;
      return {
        type: "info",
        title: actor
          ? t("follow_accepted.title_known", {
              firstName: actor.firstName,
              lastName: actor.lastName,
            })
          : t("follow_accepted.unknown"),
        description: actor ? t("follow_accepted.known") : undefined,
        icon: {
          type: "image",
          cdn: actor?.avatar ?? "",
        } satisfies ToastIcon,
      };
    }

    case NotificationType.NEW_DEVICE: {
      const { device, ip } = notification.payload as {
        device: ParsedUserAgent;
        ip: string;
      };

      const vendorModel = [device.deviceVendor, device.deviceModel]
        .filter(Boolean)
        .join(" ");

      const isDesktop = device.deviceType === "desktop";

      return {
        type: "info",
        // ✅ Интерполяция через i18n, не конкатенация строк
        title: t(isDesktop ? "device.new_pc" : "device.new_device", {
          vendorModel: vendorModel || t("device.unknown_device"),
          os: device.os || t("device.unknown_os"),
          osVersion: device.osVersion ?? "",
        }),
        description: t("device.description", {
          browser: device.browser || t("device.unknown_browser"),
          browserVersion: device.browserVersion ?? "",
          ip: ip || t("device.unknown_ip"),
        }),
        icon: {
          type: "icon",
          name: "smartphone",
          className: "text-blue-700",
        } satisfies ToastIcon,
      };
    }

    case NotificationType.POST_MENTION: {
      const { actor } = notification;
      return {
        type: "info",
        title: actor
          ? t("post_mention.title_known", {
              firstName: actor.firstName,
              lastName: actor.lastName,
            })
          : t("post_mention.unknown"),
        description: actor ? t("post_mention.known") : undefined,
        icon: {
          type: "image",
          cdn: actor?.avatar ?? "",
        } satisfies ToastIcon,
      };
    }

    case NotificationType.POST_REPLY: {
      const { actor } = notification;
      return {
        type: "info",
        title: actor
          ? t("post_reply.title_known", {
              firstName: actor.firstName,
              lastName: actor.lastName,
            })
          : t("post_reply.unknown"),
        description: actor ? t("post_reply.known") : undefined,
        icon: {
          type: "image",
          cdn: actor?.avatar ?? "",
        } satisfies ToastIcon,
      };
    }

    case NotificationType.POST_REPLY_TO_OTHER: {
      const { actor } = notification;
      return {
        type: "info",
        title: actor
          ? t("post_reply_to_other.title_known", {
              firstName: actor.firstName,
              lastName: actor.lastName,
            })
          : t("post_reply_to_other.unknown"),
        description: actor ? t("post_reply_to_other.known") : undefined,
        icon: {
          type: "image",
          cdn: actor?.avatar ?? "",
        } satisfies ToastIcon,
      };
    }

    default:
      return { type: "info", title: t("notification.new") };
  }
}

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
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
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
        // dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
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
              draft.pages.map((page) => {
                page.unseen = data.unseen;
              });
            }
          },
        ),
      );
    });

    socket.on(
      "post:created",
      (data: {
        post: PublicPost & { parent: { username: string; id: string } };
        jobId: string;
      }) => {
        const jobId = `job:${data.jobId}`;

        console.log(data.post);

        const updatePages = (pages: { data: PublicPost[] }[]) => {
          const pageIndex = pages.findIndex((page) =>
            page.data.some((post) => post.id === jobId),
          );

          if (pageIndex === -1) {
            pages[0]?.data.unshift(data.post);
            return;
          }

          const postIndex = pages[pageIndex].data.findIndex(
            (post) => post.id === jobId,
          );

          if (postIndex !== -1) {
            pages[pageIndex].data[postIndex] = data.post;
          } else {
            pages[pageIndex].data.unshift(data.post);
          }
        };

        if (data.post.parent) {
          console.log("Updating getPost cache for", {
            username: data.post.parent.username,
            threadId: String(data.post.parent.id),
          });
          dispatch(
            postsApi.util.updateQueryData(
              "getPost",
              {
                username: data.post.parent.username,
                threadId: String(data.post.parent.id),
              },
              (draft) => {
                try {
                  draft.pages?.forEach((page) => {
                    page.replyCount += 1;
                    page.parents?.forEach((parent) => {
                      parent.replyCount += 1;
                    });
                    page.replies.data.forEach((reply, index) => {
                      if (reply.id === jobId) {
                        page.replies.data[index] = data.post;
                      }
                    });
                  });
                } catch (error) {
                  console.error("Error updating getPost cache:", error);
                }
              },
            ),
          );
        } else {
          dispatch(
            postsApi.util.updateQueryData(
              "getUserThreads",
              { username: data.post.user.username },
              (draft) => {
                const pages = draft?.pages;
                console.log("getUserThreads", pages);
                if (!pages) return;
                updatePages(pages);
              },
            ),
          );
        }
      },
    );
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
            socket.emit(action.payload.event, action.payload.data);
          }
          break;
      }
    }

    return next(unknownAction);
  };
};
