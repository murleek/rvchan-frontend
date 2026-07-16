import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthTokens } from "@/app/types/auth";
import { STORAGE_KEYS } from "@/constants";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { axiosInstance } from "./axios";
import type { AxiosRequestConfig, AxiosError, AxiosProgressEvent } from "axios";

let refreshPromise: Promise<string | null> | null = null;

const getAccessToken = () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

const emitAuthChange = () => {
  window.dispatchEvent(new CustomEvent("auth-storage-changed"));
};

const clearAuth = (redirect?: boolean) => {
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  emitAuthChange();
  if (redirect) {
    window.location.href = "/login";
  }
};

const setTokens = (tokens: AuthTokens) => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  emitAuthChange();
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 429) {
    return result;
  }

  if (result.error?.status !== 401) {
    return result;
  }

  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  if (!refreshToken) {
    clearAuth();
    return result;
  }

  // Если refresh уже идёт — ждём его
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const tokens = refreshResult.data as AuthTokens;
        setTokens(tokens);
        return tokens.accessToken;
      }

      clearAuth(true);
      return null;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  const newAccessToken = await refreshPromise;

  if (!newAccessToken) {
    return result;
  }

  // 🔁 Повтор исходного запроса уже с новым токеном
  return rawBaseQuery(args, api, extraOptions);
};

export const axiosBaseQuery: BaseQueryFn<
  Omit<AxiosRequestConfig, "onUploadProgress"> & {
    onUploadProgress?: (progress: number) => void;
  },
  unknown,
  unknown
> = async (config) => {
  try {
    const { onUploadProgress, ...rest } = config;

    const axiosConfig: AxiosRequestConfig = {
      ...rest,
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (!onUploadProgress || !event.total) return;

        const percent = Math.round((event.loaded * 100) / event.total);
        onUploadProgress(percent);
      },
    };

    const result = await axiosInstance(axiosConfig);

    return { data: result.data };
  } catch (err) {
    const error = err as AxiosError;

    return {
      error: {
        status: error.response?.status,
        data: error.response?.data,
      },
    };
  }
};
