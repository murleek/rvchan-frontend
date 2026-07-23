import useModal from "@/hooks/common/useModal";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FC } from "react";

const InstallModal: FC = () => {
  const { isOpen, closeModal } = useModal("install");
  const { isIOS } = usePwaInstall();

  // Don't render anything if not iOS (Android/Desktop install is handled by openInstallDialog)
  if (!isIOS) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal()}>
      <DialogContent
        className="p-0 gap-0 max-w-sm"
        aria-describedby={undefined}
        onClose={() => closeModal()}
      >
        <div className="md:rounded-t-xl backdrop-blur-xs mask-b-from-40% mask-b-to-100% absolute left-0 top-0 bottom-0 pointer-events-none z-1 w-full h-20" />
        <div className="md:rounded-t-xl mask-b-from-10% mask-b-to-80% bg-background/80 absolute left-0 top-0 bottom-0 pointer-events-none z-1 w-full h-20 animated transition-colors" />

        <DialogHeader className="p-5 py-4 absolute top-0 left-0 w-full z-10">
          <DialogTitle>
            <span className="text-lg font-bold">Install RVChan</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 p-5 pt-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-neutral-800">
            <svg
              className="size-10 text-neutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
              />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">Install RVChan</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Add to your home screen for quick access and offline support
            </p>
          </div>
        </div>

        <div className="mx-5 mb-5 rounded-xl bg-neutral-800 p-4">
          <h3 className="mb-2 text-sm font-medium text-neutral-200">
            How to install on iPhone/iPad:
          </h3>
          <ol className="space-y-2 text-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-xs font-medium text-neutral-200">
                1
              </span>
              Tap the{" "}
              <span className="inline-flex items-center gap-1 rounded bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-200">
                <svg
                  className="size-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.987 7.279a2.479 2.479 0 01-1.192-2.101c0-1.175.792-2.11 1.192-2.101.082-.002.323-.258.555-.697.481-.956.235-1.88.235-1.88s-.858.186-1.82.186c-.957 0-1.797.302-2.553.68A4.87 4.87 0 008.87 2.2C8.153 1.53 7.282 1.12 6.3 1.12c-1.574 0-2.853 1.245-2.853 2.78 0 .217.025.427.074.63C2.293 4.8.74 6.02.74 8.585c0 2.05 1.114 3.918 2.824 4.894.168-.851.588-1.618 1.2-2.19a3.635 3.635 0 01-.222-1.321c0-2.08 1.605-3.767 3.583-3.767.12 0 .238.006.354.018.268-.344.61-.63 1.02-.84.296-.152.627-.26.983-.31a4.852 4.852 0 011.478-1.818 2.868 2.868 0 01.807-1.058c.2.162.398.354.585.583.136.167.26.353.37.556l.016.03c-.347.2-.66.461-.928.774a3.526 3.526 0 00-.84 1.637c-.024.126-.04.255-.04.388 0 1.965 1.59 3.558 3.553 3.558.066 0 .131-.002.197-.006.29.305.51.659.65 1.043.23.631.308 1.29.251 1.933a4.753 4.753 0 001.439-2.074c.703-1.755.244-3.716-1.095-4.863z" />
                </svg>
                Share
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-xs font-medium text-neutral-200">
                2
              </span>
              Scroll down and tap{" "}
              <span className="inline-flex items-center gap-1 rounded bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-200">
                <svg
                  className="size-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.5 1A1.5 1.5 0 0111 2.5v5.75a.75.75 0 01-1.5 0V2.5a.5.5 0 00-1 0v5.75a.75.75 0 01-1.5 0V2.5A1.5 1.5 0 019.5 1z" />
                  <path d="M5.25 7a1.75 1.75 0 00-1.75 1.75v7.5c0 .966.784 1.75 1.75 1.75h8.5a1.75 1.75 0 001.75-1.75v-7.5A1.75 1.75 0 0013.75 7h-8.5z" />
                </svg>
                Add to Home Screen
              </span>
            </li>
          </ol>
        </div>

        <div className="flex gap-2 p-5 pt-0">
          <button
            onClick={closeModal}
            className="w-full rounded-xl bg-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-600"
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallModal;
