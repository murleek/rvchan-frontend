import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "@react-spring/web";
import useNavbarStyle from "./useNavbarStyle";
import useButtonStyle from "./useButtonStyle";
import useNavCardStyle from "./useNavCardStyle";
import useNavButtonTextStyle from "./useNavButtonTextStyle";

const THRESHOLD = 0.4;
const SEGMENT = 200;
const CONFIG = config.stiff;

const useNavbar = () => {
  const lastY = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const { style: navStyle, setStyle: setNavStyle } = useNavbarStyle(CONFIG);
  const { style: buttonStyle, setStyle: setButtonStyle } =
    useButtonStyle(CONFIG);
  const { style: navCardStyle, setStyle: setNavCardStyle } =
    useNavCardStyle(CONFIG);
  const { style: navButtonTextStyle, setStyle: setNavButtonTextStyle } =
    useNavButtonTextStyle(CONFIG);

  const setStyles = useCallback(
    (progress: number) => {
      setScrollProgress(progress);
      setNavStyle(progress);
      setButtonStyle(progress);
      setNavCardStyle(progress);
      setNavButtonTextStyle(progress);
    },
    [setNavStyle, setButtonStyle, setNavCardStyle, setNavButtonTextStyle],
  );

  useEffect(() => {
    let isTicking = false;
    let isDragging = false;

    const finalizeProgress = (progress: number) => {
      const fixedProgress = progress >= THRESHOLD ? 1 : 0;

      setStyles(fixedProgress);

      lastY.current = window.scrollY - (fixedProgress === 1 ? SEGMENT : 0);
    };

    const handleScroll = () => {
      if (isTicking) return;
      isTicking = true;
      requestAnimationFrame(() => {
        const offset = window.scrollY - lastY.current;

        if (timerRef.current) clearTimeout(timerRef.current);

        if (offset >= SEGMENT) {
          setStyles(1);
          lastY.current = window.scrollY - SEGMENT;
        } else if (offset <= 0) {
          setStyles(0);
          lastY.current = window.scrollY;
        } else {
          const progress = offset / SEGMENT;

          setStyles(progress);

          if (!isDragging) {
            timerRef.current = setTimeout(() => {
              finalizeProgress(progress);
            }, 80);
          }
        }
        isTicking = false;
      });
    };

    const handleTouchStart = () => {
      isDragging = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleTouchEnd = () => {
      isDragging = false;

      const offset = window.scrollY - lastY.current;

      if (offset > 0 && offset < SEGMENT) {
        finalizeProgress(offset / SEGMENT);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [setStyles]);

  const resetScrollProgress = () => {
    setStyles(0);
    lastY.current = window.scrollY;
  };

  return {
    scrollProgress,
    navStyle,
    buttonStyle,
    navCardStyle,
    navButtonTextStyle,
    resetScrollProgress,
  };
};

export default useNavbar;
