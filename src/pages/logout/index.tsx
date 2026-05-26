import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

const Logout = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <p>Logging out...</p>;
};

export default Logout;
