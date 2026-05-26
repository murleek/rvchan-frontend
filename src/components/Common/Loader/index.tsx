import clsx from "clsx";
import type { FC } from "react";

export type LoaderProps = {
  className?: string;
  strokeWidth?: number;
};

const Loader: FC<LoaderProps> = ({ className, strokeWidth = 4 }) => {
  return (
    <svg
      className={clsx(className, "size-8 animate-spin")}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      ></circle>
      <path
        className="opacity-75"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        d="
          M 12 2
          a 10 10 0 0 1 0 20
        "
      />
    </svg>
  );
};

export default Loader;
