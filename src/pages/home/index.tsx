import Feed from "@/components/Feed";
import BigHeader from "@/components/Header/components/BigHeader";
import { useHeader } from "@/hooks/common/useHeader";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation("home");
  useHeader(t("header"), { hideTitle: true });

  return (
    <div>
      <BigHeader>{t("header")}</BigHeader>
      <Feed />
    </div>
  );
};

export default HomePage;
