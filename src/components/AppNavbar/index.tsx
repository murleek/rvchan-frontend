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
import { useTranslation } from "react-i18next";
import useModal from "@/hooks/common/useModal";
import type { PostFormModalDetails } from "../Common/PostFormModal";
import clsx from "clsx";
import useNotifications from "@/hooks/common/useNotifications";
import { a, SpringValue } from "@react-spring/web";
import useNavbar from "./hooks/useNavbar";
import PostForm from "../Common/PostForm";
import { useLocation } from "react-router";

const AnimatedCard = a(Card);

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
    textStyle,
  }: {
    trigger: Trigger;
    active: boolean;
    onClick: () => void;
    buttonsRef: React.RefObject<Record<TabKey, HTMLButtonElement>>;
    textStyle: { fontSize: SpringValue<number>; opacity: SpringValue<number> };
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
        className={`flex flex-col cursor-pointer h-14 items-center justify-center gap-0.5 px-2 py-1.5 z-10 font-extrabold transition-colors duration-200 ${
          active
            ? "text-sidebar-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <div className="relative">
          <trigger.icon className="size-6 stroke-3 mx-1.5 box-border" />
          {trigger.id === "notifications" && unseen > 0 && (
            <span className="absolute -top-1.5 left-3.25 px-0.75 py-px rounded-full bg-primary ring-2 font-black text-white text-[12px]/[12px] tabular-nums">
              {unseen > 99 ? "∞" : unseen}
            </span>
          )}
        </div>
        <a.span className="tracking-tight font-black" style={textStyle}>
          {trigger.label}
        </a.span>
      </button>
    );
  },
);

const AppNavbar = () => {
  const { profile } = useAuth();
  const { switchTab, activeTab, clearStack } = useNav();
  const { t } = useTranslation("sidebar");
  const { openModal, payload } = useModal<PostFormModalDetails>("post");
  const location = useLocation();

  const isPostFormShown = useMemo(() => {
    const shownPaths = [
      "/*/post",
      PAGES.USER.replace(":username", profile?.username ?? ""),
    ];
    if (location.pathname.startsWith("/")) {
      return shownPaths.some((path) => {
        const primitiveCheck = location.pathname.startsWith(path);
        const regexCheck =
          path.includes("*") &&
          new RegExp(`^${path.replace("*", ".*")}`).test(location.pathname);

        console.group(path, "check");
        console.log(location.pathname, path);
        console.log("primitive check:", primitiveCheck);
        console.log("regex check:", regexCheck);
        console.log("final result:", primitiveCheck || regexCheck);
        console.groupEnd();
        return (
          location.pathname.startsWith(path) ||
          (path.includes("*") &&
            new RegExp(`^${path.replace("*", ".*")}`).test(location.pathname))
        );
      });
    }
    return false;
  }, [location.pathname, profile?.username]);

  // const [scrollProgress, setScrollProgress] = useState({
  //   transform: `translateY(${0}px) scale(${1})`,
  //   progress: 0,
  // });

  const buttonsRef = useRef<Record<TabKey, HTMLButtonElement>>(
    {} as Record<TabKey, HTMLButtonElement>,
  );

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    bottom: 0,
  });

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

  const {
    scrollProgress,
    resetScrollProgress,
    navStyle,
    buttonStyle,
    navCardStyle,
    navButtonTextStyle,
    postFormStyle,
  } = useNavbar({ isPostFormShown });

  const handleClick = useCallback(
    (tab: TabKey, url: string) => {
      if (scrollProgress > 0) {
        resetScrollProgress();
        return;
      }
      if (activeTab === tab) {
        clearStack(tab);
      } else {
        switchTab(tab, url);
      }
    },
    [activeTab, clearStack, switchTab, resetScrollProgress, scrollProgress],
  );

  const updateIndicator = useCallback(() => {
    requestAnimationFrame(() => {
      const activeButton = buttonsRef.current[activeTab];
      if (!activeButton) return;

      const rect = activeButton.getBoundingClientRect();
      const parentRect = activeButton.parentElement!.getBoundingClientRect();

      setIndicatorStyle({
        left: rect.left - parentRect.left - 6,
        width: rect.width + 10,
        bottom: 0,
      });
    });
  }, [activeTab]);

  const debouncedUpdate = useDebounce(updateIndicator, 40);

  useLayoutEffect(() => {
    updateIndicator();

    window.addEventListener("resize", updateIndicator);
    window.addEventListener("orientationchange", updateIndicator);
    window.addEventListener("scroll", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
      window.removeEventListener("orientationchange", updateIndicator);
      window.removeEventListener("scroll", updateIndicator);
    };
  }, [updateIndicator, debouncedUpdate]);

  if (!profile) return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:hidden z-50 flex flex-col items-center gap-2 max-w-158 px-5 pointer-events-none">
      <a.div
        className={clsx(
          "w-full pointer-events-auto backdrop-blur-sm backdrop-saturate-70 backdrop-grayscale-80 bg-card/80 rounded-[29px]",
          !isPostFormShown && "pointer-events-none",
        )}
        style={postFormStyle}
      >
        <PostForm
          className="relative w-full bg-transparent"
          formClassName="scrollbar-bg-white"
          username={
            payload?.reply ? payload.reply.user.username : profile.username
          }
          parentId={payload?.reply ? String(payload.reply.id) : undefined}
        />
      </a.div>
      <a.nav
        className={clsx(
          "w-full md:hidden z-50 pointer-events-none pb-2 px-3 flex items-center justify-center gap-2",
        )}
        style={navStyle}
      >
        <AnimatedCard
          className="transition-none overflow-hidden py-0.5 px-2 w-fit border-border! backdrop-blur-sm backdrop-saturate-70 backdrop-grayscale-80 bg-card/80 mb-safe rounded-full flex flex-row gap-0 pointer-events-auto z-10"
          style={navCardStyle}
        >
          {triggers.map((trigger) => (
            <NavbarButton
              key={trigger.id}
              trigger={trigger}
              active={activeTab === trigger.id}
              onClick={() => handleClick(trigger.id, trigger.url)}
              textStyle={navButtonTextStyle}
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
        </AnimatedCard>
        <a.button
          className="z-2 overflow-hidden py-0.5 px-2 border-border! backdrop-blur-md bg-card/70! rounded-full flex flex-none gap-0.2 size-15.5 border animated transition-colors pointer-events-auto items-center justify-center active:brightness-110 hover:bg-card/80 cursor-pointer"
          onClick={() => openModal()}
          style={buttonStyle}
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
        </a.button>
        {/* <div className="md:rounded-t-xl mask-t-from-10% mask-t-to-80% bg-background fixed left-0 bottom-0 pointer-events-none z-1 w-full h-20 animated transition-colors" /> */}
        {/* <div className="md:rounded-t-xl backdrop-blur-xs mask-t-from-40% mask-t-to-100% fixed left-0 bottom-0 pointer-events-none z-1 w-full h-20" /> */}
      </a.nav>
    </div>
  );
};

export default memo(AppNavbar);
