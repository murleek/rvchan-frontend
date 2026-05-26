import type { Profile } from "@/app/types/auth";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TabKey = "profile" | "notifications" | "search";

export type StackItem = {
  path: string;
  scroll: number;
};

type StackMap = Record<TabKey, StackItem[]>;

type NavState = {
  activeTab: TabKey;
  stacks: StackMap;
};

export const detectTab = (path: string, user: Profile | null): TabKey => {
  if (path === "/") return "profile";
  if (path.startsWith("/notifications")) return "notifications";
  if (user && path.startsWith(`/${user.username}`)) return "profile";
  if (path.startsWith("/settings")) return "profile";
  return "search";
};

export const buildRoots = (
  profile: Profile | null,
): Record<TabKey, string> => ({
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
    profile: [{ path: "/404", scroll: 0 }],
    notifications: [{ path: "/notifications", scroll: 0 }],
    search: [{ path: "/search", scroll: 0 }],
  },
};

export const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    initNav(state, action: PayloadAction<{ stacks: StackMap; tab: TabKey }>) {
      state.stacks = action.payload.stacks;
      state.activeTab = action.payload.tab;
    },

    pushPage(state, action: PayloadAction<{ path: string; scrollY: number }>) {
      const { path, scrollY } = action.payload;
      const stack = state.stacks[state.activeTab];
      if (stack.at(-1)?.path === path) return;
      stack.push({ path, scroll: scrollY });
    },

    replacePage(
      state,
      action: PayloadAction<{ path: string; scrollY: number }>,
    ) {
      const { path, scrollY } = action.payload;
      const stack = state.stacks[state.activeTab];
      if (stack.at(-1)?.path === path) return;
      stack.splice(-1, 1, { path, scroll: scrollY });
    },

    saveScrollForBack(state) {
      const stack = state.stacks[state.activeTab];
      const roots = buildRoots(null);
      if (stack.length > 1) {
        stack.splice(0, stack.length, ...stack.slice(0, -1));
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
    },

    clearStack(state, action: PayloadAction<{ tab: TabKey; root: string }>) {
      const { tab, root } = action.payload;
      state.stacks[tab] = [{ path: root, scroll: 0 }];
    },
  },
});

export const {
  initNav,
  pushPage,
  replacePage,
  saveScrollForBack,
  switchTab,
  clearStack,
} = navSlice.actions;
export const navReducer = navSlice.reducer;

export const selectActiveTab = (state: { nav: NavState }) =>
  state.nav.activeTab;
export const selectActiveStack = (state: { nav: NavState }) =>
  state.nav.stacks[state.nav.activeTab];
export const selectCanGoBack = (state: { nav: NavState }) =>
  state.nav.stacks[state.nav.activeTab].length > 1;
export const selectStacks = (state: { nav: NavState }) => state.nav.stacks;
