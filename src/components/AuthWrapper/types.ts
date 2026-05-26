export type AuthWrapperAction = "login" | "register" | "init";
export type OnChangeActionFn = (action: AuthWrapperAction) => void;
