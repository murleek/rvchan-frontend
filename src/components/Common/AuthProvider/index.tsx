import { useEffect, useState, type FC, type ReactNode } from "react";

import useAuth from "@/hooks/useAuth";
import PageLoader from "@/components/Common/PageLoader";

import { STORAGE_KEYS } from "@/constants";
import { useTranslation } from "react-i18next";
import AuthWrapper from "@/components/AuthWrapper";
import type { AuthWrapperAction } from "@/components/AuthWrapper/types";
import ErrorView from "../ErrorView";
import { UserState } from "@/app/types/user";

type AuthProviderProps = {
  children?: ReactNode;
};

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [action, setAction] = useState<AuthWrapperAction>("login");
  const [payload, setPayload] = useState<object>();

  const onChangeAction = (action: AuthWrapperAction, payload?: object) => {
    setAction(action);
    setPayload(payload);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "z") {
        event.preventDefault(); // чтобы избежать конфликтов с браузером
        auth.refreshToken();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    console.log(auth.isLoading);
  }, [auth.isLoading]);

  if (auth.error) {
    // return <Navigate to={PAGES.LOGIN} replace state={auth.error} />;
    if ("status" in auth.error && typeof auth.error.status === "number") {
      if (auth.error?.status === 429) {
        return <ErrorView t="rateLimit" errorCode="429 Too Many Requests" />;
      }

      return (
        <>
          {children}
          <AuthWrapper
            action={action}
            className="bg-black/20"
            onChangeAction={onChangeAction}
            payload={payload}
          />
        </>
      );
    } else {
      return (
        <span className="flex h-full flex-col items-center justify-center gap-6">
          <div className="flex flex-col gap-1 items-center">
            <div className="animated ml-4 text-3xl font-extrabold text-destructive">
              {t("errorBoundary.profile.title")}
            </div>
            <div className="animated ml-4 text-destructive">
              {t("errorBoundary.profile.message")}
            </div>

            <code className="animated rounded bg-destructive/10 dark:bg-destructive/20 px-2 py-1 font-bold text-sm text-destructive">
              {"status" in auth.error
                ? auth.error.status
                : t("errorBoundary.profile.unknownError")}
            </code>
          </div>
        </span>
      );
    }
  }

  if (
    (!auth.profile || auth.profile.state === UserState.INIT) &&
    !auth.isLoading
  ) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    return (
      <>
        {children}
        <AuthWrapper
          action={action}
          className="bg-black/20"
          onChangeAction={onChangeAction}
          payload={payload}
        />
      </>
    );
  }

  if (auth.isLoading) {
    return <PageLoader label={t("loader.profile")} />;
  }

  return children;
};

export default AuthProvider;
