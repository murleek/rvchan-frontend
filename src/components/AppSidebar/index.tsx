import { Sidebar } from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import { type ComponentProps } from "react";
import SidebarHeader from "./components/SidebarHeader";
import { UserState } from "@/app/types/user";
import SidebarFooter from "./components/SidebarFooter";
import SidebarContent from "./components/SidebarContent";

const AppSidebar = ({ ...props }: ComponentProps<typeof Sidebar>) => {
  const { profile } = useAuth();

  if (!profile || profile.state !== UserState.ACTIVE) return null;

  return (
    <Sidebar
      collapsible="icon"
      className="rounded-t-4xl"
      variant="inset"
      {...props}
    >
      <SidebarHeader />
      {/* <SidebarSearch /> */}
      <SidebarContent />
      <SidebarFooter />
      {/* <div className="absolute bottom-4 left-[calc(100%+0.5rem)] group/menu active:scale-125 hover:bg-gray-100 dark:hover:bg-zinc-800  md:rounded-lg z-50 rounded-full bg-card md:border shadow-lg w-fit inset-shadow-glow dark:inset-shadow-white/20 cursor-pointer animated transition-[background,color,scale,filter,backdrop-filter] active:brightness-125 backdrop-filter-[brightness()] max-md:hidden">
        <SidebarTrigger
          className={
            "size-14 md:size-10 z-2 text-foreground! active:text-foreground [&>svg]:size-5! md:[&>svg]:size-4! [&>svg]:animated [&>svg]:transition-[width,height] hover:bg-transparent animated transition-[background,color,scale] rounded-full"
          }
          icon={Menu}
        />
      </div> */}
    </Sidebar>
  );
};

export default AppSidebar;
