import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";
import useNav from "@/hooks/common/useNav";

const isSameBasePath = (a: string, b: string) => {
  return a.split("?")[0] === b.split("?")[0];
};

export const NavigationTracker = () => {
  const location = useLocation();
  const { push, replace, back } = useNav();
  const navigationType = useNavigationType();

  const lastFullPath = useRef<string | null>(null);

  useEffect(() => {
    const current = location.pathname + location.search;

    if (lastFullPath.current === current) return;

    const prev = lastFullPath.current;

    lastFullPath.current = current;

    if (navigationType === "POP" && prev !== null) {
      back();
      return;
    }

    if (prev && isSameBasePath(prev, current)) {
      replace(current, window.scrollY);
      return;
    }

    push(current, window.scrollY);
  }, [location.pathname, location.search, navigationType, back, push, replace]);

  return null;
};
