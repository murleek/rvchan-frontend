import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground/80 backdrop-saturate-80 backdrop-contrast-80 backdrop-blur-sm animated transition-colors text-background animate-in fade-in-0 zoom-in-95 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-sm text-xs text-balance overflow-hidden shadow-xl",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "data-[side=bottom]:mt-1 data-[side=left]:mr-2 data-[side=right]:ml-2 data-[side=top]:mb-2",
          "px-3 py-1.5",
          // "drop-shadow-[1px_0_0_var(--border),0_1px_0_var(--border),-1px_0_0_var(--border),0_-1px_0_var(--border),1px_1px_0_var(--border),-1px_1px_0_var(--border),-1px_-1px_0_var(--border),1px_-1px_0_var(--border)]",
          className,
        )}
        {...props}
      >
        {children}
        {/* <TooltipPrimitive.Arrow className="bg-background border-b border-r border-border fill-background z-50 size-2 translate-y-[calc(-50%-1px)] rotate-45 mask-linear-[135deg,transparent_50%,black_50%]" /> */}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
