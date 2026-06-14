import {
  Bell,
  HomeIcon,
  Plus,
  ReplyIcon,
  Search,
  UserCircle2,
} from "lucide-react";
import useNav, { type TabKey } from "@/hooks/common/useNav";
import useAuth from "@/hooks/useAuth";
import { PAGES } from "@/constants";
import {
  memo,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
} from "react";

import { useDebounce } from "@uidotdev/usehooks";
import { useTranslation } from "react-i18next";
import useModal from "@/hooks/common/useModal";
import type { PostFormModalDetails } from "../Common/PostFormModal";
import clsx from "clsx";
import useNotifications from "@/hooks/common/useNotifications";
import { GlassElement } from "../LiquidGlass";

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
    const { unseen } = useNotifications();
    return (
      <button
        ref={(el) => {
          if (buttonsRef.current && el) {
            buttonsRef.current[trigger.id] = el;
          }
        }}
        onClick={onClick}
        className={`flex flex-col cursor-pointer items-center justify-center gap-0.5 px-2 py-1.5 z-10 font-extrabold transition-colors duration-200 ${
          active
            ? "text-sidebar-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <div className="relative">
          <trigger.icon className="size-6 stroke-3" />
          {trigger.id === "notifications" && unseen > 0 && (
            <span className="absolute -top-1.5 left-3.25 px-0.75 py-px rounded-full bg-primary ring-2 font-black text-white text-[12px]/[12px] tabular-nums">
              {unseen > 99 ? "∞" : unseen}
            </span>
          )}
        </div>
        <span className="text-[12px] tracking-tight font-black">
          {trigger.label}
        </span>
      </button>
    );
  },
);

const AppNavbar = () => {
  const { profile } = useAuth();
  const { switchTab, activeTab, clearStack } = useNav();
  const { t } = useTranslation("sidebar");
  const { openModal, payload } = useModal<PostFormModalDetails>("post");
  const navRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  const buttonsRef = useRef<Record<TabKey, HTMLButtonElement>>(
    {} as Record<TabKey, HTMLButtonElement>,
  );

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });
  // const [liquidIndicatorStyle, setLiquidIndicatorStyle] = useState({
  //   left: 0,
  //   width: 0,
  //   height: 0,
  //   top: 0,
  // });

  const triggers = useMemo<Trigger[]>(
    () => [
      {
        id: "home",
        label: t("navbar.home"),
        icon: HomeIcon,
        url: PAGES.HOME,
      },
      {
        id: "notifications",
        label: t("navbar.notifications"),
        icon: Bell,
        url: PAGES.NOTIFICATIONS,
      },
      {
        id: "search",
        label: t("navbar.search"),
        icon: Search,
        url: PAGES.SEARCH,
      },
      {
        id: "profile",
        label: t("navbar.profile"),
        icon: UserCircle2,
        url: PAGES.USER.replace(":username", profile?.username ?? ""),
      },
    ],
    [profile?.username, t],
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
    const indicator = indicatorRef.current;
    if (!indicator) return;

    const rect = activeButton.getBoundingClientRect();
    const parentRect = activeButton.parentElement!.getBoundingClientRect();

    // setLiquidIndicatorStyle({
    //   left: rect.left - 6,
    //   width: rect.width + 10,
    //   height: rect.height - 6,
    //   top: rect.top - parentRect.top + rect.height / 2,
    // });
    indicator.style.width = `${rect.width + 10}px`;
    indicator.style.left = `${rect.left - parentRect.left - 6}px`;
    indicator.style.top = `${rect.top - parentRect.top + rect.height / 2}px`;
    indicator.style.height = `${rect.height - 6}px`;

    setIndicatorStyle({
      left: rect.left - parentRect.left - 6,
      width: rect.width + 10,
    });
  }, [activeTab]);

  // Дебонсируем обновление при ресайзе
  const debouncedUpdate = useDebounce(updateIndicator, 40);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;

    if (!nav) return;
    if (!indicator) return;

    let isDragging = false;

    const moveIndicator = (e) => {
      const rect = nav.getBoundingClientRect();
      // setLiquidIndicatorStyle({
      //   ...liquidIndicatorStyle,
      //   left: e.clientX - liquidIndicatorStyle.width / 2,
      // });
      const left = e.clientX - indicator.offsetWidth / 2;
      console.log(left, rect.left, rect.width);
      indicator.style.left = `${Math.max(rect.left, Math.min(left + 6, rect.left / 2 + rect.width))}px`;
    };

    const down = (e) => {
      isDragging = true;
      moveIndicator(e);
    };

    const move = (e) => {
      requestAnimationFrame(() => {
        if (isDragging) moveIndicator(e);
      });
    };

    const up = () => {
      isDragging = false;
    };

    updateIndicator();

    nav.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    window.addEventListener("resize", debouncedUpdate);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      nav.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [navRef, updateIndicator, debouncedUpdate, activeTab]);

  if (!profile) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full md:hidden z-50 pointer-events-none pb-2 px-3 flex items-center justify-center gap-2">
      <GlassElement
        ref={navRef}
        radius={31}
        depth={3}
        blur={1}
        chromaticAberration={1}
        name="app-navbar"
        wrapClassName="peer/navbar"
        className="z-2 bg-card/50 border py-0.5 px-2 w-fit border-border! mb-safe rounded-full flex flex-row gap-0 pointer-events-auto"
      >
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
          className="pointer-events-none absolute inset-0 z-0 rounded-full h-[calc(100%-6px)] bg-black/12 top-1/2 -translate-y-1/2 transition-all duration-300 ease-out peer-active/navbar:opacity-0"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      </GlassElement>
      <GlassElement
        radius={28}
        depth={2}
        blur={0}
        chromaticAberration={1}
        name="app-navbar-indicator"
        wrapClassName="absolute top-1/2 opacity-0 peer-active/navbar:opacity-100 peer-active/navbar:scale-x-120 peer-active/navbar:scale-y-150 -translate-y-1/2 h-[calc(100%-6px)] rounded-full transition-[opacity,transform]! duration-300 ease-out inset-shadow-none! bg-white/0 w-full z-200"
        className="w-full h-full"
        style={
          {
            "--active-scale": 1.25,
          } as React.CSSProperties & { "--active-scale": number }
        }
        ref={indicatorRef}
      />
      <GlassElement
        radius={31}
        depth={2}
        blur={2}
        chromaticAberration={8}
        name="app-navbar-button"
      >
        <button
          className="z-2 overflow-hidden py-0.5 px-2 border-border! bg-liquid-glass bg-card/50 rounded-full flex flex-none gap-0.2 size-15.5 border animated pointer-events-auto items-center justify-center active:scale-110 active:brightness-110 hover:bg-card/80 cursor-pointer"
          onClick={() => openModal()}
        >
          <ReplyIcon
            className={clsx(
              "size-6 stroke-3 absolute opacity-0 animated blur-sm",
              payload?.isReplyingToThread && "opacity-100 blur-none!",
            )}
          />
          <Plus
            className={clsx(
              "size-6 stroke-3 absolute opacity-0 animated blur-sm",
              !payload?.isReplyingToThread && "opacity-100 blur-none!",
            )}
          />
        </button>
      </GlassElement>
      {/* <div className="md:rounded-t-xl mask-t-from-10% mask-t-to-80% bg-background fixed left-0 bottom-0 pointer-events-none z-1 w-full h-20 animated transition-colors" /> */}
      {/* <div className="md:rounded-t-xl backdrop-blur-xs mask-t-from-40% mask-t-to-100% fixed left-0 bottom-0 pointer-events-none z-1 w-full h-20" /> */}
    </nav>
  );
};

export default memo(AppNavbar);
