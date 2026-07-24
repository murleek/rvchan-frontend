import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";

export function PwaUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  // if (offlineReady) {
  //   return (
  //     <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
  //       <div className="flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 shadow-lg">
  //         <p className="flex-1 text-sm text-neutral-100">
  //           App ready to work offline
  //         </p>
  //         <button
  //           onClick={close}
  //           className="whitespace-nowrap rounded-md bg-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-600"
  //         >
  //           Got it
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // if (needRefresh) {
  //   return (
  //     <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
  //       <div className="flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 shadow-lg">
  //         <p className="flex-1 text-sm text-neutral-100">
  //           New version available
  //         </p>
  //         <button
  //           onClick={() => updateServiceWorker(true)}
  //           className="whitespace-nowrap rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
  //         >
  //           Update
  //         </button>
  //         <button
  //           onClick={close}
  //           className="whitespace-nowrap rounded-md bg-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-600"
  //         >
  //           Dismiss
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return null;
}
