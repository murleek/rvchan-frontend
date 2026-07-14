import Post from "@/components/Common/Post";
import BigHeader from "@/components/Header/components/BigHeader";
import { Card } from "@/components/ui/card";
import { useHeader } from "@/hooks/common/useHeader";
import { useTheme } from "@/providers/ThemeProvider";
import clsx from "clsx";
import { type FC } from "react";
import { useTranslation } from "react-i18next";

const ThemeButton: FC<{
  colors: {
    primaryText: string;
    secondaryText: string;
    accent: string;
    background: string;
    card: string;
  };
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}> = ({ colors, selected, onClick, label }) => {
  return (
    <div className="flex flex-col gap-1">
      <Card
        className={clsx(
          "flex flex-col gap-0 bg-background  ring-offset-card p-2 h-20 w-32 cursor-pointer",
          !selected && "hover:ring-1 hover:ring-offset-2 hover:ring-primary/50",
          selected && "ring-2 ring-primary ring-offset-2",
          colors.background,
        )}
        onClick={onClick}
      >
        <Card
          className={clsx(
            "flex flex-col gap-1 p-2 h-16 rounded-md",
            colors.card,
          )}
        >
          <div className="flex gap-1 items-center">
            <div
              className={clsx("size-4 flex-none rounded-full", colors.accent)}
            ></div>
            <div className="flex gap-1 flex-col w-full">
              <div
                className={clsx(
                  "w-1/4 py-0.5 rounded-full",
                  colors.primaryText,
                )}
              ></div>
              <div
                className={clsx(
                  "w-1/3 py-px rounded-full",
                  colors.secondaryText,
                )}
              ></div>
            </div>
          </div>
          <div
            className={clsx(
              "text-sm w-full py-0.5 rounded-full font-semibold",
              colors.primaryText,
            )}
          ></div>
          <div
            className={clsx(
              "text-sm w-full py-0.5 rounded-full font-semibold",
              colors.primaryText,
            )}
          ></div>
          <div
            className={clsx(
              "text-sm w-1/4 py-0.5 rounded-full font-semibold",
              colors.primaryText,
            )}
          ></div>
        </Card>
      </Card>
      {label && (
        <span
          className={clsx(
            "text-sm text-center text-muted-foreground animated transition-[color,letter-spacing]",
            selected && "text-primary font-extrabold tracking-wide",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

const AppearanceSettingsPage: FC = () => {
  const { t } = useTranslation("settings");
  const { setTheme, theme } = useTheme();
  useHeader(t("appearance.header"), { hideTitle: true });

  return (
    <div className="flex flex-col">
      <BigHeader>{t("appearance.header")}</BigHeader>

      <Card className="p-0 overflow-hidden gap-0">
        <div
          className={
            "select-none border-b pointer-events-none p-4 bg-background animated transition-[background,border]"
          }
        >
          <Card className="w-full p-0 gap-4">
            <Post
              notEntriable
              thread={{
                id: "1",
                user: {
                  id: 1,
                  firstName: t("appearance.demo.firstName"),
                  avatar: "/logo.svg",
                  email: "",
                  lastName: null,
                  description: null,
                  username: "",
                  isPrivate: false,
                  state: "ACTIVE",
                },
                content: t("appearance.demo.content"),
                createdAt: new Date(
                  +new Date() - (67 * 67 * 67 * 67 * 67 * 67 * 67) / 2.76,
                ),
                parentId: null,
                replyCount: 42,
                likeCount: 67,
                parents: undefined,
                isLiked: true,
              }}
            />
          </Card>
        </div>
        <div className="flex p-4 flex-row gap-3 overflow-x-auto">
          <ThemeButton
            colors={{
              primaryText: "bg-foreground",
              secondaryText: "bg-muted-foreground",
              accent: "bg-primary",
              background: "bg-background light",
              card: "bg-card",
            }}
            selected={theme === "light"}
            onClick={() => {
              setTheme("light");
            }}
            label={t("appearance.theme.light")}
          />
          <ThemeButton
            colors={{
              primaryText: "bg-foreground",
              secondaryText: "bg-muted-foreground",
              accent: "bg-primary",
              background: "bg-background dark",
              card: "bg-card",
            }}
            selected={theme === "dark"}
            onClick={() => {
              setTheme("dark");
            }}
            label={t("appearance.theme.dark")}
          />
        </div>
      </Card>
    </div>
  );
};

export default AppearanceSettingsPage;
