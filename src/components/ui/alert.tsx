import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm " +
    "has-[>[data-slot='avatar']]:grid-cols-[calc(var(--spacing)*10)_1fr] has-[>[data-slot='avatar']]:gap-x-3 [&>[data-slot='avatar']]:size-12 [&>[data-slot='avatar']]:translate-y-0.5 [&>[data-slot='avatar']]:row-span-2 [&>[data-slot='avatar']]:absolute [&>[data-slot='avatar']]:top-1/2 [&>[data-slot='avatar']]:left-1.5 [&>[data-slot='avatar']]:rounded-full [&>[data-slot='avatar']]:-translate-y-1/2 [&>[data-slot='avatar']]:text-current " +
    "has-[>[data-slot='alert-icon']]:grid-cols-[calc(var(--spacing)*10)_1fr] has-[>[data-slot='alert-icon']]:gap-x-3 [&>[data-slot='alert-icon']]:size-12 [&>[data-slot='alert-icon']]:translate-y-0.5 [&>[data-slot='alert-icon']]:row-span-2 [&>[data-slot='alert-icon']]:absolute [&>[data-slot='alert-icon']]:top-1/2 [&>[data-slot='alert-icon']]:left-1.5 [&>[data-slot='alert-icon']]:rounded-full [&>[data-slot='alert-icon']]:-translate-y-1/2 [&>[data-slot='alert-icon']]:text-current ",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
