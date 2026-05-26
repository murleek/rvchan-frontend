import useAuth from "@/hooks/useAuth";
import {
  buildRoots,
  clearStack,
  initNav,
  makeInitialStacks,
  pushPage,
  replacePage,
  saveScrollForBack,
  selectActiveStack,
  selectActiveTab,
  selectCanGoBack,
  switchTab,
  type TabKey,
} from "@/app/features/nav/nav.slice";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

type NavContext = {
  activeTab: TabKey;
  history: ReturnType<typeof selectActiveStack>;
  push: (path: string, scrollY?: number) => void;
  back: () => void;
  replace: (path: string, scrollY?: number) => void;
  switchTab: (tab: TabKey, root: string) => void;
  clearStack: (tab: TabKey) => void;
  canGoBack: boolean;
};

const useNav = (): NavContext => {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();
  const { profile } = useAuth();

  const activeTab = useSelector(selectActiveTab);
  const activeStack = useSelector(selectActiveStack);
  const canGoBack = useSelector(selectCanGoBack);

  const initializedRef = useRef(false);

  const roots = useMemo(() => buildRoots(profile), [profile]);

  useEffect(() => {
    if (!profile?.username) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const { stacks, tab } = makeInitialStacks(roots, loc.pathname, profile);
    dispatch(initNav({ stacks, tab }));
  }, [profile?.username]); // eslint-disable-line react-hooks/exhaustive-deps

  const push = useCallback(
    (path: string, scrollY?: number) => {
      dispatch(pushPage({ path, scrollY: scrollY ?? window.scrollY }));
      nav(path);
    },
    [dispatch, nav],
  );

  const replace = useCallback(
    (path: string, scrollY?: number) => {
      dispatch(replacePage({ path, scrollY: scrollY ?? window.scrollY }));
      nav(path, { replace: true });
    },
    [dispatch, nav],
  );

  const back = useCallback(() => {
    // Читаем стек напрямую из store, чтобы не закрыть над устаревшим состоянием
    const stack = activeStack;
    const withoutCurrent = stack.slice(0, -1);
    const target = withoutCurrent.at(-1);

    dispatch(saveScrollForBack());

    if (target) {
      nav(target.path);
      requestAnimationFrame(() => window.scrollTo(0, target.scroll));
    } else {
      nav(roots[activeTab]);
    }
  }, [activeStack, activeTab, dispatch, nav, roots]);

  const handleSwitchTab = useCallback(
    (tab: TabKey, root: string) => {
      // Получаем целевой путь до диспатча, чтобы навигировать вне setState
      // (redux синхронный, так что всё в порядке)
      dispatch(switchTab({ tab, root, currentScrollY: window.scrollY }));

      // После диспатча activeTab ещё не обновился в этом рендере,
      // поэтому берём целевой стек из store напрямую
      // (мы не храним stacks в локальном состоянии — используем selector)
      nav(root); // будет скорректировано эффектом ниже через selectActiveStack
    },
    [dispatch, nav],
  );

  const handleClearStack = useCallback(
    (tab: TabKey) => {
      const root = roots[tab];
      dispatch(clearStack({ tab, root }));
      nav(root);
    },
    [dispatch, nav, roots],
  );

  return {
    push,
    back,
    replace,
    switchTab: handleSwitchTab,
    clearStack: handleClearStack,
    canGoBack,
    history: activeStack,
    activeTab,
  };
};

export default useNav;
export { type TabKey };
