import useModal from "@/hooks/common/useModal";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import type { FC } from "react";
import SafariInstall from "./components/SafariInstall";
import BeforeInstall from "./components/BeforeInstall";

const InstallModal: FC = () => {
  const { isOpen, closeModal } = useModal("install");
  const { isIOS } = usePwaInstall();

  if (isIOS) {
    return <SafariInstall open={isOpen} onOpenChange={() => closeModal()} />;
  }

  return <BeforeInstall open={isOpen} onOpenChange={() => closeModal()} />;
};

export default InstallModal;
