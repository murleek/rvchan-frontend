import { a, useTransition } from "@react-spring/web";
import clsx from "clsx";
import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

interface HeaderButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  show: boolean;
  position?: "left" | "right";
  activeColor?: string; // цвет при active/hover (по умолчанию серый)
  className?: string;
  disabled?: boolean;
  iconClassName?: string;
  "aria-label"?: string;
}

const HeaderButton = ({
  icon: Icon,
  onClick,
  show,
  position = "left",
  activeColor = "fuchsia",
  disabled = false,
  className,
  iconClassName,
  "aria-label": ariaLabel,
}: HeaderButtonProps) => {
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  const t = useTransition(show, {
    from: {
      opacity: 0,
      filter: "blur(4px) var(--tw-brightness, brightness(1))",
    },
    enter: {
      opacity: 1,
      filter: "blur(0px) var(--tw-brightness, brightness(1))",
    },
    leave: {
      opacity: 0,
      filter: "blur(4px) var(--tw-brightness, brightness(1))",
    },
    config: { tension: 300, friction: 20 },
  });

  const handleClick = () => {
    setIsActive(true);
    onClick();

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      setIsActive(false);
    }, 300);
  };

  const positionClasses = position === "left" ? "left-4" : "right-4";

  return t(
    (style, item) =>
      item && (
        <a.div
          className={clsx(
            "ease-in-out duration-300 transition-[filter,scale,box-shadow] will-change-[filter] absolute z-10 active:scale-125 shadow-lg active:shadow-xl",
            "rounded-full",
            positionClasses,
            "top-1.5",
            isActive && "scale-125! brightness-125 shadow-xl!",
            !isActive && "bg-card",
            "active:brightness-125 backdrop-filter-[brightness()] z-100",
          )}
          style={{
            opacity: style.opacity,
          }}
        >
          <a.button
            onClick={handleClick}
            aria-label={ariaLabel}
            className={clsx(
              "size-12 rounded-full flex items-center justify-center",
              " md:border cursor-pointer",
              " dark:inset-shadow-white/20 inset-shadow-glow",
              "animated transition-[background,color,box-shadow,border] will-change-[filter,background,color,box-shadow]",
              "disabled:cursor-default disabled:bg-muted! disabled:text-muted-foreground!",
              activeColor === "fuchsia" &&
                "bg-fuchsia-500 inset-shadow-fuchsia-300 text-white active:bg-fuchsia-500 hover:bg-fuchsia-400",
              activeColor === "gray" &&
                "bg-card hover:bg-gray-100 dark:hover:bg-zinc-800",
              className,
            )}
            disabled={disabled}
            style={{
              filter: style.filter,
            }}
          >
            <Icon strokeWidth={2.5} className={clsx("size-7", iconClassName)} />
          </a.button>
        </a.div>
      ),
  );
};

export default HeaderButton;
