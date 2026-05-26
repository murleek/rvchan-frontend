import {
  Tabs,
  TabsCheap,
  TabsList,
  TabsSearch,
  TabsSearchContent,
  TabsSearchTrigger,
  TabsTrigger,
  TabsTriggerLabel,
} from "@/components/ui/tabs";
import { Search, Settings, UserCircle2 } from "lucide-react";
import { PAGES } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router";

const AppNavbar = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!profile) return null;

  const defaultTrigger = location.pathname.startsWith(
    PAGES.USER.replace(":username", profile.username || ""),
  )
    ? "profile"
    : location.pathname.startsWith(PAGES.SETTINGS)
      ? "settings"
      : location.pathname.startsWith(PAGES.SEARCH)
        ? "search"
        : "profile";

  const triggers = [
    {
      value: "profile",
      label: "Профиль",
      icon: UserCircle2,
      link: PAGES.USER.replace(":username", profile.username),
    },

    {
      value: "settings",
      label: "Настройки",
      icon: Settings,
      link: PAGES.SETTINGS,
    },
    {
      value: "smthelse",
      label: "smth else",
      icon: Search,
      link: PAGES.ROOT,
    },
  ];

  const onTriggerSelect = (value: string) => {
    const trigger = triggers.find((t) => t.value === value);
    if (trigger) {
      navigate(trigger.link);
    }
  };
  const onTypeChange = (prev: string, newVal: string) => {
    if (newVal === "search") {
      navigate(PAGES.SEARCH);
    } else if (prev === "search") {
      navigate(-1, { replace: true });
    }
  };

  return (
    <Tabs
      defaultValue={defaultTrigger}
      defaultType={
        location.pathname.startsWith(PAGES.SEARCH) ? "search" : "default"
      }
      onValueChange={onTriggerSelect}
      onTypeChange={onTypeChange}
      className="md:hidden fixed bottom-4 mb-safe w-full px-4 flex-row! justify-end z-10"
    >
      <TabsList className="group-data-[state=default]/tabs:max-sm:flex-1 group-data-[orientation=horizontal]/tabs:h-fit bg-card/80 backdrop-blur-sm border border-border rounded-full shadow-lg *:data-[state=active]:text-primary!">
        {triggers.map((trigger) => (
          <TabsTrigger
            key={trigger.value}
            value={trigger.value}
            className="flex flex-col items-center gap-0.5 sm:px-4 text-[12px] font-black [&>svg]:size-6! border-0"
          >
            <trigger.icon />
            <TabsTriggerLabel>{trigger.label}</TabsTriggerLabel>
          </TabsTrigger>
        ))}
        <TabsCheap className="rounded-full" />
      </TabsList>
      {/* <SidebarTrigger
        icon={MenuIcon}
        className={clsx(
          "z-2 bg-card/80 backdrop-blur-sm border border-border rounded-full shadow-lg size-16 [&>svg]:size-6! active:scale-120 active:bg-[color(display-p3_1_1_1)] [dynamic-range-limit:constrained]",
        )}
      /> */}
      <TabsSearch>
        <TabsSearchTrigger />
        <TabsSearchContent>
          {/* {(close) => <div className="p-4">Search content</div>} */}
        </TabsSearchContent>
      </TabsSearch>
    </Tabs>
  );
};

export default AppNavbar;
