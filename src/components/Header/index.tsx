import clsx from "clsx";
import { useCallback, useMemo, useRef } from "react";
import { a, useTransition } from "@react-spring/web";
import useAuth from "@/hooks/useAuth";
import { Check, ChevronLeft, Settings } from "lucide-react";
import HeaderButton from "./components/HeaderButton";
import useNav from "@/hooks/common/useNav";
import { PAGES } from "@/constants";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import useScrollHidden from "./hooks/useScrollHidden";

const Header = () => {
  const { title, hideTitle, isClickable } = useSelector(
    (state: RootState) => state.header,
  );
  const onClickRef = useRef<(() => void) | null>(null);

  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { back, canGoBack } = useNav();

  const isTitleHidden = useScrollHidden(hideTitle);

  const isProfilePage = useMemo(
    () =>
      !!profile?.username &&
      location.pathname === PAGES.USER.replace(":username", profile.username),
    [profile, location.pathname],
  );

  const t = useTransition(hideTitle && isTitleHidden, {
    from: { opacity: 0, filter: "blur(4px)", transform: "translateY(16px)" },
    enter: { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
    leave: { opacity: 0, filter: "blur(4px)", transform: "translateY(16px)" },
  });

  const handleSettings = useCallback(
    () => navigate(PAGES.SETTINGS),
    [navigate],
  );

  const handleCheck = useCallback(() => onClickRef.current?.(), []);

  return (
    <header className="gap-3 h-16 flex-none shrink-0 items-center sticky top-0 z-10 md:rounded-t-xl">
      <div className="md:rounded-t-xl backdrop-blur-xs mask-b-from-40% mask-b-to-100% absolute left-0 top-0 bottom-0 pointer-events-none z-1 w-full h-20" />
      <div className="md:rounded-t-xl mask-b-from-10% mask-b-to-80% bg-background absolute left-0 top-0 bottom-0 pointer-events-none z-1 w-full h-20 animated transition-colors" />
      <div className="px-4 max-w-2xl w-full mx-auto h-full relative flex items-center gap-2 z-2">
        <HeaderButton
          icon={ChevronLeft}
          onClick={back}
          show={canGoBack}
          position="left"
          activeColor="gray"
          aria-label="Назад"
        />
        {t(
          (style, item) =>
            !item && (
              <a.h1
                className={clsx(
                  "text-lg font-extrabold w-full text-center will-change-[filter]",
                  isTitleHidden && "pointer-events-none",
                )}
                style={style}
              >
                {title}
              </a.h1>
            ),
        )}
        {profile && (
          <HeaderButton
            icon={Settings}
            onClick={handleSettings}
            show={isProfilePage}
            position="right"
            activeColor="gray"
            aria-label="Настройки"
          />
        )}
        <HeaderButton
          icon={Check}
          onClick={handleCheck}
          // eslint-disable-next-line react-hooks/refs
          show={!!onClickRef.current}
          position="right"
          disabled={!isClickable}
          activeColor="fuchsia"
          aria-label="Сохранить"
        />
      </div>
    </header>
  );
};

export default Header;
