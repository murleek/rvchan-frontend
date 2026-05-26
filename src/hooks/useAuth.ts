import { useCallback } from "react";

import {
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
} from "@/app/features/auth/auth.api";

import type { AuthLogin, Profile } from "@/app/types/auth";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useMeQuery, userApi } from "@/app/features/user/user.api";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

export type AuthError =
  | ({ redirect?: string } & (FetchBaseQueryError | SerializedError))
  | null;

export type AuthReturn = {
  error: AuthError;
  isLoading: boolean;
  profile: Profile | null;
  login: (credentials: AuthLogin) => Promise<boolean | AuthError>;
  logout: () => void;
};

const useAuth = () => {
  const dispatch = useAppDispatch();
  const { accessToken, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  const jwtPayload = accessToken
    ? JSON.parse(atob(accessToken.split(".")[1]))
    : null;

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

  const logout = async (isReload?: boolean) => {
    await logoutMutation(isReload ?? true);
    dispatch(userApi.util.resetApiState());
  };

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

  return {
    login,
    updateProfile: refetchProfile,
    logout,
    refreshToken,
    profile: profileData ?? null,
    error: profileError ?? null,
    jwtPayload,
    isLoading,
    isLogoutLoading,
    isAuthenticated,
  };
};

export default useAuth;
