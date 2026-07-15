import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/auth.slice";
import { authApi } from "./features/auth/auth.api";
import { userApi } from "./features/user/user.api";
import { relationshipApi } from "./features/relationship/relationship.api";
import { mediaApi } from "./features/media/media.api";
import { socketMiddleware } from "./ws/socket.middleware";
import { notificationsApi } from "./features/notification/notifications.api";
import { notificationsReducer } from "./features/notification/notifications.slice";
import { toastsReducer } from "./features/toasts/toasts.slice";
import { navReducer } from "./features/nav/nav.slice";
import { postsApi } from "./features/posts/posts.api";
import { headerReducer } from "./features/header/header.slice";
import { reactionApi } from "./features/reaction/reaction.api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    toasts: toastsReducer,
    nav: navReducer,
    header: headerReducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [postsApi.reducerPath]: postsApi.reducer,
    [relationshipApi.reducerPath]: relationshipApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [reactionApi.reducerPath]: reactionApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      authApi.middleware,
      userApi.middleware,
      postsApi.middleware,
      relationshipApi.middleware,
      notificationsApi.middleware,
      mediaApi.middleware,
      reactionApi.middleware,
      socketMiddleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
