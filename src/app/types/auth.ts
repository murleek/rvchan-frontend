import type { UserState } from "./user";

export type AuthLogin = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthCode = {
  email: string;
  code: string;
};

export type Profile = {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  description: string | null;
  username: string;
  isPrivate: boolean;
  state: UserState;
  avatar?: string;
};

export type User = Profile & {
  isMine: boolean;
  isFollowing: boolean;
  isFollowed: boolean;
  followers: number;
  following: number;
  lastActiveAt: string | null;
};

export type ShortProfile = {
  id: number;
  username: string;
  firstName: string;
  lastName: string | null;
  avatar?: string;
};

export interface UserAgent {
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  deviceType: string | null;
  deviceVendor: string | null;
  deviceModel: string | null;
  raw: string | null;
}

export type Device = {
  id: string;
  ip: string;
  userAgent: UserAgent;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
};
