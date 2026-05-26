import type { Profile } from "@/app/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";
import { User2 } from "lucide-react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { Suspense, useEffect, useRef } from "react";

const ProfileAvatar = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg";
  src?: Profile["avatar"];
  alt?: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        const width = ref.current.offsetWidth;
        let closestSize: number;
        if (width <= 32) closestSize = 32;
        else if (width <= 128) closestSize = 128;
        else if (width <= 512) closestSize = 512;
        else closestSize = 1024;

        const img = new Image();
        img.onload = () => {
          if (ref.current) {
            ref.current.querySelector("img")?.setAttribute("src", img.src);
          }
        };
        img.src = props.src?.[closestSize] ?? "";
      }
    };

    handleResize();
  }, [props.src]);

  return (
    <Suspense
      fallback={
        <Avatar
          className={clsx("h-8 w-8 border rounded-lg animated", className)}
          {...props}
        >
          <AvatarFallback className="rounded-lg">
            <User2 className="size-1/2" />
          </AvatarFallback>
        </Avatar>
      }
    >
      <Avatar
        className={clsx("h-8 w-8 border rounded-lg animated", className)}
        ref={ref}
        {...props}
      >
        <AvatarImage
          src={props.src?.[128] ?? undefined}
          alt={props.alt || "User's avatar"}
        />
        <AvatarFallback className="rounded-lg">
          <User2 className="size-1/2" />
        </AvatarFallback>
      </Avatar>
    </Suspense>
  );
};

export default ProfileAvatar;
