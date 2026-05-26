import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader as _SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import clsx from "clsx";

const SidebarHeader = () => {
  const { state } = useSidebar();

  return (
    <_SidebarHeader>
      <div className="flex items-center gap-2">
        {/* {isMobile && (
          <>
            <SidebarTrigger className="size-10" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
          </>
        )} */}
        <div className="max-md:mt-1 w-full flex items-center justify-center">
          <SidebarMenu>
            <SidebarMenuItem className=" h-auto overflow-hidden">
              <SidebarMenuButton
                className=" overflow-hidden"
                size={"lg"}
                asChild
              >
                <div className="bg-transparent!  overflow-hidden h-auto! hover:bg-transparent! cursor-pointer">
                  <div
                    className={clsx(
                      "bg-fuchsia-500 z-1 flex-none size-9 animated flex items-center justify-center select-none rounded-md",
                      state === "collapsed" && "size-9!",
                    )}
                  >
                    <span className="text-3xl/8 pb-1 align-middle font-black inline-block text-white">
                      &raquo;
                    </span>
                  </div>
                  <div className="flex gap-2 items-center justify-between w-full overflow-auto! relative h-auto!">
                    <span className="text-lg font-bold">rvchan</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </div>
    </_SidebarHeader>
  );
};

export default SidebarHeader;
