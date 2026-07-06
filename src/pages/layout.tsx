import { Navigate, Route, Routes } from "react-router";
import RootPage from ".";
import ProfilePage from "./[username]";
import { PAGES } from "@/constants";
import { SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import clsx from "clsx";
import { Card } from "@/components/ui/card";
import ErrorView from "@/components/Common/ErrorView";
import SearchPage from "./search";
import ProfileSettingsPage from "./settings/profile";
import SettingsPage from "./settings";
import useWebSocket from "@/hooks/common/useWebSocket";
import Loader from "@/components/Common/Loader";
import Notifications from "./notifications";
import { Toaster } from "@/components/Common/Toaster";
import { type FC } from "react";
import Header from "@/components/Header";
import DevicesPage from "./settings/devices";
import PostPage from "./[username]/post/[id]";
import SettingsLanguagePage from "./settings/language";
import AppNavbar from "@/components/AppNavbar";
import FollowersPage from "./[username]/followers";
import FollowingPage from "./[username]/following";
import HomePage from "./home";
import PostFormModal from "@/components/Common/PostFormModal";
import AppearanceSettingsPage from "./settings/appearance";

const RootLayout: FC = () => {
  const { connected } = useWebSocket();

  return (
    <>
      {!connected && (
        <div className="fixed top-1 left-1/2 -translate-x-1/2 z-5000 pointer-events-none border text-foreground bg-background rounded-md text-center py-1 px-1 flex gap-2 text-xs">
          <span className="size-4!">
            <Loader className="size-4! " />
          </span>
          Connecting...
        </div>
      )}
      <Toaster />
      <AppSidebar />
      <SidebarInset className="md:animated shadow-none! bg-transparent! md:py-2 md:pr-2 min-h-dvh-safe">
        <Card
          className={clsx(
            "p-0 animated relative origin-bottom h-full gap-0 shadow-none max-md:border-none bg-background max-md:rounded-none max-md:pb-16",
            // isMobile &&
            //   openMobile &&
            "group-has-[[role=dialog]]/body:max-md:opacity-100 group-has-[[role=dialog]]/body:max-md:contrast-70 group-has-[[role=dialog]]/body:max-md:saturate-80",
          )}
        >
          <div className="relative scrollbar-bg-background flex flex-col flex-1 pb-4 gap-2">
            <Header />
            <main className="max-w-2xl mx-auto w-full flex-1 px-4 relative">
              {/* <Suspense fallback={<PageLoader label={t("loader.page")} />}> */}
              <Routes>
                <Route index path="/" element={<RootPage />} />
                <Route path={PAGES.HOME} element={<HomePage />} />
                <Route
                  path={PAGES.USER}
                  element={<ProfilePage key={new Date().getTime()} />}
                />
                <Route
                  path={PAGES.USER_FOLLOWERS}
                  element={<FollowersPage />}
                />
                <Route
                  path={PAGES.USER_FOLLOWING}
                  element={<FollowingPage />}
                />
                <Route path={PAGES.POST} element={<PostPage />} />
                <Route path={PAGES.SEARCH} element={<SearchPage />} />
                <Route path={PAGES.SETTINGS} element={<SettingsPage />} />
                <Route
                  path={PAGES.SETTINGS_DEVICES}
                  element={<DevicesPage />}
                />
                <Route
                  path={PAGES.SETTINGS_PROFILE}
                  element={<ProfileSettingsPage />}
                />
                <Route
                  path={PAGES.SETTINGS_APPEARANCE}
                  element={<AppearanceSettingsPage />}
                />
                <Route
                  path={PAGES.SETTINGS_LANGUAGE}
                  element={<SettingsLanguagePage />}
                />
                <Route path={PAGES.NOTIFICATIONS} element={<Notifications />} />
                <Route
                  path={PAGES.INIT}
                  element={<Navigate to="/" replace />}
                />
                <Route path="*" element={<ErrorView t="notFound" />} />
              </Routes>
              {/* </Suspense> */}
            </main>
            <PostFormModal username="murleek" />
          </div>
        </Card>
        <AppNavbar />
      </SidebarInset>
    </>
  );
};

export default RootLayout;
