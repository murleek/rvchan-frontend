import { createContext } from "react";

export interface PwaInstallContextValue {
  isStandalone: boolean;
  isIOS: boolean;
  canInstall: boolean;
  installPWA: () => void;
}

export const PwaInstallContext = createContext<PwaInstallContextValue>({
  isStandalone: false,
  isIOS: false,
  canInstall: false,
  installPWA: () => {},
});
