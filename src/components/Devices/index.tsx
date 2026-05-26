import { useGetDevicesQuery } from "@/app/features/user/user.api";
import clsx from "clsx";
import { useMemo, type FC } from "react";
import Device from "./components/Device";
import useAuth from "@/hooks/useAuth";
import { Card } from "../ui/card";
import Loader from "../Common/Loader";
import { useTranslation } from "react-i18next";

const Devices: FC = () => {
  const { data: devices, isLoading, isFetching } = useGetDevicesQuery();
  const { jwtPayload } = useAuth();
  const { t } = useTranslation("settings");

  const thisDeviceId = jwtPayload?.deviceId;

  const sortedDevices = useMemo(() => {
    if (!devices) return [];

    return [...devices]
      .sort((a, b) => {
        return a.id === thisDeviceId
          ? -1
          : b.id === thisDeviceId
            ? 1
            : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .map((device) => ({
        ...device,
        currentDevice: device.id === thisDeviceId,
      }));
  }, [devices, thisDeviceId]);

  return isLoading ? (
    <Card className="px-4 gap-2 h-40 justify-center items-center">
      <Loader className="text-fuchsia-500 size-10!" />
      <span className="text-center text-muted-foreground animated transition-colors block">
        {t("devices.loading")}
      </span>
    </Card>
  ) : sortedDevices && sortedDevices.length > 0 ? (
    <div className="w-full flex flex-col gap-2">
      {sortedDevices.map((device) => (
        <Device
          key={device.id}
          className={clsx(
            "animated",
            isFetching && "pointer-events-none opacity-50",
          )}
          device={device}
          currentDevice={device.currentDevice}
        />
      ))}
    </div>
  ) : (
    <div>{t("devices.empty")}</div>
  );
};

export default Devices;
