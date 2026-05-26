import PageLoader from "@/components/Common/PageLoader";
import InitPage from "@/components/AuthWrapper/components/Init";
import { PAGES } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";

const Init = () => {
  const { profile, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return <PageLoader label={t("loader.profile")} />;
  }

  if (!profile) {
    return <Navigate to={PAGES.LOGIN} replace />;
  }

  return <InitPage />;
};

export default Init;
