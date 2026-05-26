import type { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Loader from "../Loader";
import useDots from "@/hooks/common/useDots";
import clsx from "clsx";

type PageLoaderProps = {
  label?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const PageLoader: FC<PageLoaderProps> = ({ label, className, ...props }) => {
  label = label || useTranslation().t("loader.init");

  const dots = useDots();

  return (
    <div
      className={clsx(
        "flex h-dvh flex-col items-center justify-center gap-4",
        className,
      )}
      {...props}
    >
      <Loader className="text-fuchsia-500 size-12" />
      <span className="relative font-medium text-muted-foreground animated transition-colors">
        {label}
        <span className="absolute left-full tracking-wider">{dots}</span>
      </span>
    </div>
  );
};

export default PageLoader;
