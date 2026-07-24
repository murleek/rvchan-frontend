import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PwaInstallContext } from "./context";
import useModal from "@/hooks/common/useModal";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const { openModal, closeModal } = useModal("install");

  const isIOS = useMemo(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const iosStandalone =
        // @ts-expect-error - iOS-specific property
        window.navigator.standalone === true;
      setIsStandalone(standalone || iosStandalone);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      openModal();
      console.log("beforeinstallprompt event captured:", e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setInstallPrompt(null);
      closeModal();
      console.log("PWA installed successfully.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", checkStandalone);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      mq.removeEventListener("change", checkStandalone);
    };
  }, [openModal, closeModal]);

  const installPWA = useCallback(async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setIsStandalone(true);
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  const canInstall = !isStandalone && (isIOS || !!installPrompt);

  const value = useMemo(
    () => ({ isStandalone, isIOS, canInstall, installPWA }),
    [isStandalone, isIOS, canInstall, installPWA],
  );

  useEffect(() => {
    console.log({
      isStandalone: value.isStandalone,
      isIOS: value.isIOS,
      canInstall: value.canInstall,
      installPrompt,
      installPWA: installPWA,
    });
  }, [
    value.isStandalone,
    value.isIOS,
    value.canInstall,
    installPrompt,
    installPWA,
  ]);

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
    </PwaInstallContext.Provider>
  );
}
