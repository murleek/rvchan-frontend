export const UserState = {
  INIT: "INIT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
} as const;

export type UserState = keyof typeof UserState;

export type ShortPublicUser = {
  id: number;
  username: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
};

export type PublicUser = ShortPublicUser & {
  description?: string;
  isPrivate: boolean;
  state: UserState;
};
