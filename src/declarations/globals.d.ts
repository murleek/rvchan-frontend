declare const __VERSION__: string;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "virtual:pwa-register" {
  export type RegisterSWOptions = {
    immediate?: boolean;
    onNeedSWUpdate?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (
      registration: ServiceWorkerRegistration | undefined,
    ) => void;
    onRegisterError?: (error: any) => void;
  };
  export function registerSW(
    options?: RegisterSWOptions,
  ): (reloadPage?: boolean) => Promise<void>;
}

declare module "virtual:pwa-register/react" {
  export type RegisterSWOptions = {
    immediate?: boolean;
    onNeedSWUpdate?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (
      registration: ServiceWorkerRegistration | undefined,
    ) => void;
    onRegisterError?: (error: any) => void;
  };
  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, (val: boolean) => void];
    offlineReady: [boolean, (val: boolean) => void];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
