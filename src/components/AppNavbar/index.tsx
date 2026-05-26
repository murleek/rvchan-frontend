import { Bell, Plus, Search, UserCircle2 } from "lucide-react";
import useNav, { type TabKey } from "@/hooks/common/useNav";
import useAuth from "@/hooks/useAuth";
import { PAGES } from "@/constants";
import { Card } from "../ui/card";
import {
  memo,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
} from "react";

import { useDebounce } from "@uidotdev/usehooks";

type Trigger = {
  id: TabKey;
  label: string;
  icon: React.ElementType;
  url: string;
};

const NavbarButton = memo(
  ({
    trigger,
    active,
    onClick,
    buttonsRef,
  }: {
    trigger: Trigger;
    active: boolean;
    onClick: () => void;
    buttonsRef: React.RefObject<Record<TabKey, HTMLButtonElement>>;
  }) => {
    return (
      <button
        ref={(el) => {
          if (buttonsRef.current && el) {
            buttonsRef.current[trigger.id] = el;
          }
        }}
        onClick={onClick}
        className={`flex flex-col cursor-pointer items-center justify-center gap-0.5 px-3 py-1.5 z-10 font-extrabold transition-colors duration-200 ${
          active
            ? "text-sidebar-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <trigger.icon className="size-6" />
        <span className="text-[12px] tracking-tight">{trigger.label}</span>
      </button>
    );
  },
);

const AppNavbar = () => {
  const { profile } = useAuth();
  const { switchTab, activeTab, clearStack } = useNav();

  const buttonsRef = useRef<Record<TabKey, HTMLButtonElement>>(
    {} as Record<TabKey, HTMLButtonElement>,
  );

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

  const triggers = useMemo<Trigger[]>(
    () => [
      {
        id: "profile",
        label: "Профиль",
        icon: UserCircle2,
        url: PAGES.USER.replace(":username", profile?.username ?? ""),
      },
      {
        id: "notifications",
        label: "Уведомления",
        icon: Bell,
        url: PAGES.NOTIFICATIONS,
      },
      {
        id: "search",
        label: "Поиск",
        icon: Search,
        url: PAGES.SEARCH,
      },
    ],
    [profile?.username],
  );

  const handleClick = useCallback(
    (tab: TabKey, url: string) => {
      if (activeTab === tab) {
        clearStack(tab);
      } else {
        switchTab(tab, url);
      }
    },
    [activeTab, clearStack, switchTab],
  );

  // Обновляем позицию индикатора
  const updateIndicator = useCallback(() => {
    const activeButton = buttonsRef.current[activeTab];
    if (!activeButton) return;

    const rect = activeButton.getBoundingClientRect();
    const parentRect = activeButton.parentElement!.getBoundingClientRect();

    setIndicatorStyle({
      left: rect.left - parentRect.left - 6,
      width: rect.width + 10,
    });
  }, [activeTab]);

  // Дебонсируем обновление при ресайзе
  const debouncedUpdate = useDebounce(updateIndicator, 40);

  useLayoutEffect(() => {
    updateIndicator();
    window.addEventListener("resize", debouncedUpdate);

    return () => window.removeEventListener("resize", debouncedUpdate);
  }, [updateIndicator, debouncedUpdate]);

  if (!profile) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full md:hidden z-50 pointer-events-none pb-2 flex items-center justify-center gap-2">
      <Card className="z-2 overflow-hidden py-0.5 px-2 w-fit border-border! backdrop-blur-md bg-card/70 mb-safe rounded-full flex flex-row gap-0 pointer-events-auto">
        {triggers.map((trigger) => (
          <NavbarButton
            key={trigger.id}
            trigger={trigger}
            active={activeTab === trigger.id}
            onClick={() => handleClick(trigger.id, trigger.url)}
            buttonsRef={buttonsRef}
          />
        ))}

        <div
          className="absolute top-1/2 -translate-y-1/2 h-[calc(100%-6px)] rounded-full bg-black/5 dark:bg-white/10 transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      </Card>
      <button className="z-2 overflow-hidden py-0.5 px-2 border-border! backdrop-blur-md bg-card/70 rounded-full flex flex-none gap-0.2 size-15.5 border animated pointer-events-auto items-center justify-center active:scale-110 active:brightness-110 hover:bg-card/80 cursor-pointer">
        <Plus className="size-6 text-foreground" />
      </button>
      {/* <div className="md:rounded-t-xl mask-t-from-10% mask-t-to-80% bg-background fixed left-0 bottom-0 pointer-events-none z-1 w-full h-20 animated transition-colors" /> */}
      {/* <div className="md:rounded-t-xl backdrop-blur-xs mask-t-from-40% mask-t-to-100% fixed left-0 bottom-0 pointer-events-none z-1 w-full h-20" /> */}
    </nav>
  );
};

export default memo(AppNavbar);
