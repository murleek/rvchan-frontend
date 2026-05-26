import AuthWrapper from "@/components/AuthWrapper";
import { useLocation, useNavigate } from "react-router";
import { PAGES } from "@/constants";
import type { AuthWrapperAction } from "@/components/AuthWrapper/types";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const action = location.pathname.split("/")[1] as AuthWrapperAction;

  return (
    <AuthWrapper
      action={action}
      onChangeAction={(action) =>
        navigate(PAGES[action.toUpperCase() as keyof typeof PAGES])
      }
      withBg
    />
  );
};

export default Auth;
