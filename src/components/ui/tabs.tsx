import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { a, useSpring } from "@react-spring/web";
import { Search } from "lucide-react";

type TabsContextProps = {
  bounds: DOMRect;
  value: string | undefined;
  type: "default" | "search";
  onTypeChange?: (prev: string, newVal: string) => void;
  recalcBounds: () => void;
  setBounds: (newBounds: DOMRect) => void;
  setType: (newType: "default" | "search") => void;
};

const TabsContext = React.createContext<TabsContextProps | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider.");
  }

  return context;
}

function Tabs({
  className,
  orientation = "horizontal",
  defaultValue,
  defaultType,
  onValueChange,
  onTypeChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
  defaultType?: "default" | "search";
  onTypeChange?: (prev: string, newVal: string) => void;
}) {
  const [bounds, setBounds] = React.useState<DOMRect>({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  } as DOMRect);
  const [value, setValue] = React.useState<string | undefined>(
    defaultValue ?? undefined,
  );
  const [type, _setType] = React.useState<"default" | "search">(
    defaultType || "default",
  );

  const setType = (newType: "default" | "search") => {
    onTypeChange?.(type, newType);
    _setType(newType);
  };

  const recalcBounds = React.useCallback(() => {
    if (type !== "default") return;
    const container = document.querySelector(
      `[data-slot=tabs]`,
    ) as HTMLElement | null;
    if (!container) return;

    const trigger = container.querySelector(
      `[data-state=active][data-slot=tabs-trigger]`,
    ) as HTMLElement | null;
    if (!trigger) return;

    setBounds({
      width: trigger.offsetWidth,
      height: trigger.offsetHeight,
      top: trigger.offsetTop,
      left: trigger.offsetLeft,
    } as DOMRect);
  }, [type]);

  React.useEffect(() => {
    recalcBounds();
    window.addEventListener("resize", recalcBounds);
    return () => {
      window.removeEventListener("resize", recalcBounds);
    };
  }, [recalcBounds]);

  // React.useLayoutEffect(() => {
  //   recalcBounds();
  // }, [value, type, recalcBounds]);

  return (
    <TabsContext.Provider
      value={{
        bounds,
        value,
        type,
        setBounds,
        recalcBounds,
        setType,
        onTypeChange,
      }}
    >
      {/* <pre className="text-xs fixed top-1 right-1 bg-white/70 backdrop-blur-md rounded-lg p-2 z-100 w-fit">
        {JSON.stringify(bounds, null, 2)}
      </pre> */}
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        data-state={type}
        orientation={orientation}
        className={cn(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          className,
        )}
        value={value}
        onValueChange={(v) => {
          setValue(v);
          onValueChange?.(v);
        }}
        {...props}
      />
    </TabsContext.Provider>
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none relative p-1 gap-2 has-data-[slot=tabs-cheap]:*:data-[state=active]:bg-transparent! has-data-[slot=tabs-cheap]:*:data-[state=active]:shadow-none overflow-hidden group-data-[state=search]/tabs:gap-0 min-h-16 group-data-[state=search]/tabs:min-h-12 min-w-12! animated transition-[gap,min-height,flex,scale] group-data-[state=search]/tabs:active:scale-120",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const { setType, type } = useTabs();
  const ref = React.useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (type === "default") return;
    e.preventDefault();
    setType("default");
  };

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        tabsListVariants({ variant }),
        type === "search" && "*:pointer-events-none",
        className,
      )}
      ref={ref}
      onClick={handleClick}
      {...props}
    />
  );
}

function TabsCheap({ className, ...props }: React.ComponentProps<"div">) {
  const { bounds, type } = useTabs();
  const isInitialMount = React.useRef(true);
  const prevProps = React.useRef({ bounds, type });

  const [spring, api] = useSpring(() => ({
    width: bounds.width,
    left: bounds.left,
    config: {
      tension: 240,
      friction: 22,
    },
    immediate: isInitialMount.current,
    onRest: () => {
      isInitialMount.current = false;
    },
  }));

  // const spring = useSpring({
  //   left: bounds ? bounds.left : 0,
  //   width: bounds ? bounds.width : 0,
  //   config: {
  //     tension: 240,
  //     friction: 22,
  //   },
  //   immediate: isInitialMount.current,
  //   onRest: () => {
  //     // After the first render, set the ref to false
  //     isInitialMount.current = false;
  //   },
  // });

  React.useEffect(() => {
    if (type !== "default") {
      // api.start({
      //   width: 0,
      //   left: 0,
      //   immediate: true,
      // });
    } else {
      api.start({
        width: bounds.width,
        left: bounds.left,
        immediate: isInitialMount.current,
      });
    }

    prevProps.current = { bounds, type };
  }, [bounds, type, api]);

  return (
    <a.div
      data-slot="tabs-cheap"
      className={cn(
        "absolute bg-foreground/8 animated transition-[background-color] rounded-full group-data-[orientation=horizontal]/tabs:h-13 group-data-[orientation=vertical]/tabs:w-1.5",
        type === "search" && "bg-transparent",
        className,
      )}
      style={spring}
      {...props}
    />
  );
}

const AnimatedTabsTrigger = a(TabsPrimitive.Trigger);

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { type, value } = useTabs();

  const [bounds, setBounds] = React.useState<DOMRect>({
    width: 0,
    left: 0,
  } as DOMRect);

  const calcBounds = React.useCallback(() => {
    const trigger = document.querySelector(
      `[data-value=${props.value}][data-slot=tabs-trigger]`,
    ) as HTMLElement | null;
    if (!trigger)
      return {
        width: 0,
        left: 0,
      } as DOMRect;

    return {
      width: type === "search" ? bounds.width : trigger.offsetWidth,
      left: trigger.offsetLeft,
    } as DOMRect;
  }, []);

  React.useEffect(() => {
    const newBounds = calcBounds();
    if (newBounds) setBounds(newBounds);
  }, [calcBounds, props.value]);

  const spring = useSpring({
    // width: type === "search" ? (value !== props.value ? 0 : 46) : bounds.width,
    height: type === "search" ? 46 : 52,
    opacity: type === "search" && value !== props.value ? 0 : 1,
    paddingLeft: type === "search" && value === props.value ? 0 : 12,
    paddingRight: type === "search" && value === props.value ? 0 : 12,
    left: type === "search" ? 0 : bounds.left,
    filter:
      type === "search" && value !== props.value ? "blur(4px)" : "blur(0px)",
    config: {
      tension: 240,
      friction: 22,
    },
    // immediate: search, // Disable animation when search is open
    // onRest: (v) => {
    //   boundsRef.current = {
    //     ...boundsRef.current,
    //     width: v.width as number,
    //     left: v.left,
    //   };
    // },
  });

  return (
    <AnimatedTabsTrigger
      data-slot="tabs-trigger"
      data-value={props.value}
      className={cn(
        " inline-flex z-1 h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-muted-foreground transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-1.25 group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        "not-data-[state=active]:hover:bg-black/4 dark:not-data-[state=active]:hover:bg-white/4 cursor-pointer overflow-hidden",
        "group-data-[state=search]/tabs:absolute! group-data-[state=search]/tabs:[&_svg]:size-7! group-data-[state=search]/tabs:[&_svg]:stroke-3 animated transition-[height] [&_svg]:transition-[size,stroke-width]",
        className,
      )}
      style={spring}
      // ref={value === props.value ? ref : undefined}
      {...props}
    />
  );
}

function TabsTriggerLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tabs-trigger-label"
      className={cn(
        "inline-block h-4 animated transition-[height,opacity] group-data-[state=search]/tabs:h-0 group-data-[state=search]/tabs:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

function TabsSearch({ children }: { children: React.ReactNode }) {
  const { type } = useTabs();
  return (
    <div
      className="z-2 bg-card/80 backdrop-blur-sm border border-border rounded-full shadow-lg data-[state=open]:flex-1 size-16 [&>svg]:size-6! data-[state=closed]:active:scale-120 data-[state=closed]:active:bg-white group/tabs-search data-[state=open]:opacity-100 data-[state=open]:h-12! animated transition-[height,flex,opacity,scale,background-color] overflow-hidden"
      data-slot="tabs-search"
      data-state={type === "search" ? "open" : "closed"}
    >
      {children}
    </div>
  );
}
function TabsSearchTrigger() {
  const { setType } = useTabs();
  return (
    <button
      data-slot="tabs-search-trigger"
      onClick={() => setType("search")}
      className="size-16 rounded-full text-foreground hover:text-foreground animated transition-opacity group-data-[state=open]/tabs-search:pointer-events-none  absolute left-4.5 top-1/2 -translate-y-1/2"
    >
      <Search className="group-data-[state=open]/tabs-search:stroke-4 group-data-[state=open]/tabs-search:size-4! animated transition-[stroke,width,height]" />
    </button>
  );
}
function TabsSearchContent() {
  return (
    <div
      data-slot="tabs-search-content"
      className={cn(
        "z-50 flex items-center justify-center px-4 h-full pl-11",
        "animated",
        "group-data-[state=closed]/tabs-search:pointer-events-none group-data-[state=closed]/tabs-search:opacity-0 truncate",
      )}
    >
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        Search content
      </div>
    </div>
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsTriggerLabel,
  TabsContent,
  TabsCheap,
  tabsListVariants,
  TabsSearch,
  TabsSearchTrigger,
  TabsSearchContent,
};
