import type { Notification, ParsedUserAgent } from "@/app/types/notification";
import type { FC } from "react";
// import { useTranslation } from "react-i18next";
import { Smartphone } from "lucide-react";
import useRelativeTime from "@/hooks/useRelativeTime";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import clsx from "clsx";

type NewDeviceNotificationProps = {
  notification: Notification;
};

const NewDeviceNotification: FC<NewDeviceNotificationProps> = ({
  notification,
}) => {
  // const { t } = useTranslation("notification");

  const time = useRelativeTime(notification.createdAt, "long");

  const { device, ip } = notification.payload as {
    device: ParsedUserAgent;
    ip: string;
  };
  return (
    <div
      className={clsx(
        "flex gap-3 p-2",
        !notification.isRead && "bg-amber-600/8",
      )}
    >
      <div className="border size-12 rounded-full flex-none flex items-center bg-blue-100 justify-center">
        <Smartphone className="size-1/2 text-blue-700" />
      </div>
      <div className="flex flex-col gap-1 leading-4 w-full mt-1">
        <b>
          {device.deviceType !== "desktop"
            ? "Новое устройство"
            : "Новый компьютер"}{" "}
          {device.deviceVendor ||
            (device.deviceModel &&
              `{device.deviceVendor} {device.deviceModel}`)}{" "}
          на {device.os || "неизвестной ОС"} {device.osVersion}
        </b>
        <div className="w-full block leading-5 align-bottom">
          <span className="text-base/5 align-bottom">
            {device.browser || "Неизвестный браузер"} {device.browserVersion}{" "}
            &bull; {ip || "Неизвестный IP"}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground float-right text-xs align-bottom inline-block pt-1 ml-2">
                {time}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs font-bold shadow-lg text-sm/4"
            >
              {new Date(notification.createdAt).toLocaleString("ru-RU", {
                dateStyle: "long",
                timeStyle: "medium",
              })}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default NewDeviceNotification;
