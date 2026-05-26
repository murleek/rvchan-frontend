export const PAGES = {
  LOGIN: "/login",
  LOGOUT: "/logout",
  REGISTER: "/register",
  ROOT: "/",
  INIT: "/init",
  USER: "/:username",
  USER_FOLLOWERS: "/:username/followers",
  USER_FOLLOWING: "/:username/following",
  POST: "/:username/post/:id",
  SETTINGS: "/settings",
  SETTINGS_PROFILE: "/settings/profile",
  SETTINGS_DEVICES: "/settings/devices",
  SETTINGS_APPEARANCE: "/settings/appearance",
  SETTINGS_LANGUAGE: "/settings/language",
  SEARCH: "/search",
  NOTIFICATIONS: "/notifications",
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
} as const;
