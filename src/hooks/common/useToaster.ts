import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { addToast, type Toast } from "@/app/features/toasts/toasts.slice";

type ToastOptions = Omit<Toast, "id" | "type">;

const useToaster = () => {
  const dispatch = useDispatch();

  const toast = useCallback(
    (type: Toast["type"], options: ToastOptions | string) => {
      const payload =
        typeof options === "string" ? { title: options } : options;

      dispatch(addToast({ type, ...payload }));
    },
    [dispatch],
  );

  return {
    success: (options: ToastOptions | string) => toast("success", options),
    error: (options: ToastOptions | string) => toast("error", options),
    info: (options: ToastOptions | string) => toast("info", options),
    warning: (options: ToastOptions | string) => toast("warning", options),
  };
};

export default useToaster;
