import ProfileAvatar from "@/components/Common/ProfileAvatar";
import { useHeader } from "@/hooks/common/useHeader";
import { Card } from "@/components/ui/card";
import { PAGES } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { Eclipse, Globe, LogOut, Smartphone, User2 } from "lucide-react";
import { Link } from "react-router";
import BigHeader from "@/components/Header/components/BigHeader";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const { profile, logout } = useAuth();
  const { t } = useTranslation("settings");
  useHeader(t("header"), { hideTitle: true });

  if (!profile) return null;

  return (
    <div>
      <BigHeader>{t("header")}</BigHeader>
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              src={profile.avatar}
              className="size-12 rounded-full"
            />
            <div>
              <h2 className="text-lg font-bold">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden gap-0">
          <Link
            to={PAGES.SETTINGS_PROFILE}
            className="text-foreground flex gap-4 items-center px-3 py-2 hover:bg-muted  animated transition-colors"
          >
            <div className="size-8 bg-linear-to-br from-fuchsia-400 to-fuchsia-700 inset-shadow-glow inset-shadow-white/33 rounded-[10px] flex items-center justify-center text-white">
              <User2 className="size-5" />
            </div>
            <span className="flex-1">{t("profile.title")}</span>
          </Link>
          <Link
            to={PAGES.SETTINGS_DEVICES}
            className="text-foreground flex gap-4 items-center px-3 py-2 hover:bg-muted  animated transition-colors"
          >
            <div className="size-8 bg-linear-to-br from-amber-400 to-amber-700 inset-shadow-glow inset-shadow-white/33 rounded-[10px] flex items-center justify-center text-white">
              <Smartphone className="size-5" />
            </div>
            <span className="flex-1">{t("devices.title")}</span>
          </Link>
        </Card>

        <Card className="p-0 overflow-hidden gap-0">
          <Link
            to={PAGES.SETTINGS_APPEARANCE}
            className="text-foreground flex gap-4 items-center px-3 py-2 hover:bg-muted  animated transition-colors"
          >
            <div className="size-8 bg-linear-to-br from-sky-400 to-sky-700 inset-shadow-glow inset-shadow-white/33 rounded-[10px] flex items-center justify-center text-white">
              <Eclipse className="size-5" />
            </div>
            <span className="flex-1">{t("appearance.title")}</span>
          </Link>
          <Link
            to={PAGES.SETTINGS_LANGUAGE}
            className="text-foreground flex gap-4 items-center px-3 py-2 hover:bg-muted  animated transition-colors"
          >
            <div className="size-8 bg-linear-to-br from-lime-400 to-lime-700 inset-shadow-glow inset-shadow-white/33 rounded-[10px] flex items-center justify-center text-white">
              <Globe className="size-5" />
            </div>
            <span className="flex-1">{t("language.title")}</span>
          </Link>
        </Card>

        <Card className="p-0 overflow-hidden">
          <button
            onClick={() => logout()}
            className="text-foreground flex text-left gap-4 items-center px-3 py-2 hover:bg-muted  animated transition-colors"
          >
            <div className="size-8 bg-linear-to-br from-rose-400 to-rose-700 inset-shadow-glow inset-shadow-white/33 rounded-[10px] flex items-center justify-center text-white">
              <LogOut className="size-5" />
            </div>
            <span className="flex-1">{t("logout")}</span>
          </button>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
