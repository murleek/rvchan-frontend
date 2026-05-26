import { createApi } from "@reduxjs/toolkit/query/react";
import { setAccessToken, logout } from "./auth.slice";
import type { AuthLogin, AuthTokens } from "@/app/types/auth";
import { STORAGE_KEYS } from "@/constants";
import { baseQueryWithReauth } from "../../baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Devices"],
  endpoints: (builder) => ({
    register: builder.mutation<{ message: string }, AuthLogin>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<AuthTokens, AuthLogin>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        const { data } = await queryFulfilled;
        dispatch(setAccessToken(data.accessToken));
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      },
    }),
    refresh: builder.mutation<AuthTokens, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
        body: {
          refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        },
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        const { data } = await queryFulfilled;
        dispatch(setAccessToken(data.accessToken));
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      },
    }),

    logout: builder.mutation<void, boolean | void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(isReload, { queryFulfilled, dispatch }) {
        await queryFulfilled;
        dispatch(logout(isReload ?? true));
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApi;
