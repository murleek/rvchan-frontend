import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/providers/AuthProvider";

const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
