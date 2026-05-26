import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import { type FC } from "react";
import clsx from "clsx";
import usePress from "@/hooks/usePress";

const ThemeToggle: FC<{ className?: string }> = ({ className }) => {
  const { setTheme, theme, currentTheme } = useTheme();
  // const [theme, setTheme] = useState<Theme>("system");
  const attrs = usePress({
    onLongPress: () => setTheme("system"),
    onClick: () => {
      setTheme(currentTheme === "light" ? "dark" : "light");
    },
  });

  return (
    <Button
      variant="outline"
      size="icon"
      {...attrs}
      className={clsx(
        "select-none relative bg-background! transition-[filter,scale,background] ease-in-out duration-500 rounded-full",
        "active:brightness-125 backdrop-filter-[brightness()] active:scale-125",
        " hover:bg-background!",
        className,
      )}
    >
      <div
        className={clsx(
          "size-5 absolute top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2 origin-center",
          theme === "system" && "rotate-45",
        )}
      >
        <div
          className={clsx(
            "transition-[opacity,scale,rotate,translate] duration-500 ease-out-back",
            "absolute translate-y-0 origin-center",
            theme === "system" &&
              "-translate-y-1.25 ease-out! transition-[scale]! origin-bottom!",
            theme === "dark" && "scale-100 rotate-0 opacity-100",
            theme === "light" && "scale-0 rotate-90 opacity-0",
          )}
        >
          <Moon
            className={clsx(
              "size-5 animated transition-[height,color] ease-out-back duration-500 text-foreground",
              "*:origin-center *:duration-500 *:transition-[rotate] *:ease-out-back",
              theme === "system" &&
                "*:-rotate-45 h-3! *:ease-out! transition-none! *:transition-none!",
            )}
            preserveAspectRatio="xMidYMin slice"
            strokeWidth={1}
          />
        </div>
        <div
          className={clsx(
            "transition-[opacity,scale,rotate,translate] duration-500 ease-out-back",
            "absolute translate-y-0 origin-center",
            theme === "system" &&
              "translate-y-3 ease-out! transition-[scale]! origin-top!",
            theme === "dark" && "scale-0 rotate-90 opacity-0",
            theme === "light" && " scale-100 rotate-0 opacity-100",
          )}
        >
          <Sun
            preserveAspectRatio="xMidYMax slice"
            className={clsx(
              "size-5 animated transition-[height,color] duration-500 ease-out-back text-foreground",
              "*:origin-center *:duration-500 *:transition-[rotate] *:ease-out-back",
              theme === "system" &&
                "*:-rotate-45 h-2! *:ease-out! transition-none! *:transition-none!",
            )}
            strokeWidth={1}
          />
        </div>
      </div>
      <div
        className={clsx(
          "absolute top-1/2 left-1/2 -translate-x-[calc(50%+1px)] -translate-y-[calc(50%-1px)] origin-center",
        )}
      >
        <div
          className={clsx(
            "bg-foreground rounded rotate-45 w-0 h-px duration-500 transition-[width,background] ease-out-back pointer-events-none",
            theme === "system" && " w-5",
          )}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
