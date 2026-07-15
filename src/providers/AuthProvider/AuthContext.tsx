import { createContext } from "react";
import type { AuthLogin, Profile } from "@/app/types/auth";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export type AuthError =
  | ({ redirect?: string } & (FetchBaseQueryError | SerializedError))
  | null;

export type LoginResult =
  | {
      success: true;
      data: Profile;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: FetchBaseQueryError | SerializedError;
    };

export interface AuthContextValue {
  isAuthenticated: boolean;
  accessToken: string | null;
  profile: Profile | null;
  isLoading: boolean;
  isLogoutLoading: boolean;
  error: AuthError;
  jwtPayload: Record<string, unknown> | null;
  login: (credentials: AuthLogin) => Promise<LoginResult>;
  logout: (isReload?: boolean) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
