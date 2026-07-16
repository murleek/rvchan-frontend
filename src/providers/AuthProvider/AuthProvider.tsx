import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { useAppDispatch } from "@/app/hooks";
import {
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
} from "@/app/features/auth/auth.api";
import { useMeQuery, userApi } from "@/app/features/user/user.api";
import { STORAGE_KEYS } from "@/constants";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import type { AuthLogin, Profile } from "@/app/types/auth";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type AuthProviderProps = {
  children?: ReactNode;
};

const getAccessToken = () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [accessToken, setAccessTokenState] = useState<string | null>(
    getAccessToken,
  );

  // Синхронизация с localStorage через кастомное событие
  useEffect(() => {
    const handleStorageChange = () => {
      setAccessTokenState(getAccessToken());
    };

    window.addEventListener("auth-storage-changed", handleStorageChange);
    // На случай, если токен изменился в другой вкладке
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEYS.AUTH_TOKEN) {
        handleStorageChange();
      }
    });

    return () => {
      window.removeEventListener("auth-storage-changed", handleStorageChange);
    };
  }, []);

  const isAuthenticated = Boolean(accessToken);

  const jwtPayload = useMemo(
    () =>
      accessToken
        ? (JSON.parse(atob(accessToken.split(".")[1])) as Record<
            string,
            unknown
          >)
        : null,
    [accessToken],
  );

  const {
    isLoading,
    data: profileData,
    error: profileError,
    refetch: refetchProfile,
  } = useMeQuery(undefined, {
    skip: !accessToken,
  });

  const [loginMutation] = useLoginMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [refresh] = useRefreshMutation();

  const refreshToken = useCallback(async (): Promise<void> => {
    if (!profileData || !isAuthenticated) return;
    try {
      const result = await refresh();
      if ("error" in result && result.error) {
        console.error("Token refresh failed:", result.error);
      }
    } catch (error) {
      console.error("Token refresh error:", error);
    }
  }, [refresh, profileData, isAuthenticated]);

  const logout = useCallback(
    async (isReload?: boolean) => {
      await logoutMutation(isReload ?? true);
      dispatch(userApi.util.resetApiState());
    },
    [logoutMutation, dispatch],
  );

  const login = useCallback(
    async (
      credentials: AuthLogin,
    ): Promise<
      | {
          success: true;
          data: Profile;
          error?: never;
        }
      | {
          success: false;
          data?: never;
          error: FetchBaseQueryError | SerializedError;
        }
    > => {
      try {
        const result = await loginMutation(credentials);
        if ("error" in result && result.error)
          return { success: false, error: result.error };

        const profile = await refetchProfile();
        if ("error" in profile && profile.error)
          return { success: false, error: profile.error };

        if (!profile.data) {
          return {
            success: false,
            error: {
              name: "ProfileError",
              message: "Failed to load user profile after login.",
            },
          };
        }

        return { success: true, data: profile.data };
      } catch (error: unknown) {
        console.error("Login failed:", error);
        return {
          success: false,
          error: error as FetchBaseQueryError | SerializedError,
        };
      }
    },
    [loginMutation, refetchProfile],
  );

  const value: AuthContextValue = useMemo(
    () => ({
      isAuthenticated,
      accessToken,
      profile: profileData ?? null,
      isLoading,
      isLogoutLoading,
      error: profileError ?? null,
      jwtPayload,
      login,
      logout,
      refreshToken,
      updateProfile: refetchProfile,
    }),
    [
      isAuthenticated,
      accessToken,
      profileData,
      isLoading,
      isLogoutLoading,
      profileError,
      jwtPayload,
      login,
      logout,
      refreshToken,
      refetchProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
