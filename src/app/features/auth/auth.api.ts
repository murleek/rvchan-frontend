import { createApi } from "@reduxjs/toolkit/query/react";
import type { AuthLogin, AuthTokens, AuthCode } from "@/app/types/auth";
import { STORAGE_KEYS } from "@/constants";
import { baseQueryWithReauth } from "../../baseQuery";

const emitAuthChange = () => {
  window.dispatchEvent(new CustomEvent("auth-storage-changed"));
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Devices"],
  endpoints: (builder) => ({
    register: builder.mutation<{ message: string }, AuthCode>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    verify: builder.mutation<
      { ok: true; codeLength: number; ttl: number },
      AuthLogin
    >({
      query: (body) => ({
        url: "/auth/verify",
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
      async onQueryStarted(_, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
        emitAuthChange();
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
      async onQueryStarted(_, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
        emitAuthChange();
      },
    }),

    logout: builder.mutation<void, boolean | void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(isReload, { queryFulfilled }) {
        await queryFulfilled;
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        emitAuthChange();
        if (isReload ?? true) {
          window.location.href = "/login";
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApi;
