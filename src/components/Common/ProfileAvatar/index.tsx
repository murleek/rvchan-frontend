import type { Profile } from "@/app/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { User2 } from "lucide-react";
import clsx from "clsx";

const ProfileAvatar = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg";
  src?: Profile["avatar"];
  alt?: string;
}) => {
  return (
    <Avatar
      className={clsx("h-8 w-8 border rounded-lg animated", className)}
      size={props.size}
      {...props}
    >
      <AvatarImage
        src={props.src}
        sizes="(max-width: 640px) 32px, (max-width: 768px) 128px, (max-width: 1024px) 512px, 1024px"
        alt={props.alt || "User's avatar"}
      />
      <AvatarFallback className="rounded-lg">
        <User2 className="size-1/2" />
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
