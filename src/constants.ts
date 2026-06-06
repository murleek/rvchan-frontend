type ParamKeys<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ParamKeys<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type ParamsObject<T extends string> = {
  [K in ParamKeys<T>]: string;
};

export const PAGES = {
  LOGIN: "/login",
  LOGOUT: "/logout",
  REGISTER: "/register",
  VERIFY: "/verify",

  ROOT: "/",
  INIT: "/init",
  HOME: "/home",
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

type RouteParams<K extends keyof typeof PAGES> = ParamsObject<
  (typeof PAGES)[K]
>;

export const getPath = <K extends keyof typeof PAGES>(
  page: K,
  params?: RouteParams<K>,
): string => {
  let path = PAGES[page] as string;
  for (const [key, value] of Object.entries(params || {})) {
    path = path.replace(`:${key}`, value as string);
  }
  return path;
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
} as const;
