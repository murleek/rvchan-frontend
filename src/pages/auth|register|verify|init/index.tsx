import AuthWrapper from "@/components/AuthWrapper";
import { useLocation, useNavigate } from "react-router";
import { PAGES } from "@/constants";
import type { AuthWrapperAction } from "@/components/AuthWrapper/types";
import { useState } from "react";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [payload, setPayload] = useState<object>();

  const action = location.pathname.split("/")[1] as AuthWrapperAction;

  return (
    <AuthWrapper
      action={action}
      onChangeAction={(action, payload) => {
        navigate(PAGES[action.toUpperCase() as keyof typeof PAGES]);
        setPayload(payload);
      }}
      payload={payload}
      withBg
    />
  );
};

export default Auth;
