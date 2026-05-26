import { useDispatch, useSelector } from "react-redux";
import { useTransition, animated, config } from "@react-spring/web";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  X,
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  Smartphone,
  type LucideProps,
} from "lucide-react";
import {
  removeToast,
  selectToasts,
  type Toast,
  type ToastType,
} from "@/app/features/toasts/toasts.slice";
import ProfileAvatar from "../ProfileAvatar";
import { useEffect } from "react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
  warning: TriangleAlert,
  smartphone: Smartphone,
};

const VARIANTS: Record<ToastType, string> = {
  success: "border-emerald-500/30 bg-emerald-500/5 [&>svg]:text-emerald-500",
  error: "border-destructive/30 bg-destructive/5 [&>svg]:text-destructive",
  info: "",
  warning: "border-amber-500/30 bg-amber-500/5 [&>svg]:text-amber-500",
};

const DEFAULT_DURATION = 4000;

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useDispatch();
  const duration = toast.duration ?? DEFAULT_DURATION;

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, duration);

    return () => clearTimeout(timer);
  }, [dispatch, toast.id, duration]);

  const IconComponent =
    toast.icon?.type === "icon"
      ? toast.icon.name
        ? ICONS[toast.icon.name]
        : ICONS[toast.type]
      : null;

  return (
    <Alert
      className={`relative overflow-hidden pr-8 shadow-sm ${VARIANTS[toast.type]}`}
    >
      {toast.icon?.type === "icon" ? (
        <div
          className="border size-12 rounded-full flex items-center bg-blue-100 justify-center"
          data-slot="alert-icon"
        >
          {IconComponent && <IconComponent className="size-1/2" />}
        </div>
      ) : (
        <ProfileAvatar src={toast.icon?.cdn} alt="icon" className="size-12" />
      )}
      <AlertTitle className="text-sm font-medium leading-none">
        {toast.title}
      </AlertTitle>
      {toast.description && (
        <AlertDescription className="text-xs text-muted-foreground mt-0.5">
          {toast.description}
        </AlertDescription>
      )}

      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="absolute right-2 top-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        aria-label="Закрыть"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </Alert>
  );
}

export function Toaster() {
  const toasts = useSelector(selectToasts);

  const transitions = useTransition(toasts, {
    keys: (t) => t.id,
    from: {
      opacity: 0,
      transform: "translateX(16px)",
      maxHeight: "0px",
      marginBottom: "0px",
    },
    enter: {
      opacity: 1,
      transform: "translateX(0px)",
      maxHeight: "120px",
      marginBottom: "8px",
    },
    leave: {
      opacity: 0,
      transform: "translateX(16px)",
      maxHeight: "0px",
      marginBottom: "0px",
    },
    config: config.stiff,
  });

  return (
    <div className="fixed pointer-events-none md:bottom-4 md:right-4 top-2 max-md:left-1/2 max-md:-translate-x-1/2 gap-1 z-50 items-center flex w-dvw max-w-100 md:max-w-80 px-2 flex-col-reverse">
      {transitions((style, toast) => (
        <animated.div className={"pointer-events-auto w-full"} style={style}>
          <ToastItem toast={toast} />
        </animated.div>
      ))}
    </div>
  );
}
