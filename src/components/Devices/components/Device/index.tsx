import useRelativeTime from "@/hooks/useRelativeTime";
import { type Device as DeviceType } from "@/app/types/auth";
import { useLogoutDeviceMutation } from "@/app/features/user/user.api";
import { memo, type FC } from "react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { Card } from "@/components/ui/card";
import { Trans, useTranslation } from "react-i18next";
import Loader from "@/components/Common/Loader";

type DeviceProps = {
  device: DeviceType;
  className?: string;
  currentDevice?: boolean;
};

const Device: FC<DeviceProps> = ({ device, className, currentDevice }) => {
  const deviceUpdatedAt = useRelativeTime(device.updatedAt, "long");
  const [logoutDevice, { isLoading }] = useLogoutDeviceMutation();
  const { t } = useTranslation("settings");

  return (
    <Card
      className={clsx(
        "p-4 flex flex-col gap-4",
        currentDevice
          ? "border-fuchsia-500 inset-ring inset-ring-fuchsia-500 mb-3"
          : "border-border",
        isLoading && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-lg/5 font-semibold">
          {t("devices.deviceInfo", {
            vendorModel: clsx(
              device.userAgent.deviceVendor ??
                t(
                  device.userAgent.deviceType !== "desktop"
                    ? "devices.device"
                    : "devices.pc",
                ),
              device.userAgent.deviceModel,
            ),
            os: device.userAgent.os,
            osVersion: device.userAgent.osVersion,
          })}
        </h1>

        {/* <h1>
          {device.userAgent.deviceVendor || device.userAgent.deviceModel ? (
            <>
              {device.userAgent.deviceVendor} {device.userAgent.deviceModel}{" "}
              на{" "}
            </>
          ) : device.userAgent.deviceType !== "desktop" ? (
            "Устройство на "
          ) : (
            "Компьютер на "
          )}
          {device.userAgent.os || "неизвестной ОС"} {device.userAgent.osVersion}
        </h1> */}
        <span className="text-base/5">
          {t("devices.browserInfo", {
            browser: device.userAgent.browser || t("devices.unknownBrowser"),
            version: device.userAgent.browserVersion || "",
          })}
        </span>
        <span
          className={`text-sm/5 ${currentDevice ? "text-fuchsia-500" : "text-muted-foreground"} inline-flex gap-2 items-center animated transition-colors`}
        >
          {/* {t("devices.info", {
            ip: device.ip || t("devices.unknownIP"),
            lastUsed: currentDevice
              ? t("devices.currentDevice")
              : deviceUpdatedAt,
          }, {})} */}
          <Trans
            i18nKey="settings:devices.info"
            ns="settings"
            values={{
              ip: device.ip || t("devices.unknownIP"),
              lastUsed: currentDevice
                ? t("devices.currentDevice")
                : deviceUpdatedAt,
              bull: currentDevice ? "" : "•",
            }}
            components={{
              bull: currentDevice ? (
                <span className="relative inline-flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                </span>
              ) : (
                <span />
              ),
            }}
          />
        </span>
      </div>

      {currentDevice ? null : (
        <Button
          disabled={isLoading}
          className="rounded-full h-10 font-black text-md"
          variant="destructive"
          onClick={() => logoutDevice(device.id)}
        >
          {isLoading ? (
            <>
              <Loader className={"size-4!"} />
              {t("devices.logout.loading")}
            </>
          ) : (
            t("devices.logout.button")
          )}
        </Button>
      )}
    </Card>
  );
};

export default memo(Device);
