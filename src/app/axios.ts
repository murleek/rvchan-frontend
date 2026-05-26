import axios from "axios";
import { STORAGE_KEYS } from "@/constants";
import type { AuthTokens } from "@/app/types/auth";

let refreshPromise: Promise<string | null> | null = null;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = (async () => {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) return null;

        try {
          const { data } = await axios.post<AuthTokens>(
            import.meta.env.VITE_API_URL + "/auth/refresh",
            { refreshToken },
          );

          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

          return data.accessToken;
        } catch {
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;

    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return axiosInstance(originalRequest);
  },
);
