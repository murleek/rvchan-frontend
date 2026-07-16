import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

function Textarea({
  className,
  wrapClassName,
  ...props
}: ComponentProps<"textarea"> & { wrapClassName?: string }) {
  return (
    <div
      className={cn(
        "has-focus-visible:border-ring has-focus-visible:ring-ring/50 has-aria-invalid:ring-destructive/20 has-focus-visible:ring-[3px] rounded-md dark:has-aria-invalid:ring-destructive/40 transition-[color,box-shadow,border] overflow-hidden! shadow-xs has-aria-invalid:border-destructive border border-input",
        wrapClassName,
      )}
    >
      <textarea
        data-slot="textarea"
        className={cn(
          "placeholder:text-muted-foreground dark:bg-input/30 flex field-sizing-content min-h-16 w-full  bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { Textarea };
