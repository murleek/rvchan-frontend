export type AuthWrapperAction = "login" | "register" | "verify" | "init";
export type OnChangeActionFn = (
  action: AuthWrapperAction,
  payload?: object,
) => void;
