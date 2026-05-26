import {
  useState,
  useRef,
  type FC,
  type TextareaHTMLAttributes,
  type ReactNode,
  memo,
  useEffect,
  type ChangeEvent,
} from "react";
import clsx from "clsx";
import { useSpring, animated } from "@react-spring/web";
// import { CheckLg, ExclamationCircleFill } from 'react-bootstrap-icons';

type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "type"
> & {
  label?: ReactNode;
  status?: string;
  error?: boolean;
  success?: boolean;
  dontShowStatus?: boolean;
  labelClassName?: string;
};

const Textarea: FC<TextareaProps> = ({
  error,
  success,
  label,
  placeholder,
  status,
  className,
  labelClassName,
  dontShowStatus,
  ...props
}) => {
  const [value, setValue] = useState(props.value || "");
  const ref = useRef<HTMLTextAreaElement>(null);

  const calcHeight = () => {
    if (!ref.current) return 70;
    ref.current.style.height = "auto";
    const height = Math.min(Math.max(ref.current.scrollHeight + 2, 70), 320);
    ref.current.style.height = `100%`;
    return height;
  };

  const [styles, api] = useSpring(() => ({
    height: calcHeight(),
    config: { tension: 200, friction: 20 },
  }));

  useEffect(() => {
    const height = calcHeight();
    api.start({ height });
  }, [value, api]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const height = calcHeight();
    api.start({ height }); // обновляем анимацию при вводе
    props.onChange?.(e);
  };

  return (
    <div
      className={clsx("group w-full", error && "error", success && "success")}
    >
      {label && (
        <label
          htmlFor={props.id}
          className={clsx(
            "mb-1 block text-sm font-medium text-gray-900 transition-all",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <animated.div
        style={styles}
        className={clsx(
          "relative overflow-hidden",
          "border-blue-900/60 relative w-full rounded-lg border bg-white",
          "focus:border-blue-800 focus:ring-blue-800/20 focus:ring-3 group-[.error]:focus:ring-red-500/20",
          "group-[.success]:500/30 group-[.success]:border-blue-700",
          "group-[.error]:border-red-600! group-[.error]:text-red-950",
          "autofill:border-amber-400 autofill:shadow-[inset_0_0_0_40rem] autofill:shadow-white",
          "autofill:focus:border-amber-500 autofill:focus:ring-3 autofill:focus:ring-amber-500/20",
          className,
        )}
      >
        <textarea
          {...props}
          className={clsx(
            "px-4 py-2.5",
            "scrollbar-bg-white resize-none focus:outline-none",
            "h-full w-full",
            (error || success) && "pr-10",
          )}
          ref={ref}
          placeholder={placeholder || "Введіть текст"}
          value={value}
          onChange={handleChange}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {!error && success && "✓"}
        </div>
      </animated.div>
      {status ? (
        <div
          key="showing"
          className="animated mt-0.5 flex min-h-5 animate-[fadeIn_0.3s_ease-in-out] items-center gap-1 text-gray-500 transition-all group-[.error]:text-red-600 starting:-translate-y-1"
        >
          {error && "!"}
          <span className="text-xs font-medium">{status}</span>
        </div>
      ) : (
        !dontShowStatus && <div key="hidden" className="mt-0.5 h-5" />
      )}
    </div>
  );
};

export default memo(Textarea);
