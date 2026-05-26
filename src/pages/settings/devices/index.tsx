import Devices from "@/components/Devices";
import BigHeader from "@/components/Header/components/BigHeader";
import { useHeader } from "@/hooks/common/useHeader";
import { useTranslation } from "react-i18next";

const DevicesPage = () => {
  const { t } = useTranslation("settings");
  useHeader(t("devices.header"), { hideTitle: true });

  return (
    <div>
      <BigHeader>{t("devices.header")}</BigHeader>
      <Devices />
    </div>
  );
};

export default DevicesPage;
