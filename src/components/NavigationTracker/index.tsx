import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import useNav from "@/hooks/common/useNav";

const isSameBasePath = (a: string, b: string) => {
  return a.split("?")[0] === b.split("?")[0];
};

export const NavigationTracker = () => {
  const location = useLocation();
  const { push, replace } = useNav();

  const lastFullPath = useRef<string | null>(null);

  useEffect(() => {
    const current = location.pathname + location.search;

    if (lastFullPath.current === current) return;

    const prev = lastFullPath.current;

    lastFullPath.current = current;

    // 🔥 если это тот же route, но изменился query → replace
    if (prev && isSameBasePath(prev, current)) {
      replace(current, window.scrollY);
      return;
    }

    // 🚀 иначе это новая страница
    push(current, window.scrollY);
  }, [location.pathname, location.search, push, replace]);

  return null;
};
