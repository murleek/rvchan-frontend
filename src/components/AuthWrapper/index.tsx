import { a, useSpring, useTransition } from "@react-spring/web";
import clsx from "clsx";
import { Suspense, useEffect, type FC } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import { Card } from "../ui/card";
import { useMeasure } from "@uidotdev/usehooks";
import type { AuthWrapperAction, OnChangeActionFn } from "./types";
import useAuth from "@/hooks/useAuth";
import { PAGES } from "@/constants";
import { Navigate } from "react-router";
import Init from "./components/Init";
import PageLoader from "../Common/PageLoader";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../Common/ThemeToggle";

type AuthWrapperProps = {
  action: AuthWrapperAction;
  className?: string;
  withBg?: boolean;
  onChangeAction?: OnChangeActionFn;
};

const colors: Record<AuthWrapperAction, string> = {
  login: "bg-cyan-200",
  register: "bg-amber-200",
  init: "bg-fuchsia-200",
};

const AuthWrapper: FC<AuthWrapperProps> = ({
  action,
  className,
  withBg,
  onChangeAction,
}) => {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const [ref, bounds] = useMeasure();
  const { t: tCommon } = useTranslation();
  // const ref = useRef(0);

  const heightSpring = useSpring({
    height: bounds.height || 0,
    config: { tension: 250, friction: 30 },
  });

  const t = useTransition(action, {
    from: {
      opacity: 0,
      x: 64 * (action === "login" ? -1 : 1),
      filter: "blur(10px)",
    },
    enter: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
    },
    leave: {
      opacity: 0,
      x: 64 * (action === "login" ? 1 : -1),
      filter: "blur(10px)",
    },
  });

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && profile) {
      if (profile.state === "INIT") {
        if (action !== "init") {
          onChangeAction?.("init");
        }
      } else {
        window.location.href = PAGES.ROOT;
      }
    } else if (action === "init") {
      onChangeAction?.("login");
    }
  }, [profile, isLoading, isAuthenticated, action, onChangeAction]);

  // if (isLoading) {
  //   return <PageLoader label={tCommon("loader.profile")} className="h-56!" />;
  // }

  if (profile && profile.state !== "INIT") {
    // window.location.href = PAGES.ROOT;
    return <Navigate to={PAGES.ROOT} replace />;
  }

  return (
    <div
      className={clsx(
        "xs:px-8 animated flex justify-end xs:justify-center h-dvh flex-col items-center gap-4 opacity-100 absolute top-0 left-0 w-full z-50",
        className,
      )}
    >
      {withBg && (
        <div
          className={clsx(
            "animated duration-500 absolute h-full w-full mask-[repeating-linear-gradient(65deg,#000f_0_3px,#000e_3px_12px)]",
            colors[action],
          )}
          id="auth"
        ></div>
      )}

      <a.div className="w-full max-w-lg" style={heightSpring}>
        <Card className="w-full max-md:border-0 border-t justify-center-safe h-full translate-0 overflow-hidden translate-y-0 p-0 duration-500 relative max-xs:rounded-b-none max-xs:rounded-t-4xl starting:translate-y-8 starting:opacity-0">
          {t((style, item) => (
            <a.div
              ref={item === action ? ref : undefined}
              className={clsx(
                "absolute w-full flex py-6 gap-6 flex-col",
                action === item ? "relative" : "pointer-events-none",
              )}
              style={style}
            >
              <Suspense
                fallback={
                  <PageLoader
                    label={tCommon("loader.init")}
                    className="h-56!"
                  />
                }
              >
                <ThemeToggle className="absolute top-4 right-4" />
                {item === "login" ? (
                  <Login onChangeAction={onChangeAction} />
                ) : item === "register" ? (
                  <Register onChangeAction={onChangeAction} />
                ) : (
                  <Init onChangeAction={onChangeAction} />
                )}
              </Suspense>
            </a.div>
          ))}
        </Card>
      </a.div>
    </div>
  );
};

export default AuthWrapper;
