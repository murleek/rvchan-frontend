import PageLoader from "@/components/Common/PageLoader";
import { PAGES } from "@/constants";
import useAuth from "@/hooks/useAuth";
import type { FC } from "react";
import { Navigate } from "react-router";

const RootPage: FC = () => {
  const auth = useAuth();

  if (auth.isLoading) {
    return <PageLoader />;
  }

  if (!auth.profile) {
    return <Navigate to={PAGES.LOGIN} replace />;
  }

  return (
    <Navigate
      to={PAGES.USER.replace(":username", auth.profile.username)}
      replace
    />
  );
};

export default RootPage;
