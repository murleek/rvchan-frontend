import Post from "@/components/Common/Post/PostOP";
import BigHeader from "@/components/Header/components/BigHeader";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useHeader } from "@/hooks/common/useHeader";
import { useTheme, type Theme } from "@/providers/ThemeProvider";
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
    red: string;
  };
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}> = ({ colors, selected, onClick, label }) => {
  return (
    <div className="flex flex-col gap-1">
      <Card
        className={clsx(
          "flex flex-col gap-0 bg-background  ring-offset-card p-2 w-32 cursor-pointer",
          !selected && "hover:ring-1 hover:ring-offset-2 hover:ring-primary/50",
          selected && "ring-2 ring-primary ring-offset-2",
          colors.background,
        )}
        onClick={onClick}
      >
        <Card
          className={clsx("flex flex-col gap-1 p-2 rounded-md", colors.card)}
        >
          <div className="flex gap-1 items-center">
            <div
              className={clsx("size-4 flex-none rounded-full", colors.accent)}
            ></div>
            <div className="flex gap-1 flex-col w-full">
              <div
                className={clsx(
                  "w-1/6 h-0.75 rounded-full",
                  colors.primaryText,
                )}
              ></div>
              <div
                className={clsx(
                  "w-1/3 h-0.75 rounded-full",
                  colors.secondaryText,
                )}
              ></div>
            </div>
          </div>
          <div className="flex gap-0.5 flex-col">
            <div
              className={clsx(
                "text-sm w-full h-0.75 rounded-full font-semibold",
                colors.primaryText,
              )}
            ></div>
            <div
              className={clsx(
                "text-sm w-full h-0.75 rounded-full font-semibold",
                colors.primaryText,
              )}
            ></div>
            <div
              className={clsx(
                "text-sm w-1/4 h-0.75 rounded-full font-semibold",
                colors.primaryText,
              )}
            ></div>
          </div>
          <div className="flex gap-1 items-center">
            <div
              className={clsx(
                "text-sm w-2.25 h-1 rounded-full font-semibold",
                colors.red,
              )}
            ></div>
            <div
              className={clsx(
                "text-sm w-2.25 h-1 rounded-full font-semibold",
                colors.secondaryText,
              )}
            ></div>
          </div>
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
  const { setTheme, theme, currentTheme } = useTheme();
  useHeader(t("appearance.header"), { hideTitle: true });

  return (
    <div className="flex flex-col">
      <BigHeader>{t("appearance.header")}</BigHeader>
      <div className="flex flex-col gap-3">
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
                red: "bg-red-400",
              }}
              selected={currentTheme === "light"}
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
                red: "bg-red-500 dark:bg-red-800",
              }}
              selected={currentTheme === "dark"}
              onClick={() => {
                setTheme("dark");
              }}
              label={t("appearance.theme.dark")}
            />
          </div>
        </Card>
        <Card className="w-full p-0 gap-4">
          <FieldGroup>
            <FieldLabel
              htmlFor={"system-theme-switch"}
              className="bg-transparent! border-0!"
            >
              <Field orientation={"horizontal"} className=" py-3!">
                <FieldContent>
                  <FieldTitle>{t("appearance.theme.system")}</FieldTitle>
                </FieldContent>

                <Switch
                  id={"system-theme-switch"}
                  name={"system-theme-switch"}
                  checked={theme === "system"}
                  onCheckedChange={() =>
                    setTheme(
                      theme === "system" ? (currentTheme as Theme) : "system",
                    )
                  }
                />
              </Field>
            </FieldLabel>
          </FieldGroup>
        </Card>
      </div>
    </div>
  );
};

export default AppearanceSettingsPage;
