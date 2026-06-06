import {
  SidebarGroup,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent as _SidebarContent,
  useSidebar,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";

import {
  Bell,
  HomeIcon,
  Plus,
  Search,
  UserCircle2,
  ReplyIcon,
} from "lucide-react";

import { PAGES } from "@/constants";

import useNotifications from "@/hooks/common/useNotifications";
import clsx from "clsx";
import useAuth from "@/hooks/useAuth";
import useNav, { type TabKey } from "@/hooks/common/useNav";
import { useTranslation } from "react-i18next";
import useModal from "@/hooks/common/useModal";
import type { PostFormModalDetails } from "@/components/Common/PostFormModal";

const SidebarContent = () => {
  const { profile } = useAuth();
  const { t } = useTranslation("sidebar");
  const { unseen } = useNotifications();
  const { setOpenMobile, open } = useSidebar();
  const { switchTab, activeTab, clearStack } = useNav();
  const { openModal, payload } = useModal<PostFormModalDetails>("post");

  const handleClick = (tab: TabKey, url: string) => {
    setOpenMobile(false);
    if (activeTab === tab) {
      clearStack(tab);
    } else {
      switchTab(tab, url);
    }
  };
  return (
    <_SidebarContent className="flex">
      <div
        className={clsx(
          !open && "flex-1 flex flex-col duration-500 ease-in-out",
        )}
      >
        <SidebarGroup className="my-auto">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: <b>{t("content.home")}</b> }}
              isActive={activeTab === "home"}
              onClick={() => handleClick("home", PAGES.HOME)}
              className="flex items-center gap-2"
            >
              {/* <Icon name="person" opsz={24} /> */}
              <HomeIcon />
              <span>{t("content.home")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="relative">
            <SidebarMenuButton
              tooltip={{ children: <b>{t("content.notifications")}</b> }}
              isActive={activeTab === "notifications"}
              className="flex items-center gap-2"
              onClick={() => handleClick("notifications", PAGES.NOTIFICATIONS)}
            >
              <Bell />
              <span>{t("content.notifications")}</span>
            </SidebarMenuButton>
            <SidebarMenuBadge
              className={clsx(
                "animated bg-primary text-primary-foreground! font-black absolute top-1/2! h-5 flex! items-center justify-center rounded-full -translate-y-1/2 min-w-5 right-2",
                !open &&
                  "size-4! -top-2! translate-y-0 text-[10px] important -right-1",
                !unseen && "hidden!",
              )}
            >
              {!!unseen && unseen > 0 ? unseen : null}
            </SidebarMenuBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{
                children: (
                  <b>
                    {t(
                      payload?.isReplyingToThread
                        ? "content.reply"
                        : "content.create",
                    )}
                  </b>
                ),
              }}
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-300 text-white hover:text-fuchsia-900 rounded-full!"
            >
              {/* <Icon name="person" opsz={24} /> */}
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
              />{" "}
              <span>
                {t(
                  payload?.isReplyingToThread
                    ? "content.reply"
                    : "content.create",
                )}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: <b>{t("content.search")}</b> }}
              isActive={activeTab === "search"}
              className="flex items-center gap-2"
              onClick={() => handleClick("search", PAGES.SEARCH)}
            >
              {/* <Icon name="person" opsz={24} /> */}
              <Search />
              <span>{t("content.search")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: <b>{t("content.profile")}</b> }}
              isActive={activeTab === "profile"}
              onClick={() =>
                handleClick(
                  "profile",
                  PAGES.USER.replace(":username", profile!.username),
                )
              }
              className="flex items-center gap-2"
            >
              {/* <Icon name="person" opsz={24} /> */}
              <UserCircle2 />
              <span>{t("content.profile")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
      </div>
    </_SidebarContent>
  );
};

export default SidebarContent;
