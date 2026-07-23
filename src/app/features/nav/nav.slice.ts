import type { Profile } from "@/app/types/auth";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TabKey = "home" | "profile" | "notifications" | "search";
export const ModalKey = {
  POST: "post",
  INSTALL: "install",
} as const;

export type ModalKey = (typeof ModalKey)[keyof typeof ModalKey];

export type StackItem = {
  path: string;
  scroll: number;
};

type StackMap = Record<TabKey, StackItem[]>;

type NavState = {
  activeTab: TabKey;
  stacks: StackMap;
  scrollY: number;

  modals: Record<ModalKey, { isOpen: boolean; payload?: object | null }>;
};

export const detectTab = (path: string, user: Profile | null): TabKey => {
  if (path === "/") return "home";
  if (path.startsWith("/home")) return "home";
  if (path.startsWith("/notifications")) return "notifications";
  if (user && path.startsWith(`/${user.username}`)) return "profile";
  if (path.startsWith("/settings")) return "profile";
  return "search";
};

export const buildRoots = (
  profile: Profile | null,
): Record<TabKey, string> => ({
  home: "/home",
  profile: profile ? `/${profile.username}` : "/404",
  notifications: "/notifications",
  search: "/search",
});

export const makeInitialStacks = (
  roots: Record<TabKey, string>,
  currentPath: string,
  profile: Profile | null,
): { stacks: StackMap; tab: TabKey } => {
  const stacks: StackMap = {
    home: [{ path: roots.home, scroll: 0 }],
    profile: [{ path: roots.profile, scroll: 0 }],
    notifications: [{ path: roots.notifications, scroll: 0 }],
    search: [{ path: roots.search, scroll: 0 }],
  };

  let tab: TabKey = detectTab(currentPath, profile);

  if (!Object.values(roots).includes(currentPath) && currentPath !== "/") {
    tab =
      (Object.entries(roots).find(
        ([, root]) => root === currentPath,
      )?.[0] as TabKey) || tab;
    if (tab) stacks[tab].push({ path: currentPath, scroll: 0 });
  }

  return { stacks, tab };
};

const initialState: NavState = {
  activeTab: "search",
  stacks: {
    home: [{ path: "/home", scroll: 0 }],
    profile: [{ path: "/404", scroll: 0 }],
    notifications: [{ path: "/notifications", scroll: 0 }],
    search: [{ path: "/search", scroll: 0 }],
  },
  modals: {
    post: { isOpen: false },
    install: { isOpen: false },
  },
  scrollY: 0,
};

export const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    initNav(state, action: PayloadAction<{ stacks: StackMap; tab: TabKey }>) {
      state.stacks = action.payload.stacks;
      state.activeTab = action.payload.tab;
    },

    setScrollY(state, action: PayloadAction<{ tab: TabKey; scrollY: number }>) {
      const { scrollY } = action.payload;
      console.log("setScrollY", { tab: state.activeTab, scrollY });
      state.scrollY = scrollY;
    },

    pushPage(state, action: PayloadAction<{ path: string; scrollY?: number }>) {
      const { path } = action.payload;
      const stack = state.stacks[state.activeTab];
      const lastItem = stack.at(-1);
      if (lastItem) {
        if (lastItem.path === path) return;
        lastItem.scroll = state.scrollY;
      }
      state.scrollY = 0;
      stack.push({ path, scroll: 0 });
    },

    replacePage(
      state,
      action: PayloadAction<{ path: string; scrollY?: number }>,
    ) {
      const { path } = action.payload;
      const stack = state.stacks[state.activeTab];
      const lastItem = stack.at(-1);
      if (lastItem) {
        if (lastItem.path === path) return;
        lastItem.scroll = state.scrollY;
      }
      state.scrollY = 0;
      stack.splice(-1, 1, { path, scroll: 0 });
    },

    saveScrollForBack(state) {
      const stack = state.stacks[state.activeTab];
      const roots = buildRoots(null);
      if (stack.length > 1) {
        stack.splice(0, stack.length, ...stack.slice(0, -1));
        state.scrollY = stack.at(-1)?.scroll ?? 0;
      } else {
        state.stacks[state.activeTab] = [
          { path: roots[state.activeTab], scroll: 0 },
        ];
      }
    },

    switchTab(
      state,
      action: PayloadAction<{
        tab: TabKey;
        root: string;
        currentScrollY: number;
      }>,
    ) {
      const { tab, currentScrollY } = action.payload;
      const currentStack = state.stacks[state.activeTab];
      const lastItem = currentStack.at(-1);

      if (lastItem) {
        currentStack[currentStack.length - 1] = {
          ...lastItem,
          scroll: currentScrollY,
        };
      }

      state.activeTab = tab;
      state.scrollY = state.stacks[tab].at(-1)?.scroll ?? 0;
    },

    clearStack(state, action: PayloadAction<{ tab: TabKey; root: string }>) {
      const { tab, root } = action.payload;
      state.stacks[tab] = [{ path: root, scroll: 0 }];
    },

    setModalState(
      state,
      action: PayloadAction<{
        key: ModalKey;
        state: { isOpen?: boolean; payload?: object | null };
      }>,
    ) {
      const { key, state: modalState } = action.payload;
      const old = state.modals[key];
      state.modals[key] = { ...old, ...modalState };
    },
  },
});

export const {
  initNav,
  pushPage,
  replacePage,
  saveScrollForBack,
  switchTab,
  setScrollY,
  clearStack,
  setModalState,
} = navSlice.actions;

export const navReducer = navSlice.reducer;

export const selectActiveTab = (state: { nav: NavState }) =>
  state.nav.activeTab;
export const selectActiveStack = (state: { nav: NavState }) =>
  state.nav.stacks[state.nav.activeTab];
export const selectCanGoBack = (state: { nav: NavState }) =>
  state.nav.stacks[state.nav.activeTab].length > 1;
export const selectStacks = (state: { nav: NavState }) => state.nav.stacks;
export const selectScrollY = (state: { nav: NavState }) => state.nav.scrollY;
