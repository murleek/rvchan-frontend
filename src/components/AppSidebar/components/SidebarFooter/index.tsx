import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter as _SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import { EllipsisVertical, LogOut, Smartphone, User2 } from "lucide-react";
import ProfileAvatar from "@/components/Common/ProfileAvatar";
import { Link } from "react-router";
import { PAGES } from "@/constants";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/Common/ThemeToggle";

const SidebarFooter = () => {
  const { t } = useTranslation("sidebar");
  const { profile, logout } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const handleClick = () => {
    setOpenMobile(false);
  };

  if (!profile) return null;

  return (
    <_SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size={"lg"}
                tooltip={{
                  children: (
                    <b>
                      {profile.firstName} {profile.lastName}
                    </b>
                  ),
                }}
              >
                <ProfileAvatar src={profile.avatar} />
                <div className="flex items-center justify-between w-full text-left">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-sm/4 font-bold">
                      {profile.firstName} {profile.lastName}
                    </span>
                    <span className="truncate text-xs animated text-black/50 dark:text-white/50">
                      @{profile.username}
                    </span>
                  </div>
                  <EllipsisVertical className="ml-auto important size-4!" />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <ProfileAvatar src={profile.avatar} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {profile.firstName} {profile.lastName}
                    </span>
                    <span className="truncate text-xs animated text-black/50 dark:text-white/50">
                      @{profile.username}
                    </span>
                  </div>
                  <ThemeToggle className="ml-auto flex-none" />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("dropdown.settings")}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link
                    to={PAGES.SETTINGS_PROFILE}
                    className="flex items-center gap-2"
                    onClick={() => setTimeout(handleClick, 0)} // хард пушим в конец стека, чтобы сначала закрыть дропдаун, а потом сайдбар
                  >
                    <User2 />
                    {t("dropdown.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Smartphone />
                  {t("dropdown.devices")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => logout()}
                >
                  <LogOut />
                  {t("dropdown.logout")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </_SidebarFooter>
  );
};

export default SidebarFooter;
