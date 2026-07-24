import { Button } from "@/components/ui/button";
import clsx from "clsx";
import type { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";

type ErrorViewProps = {
  errorCode?: string;
  color?: string;
  stack?: ReactNode;
  noReload?: boolean;
} & (
  | {
      title: string;
      message: string;
      t?: never;
    }
  | {
      title?: never;
      message?: never;
      t: string;
    }
);

const ErrorView: FC<ErrorViewProps> = ({
  title,
  message,
  t: tKey,
  errorCode,
  stack,
  noReload,
  color,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        "flex min-h-full w-full flex-col items-center justify-center px-2 text-center text-red-800 dark:text-red-100 animated transition-colors",
        color,
      )}
    >
      <div className="flex max-w-3xl w-full flex-col items-center gap-2">
        <h1 className="animated ml-4 text-3xl font-extrabold">
          {title || t(`errorBoundary.${tKey}.title`)}
        </h1>
        <span className="animated ml-4">
          {message || t(`errorBoundary.${tKey}.message`)}
        </span>
        {stack && (
          <div
            className={clsx(
              "animated px-2 py-1 text-sm rounded-md w-full overflow-hidden",
              "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-100",
            )}
          >
            <pre
              className={clsx(
                "overflow-x-auto animated text-left text-sm px-2 py-1",
                "scrollbar-bg-red-100 scrollbar-red-300 dark:scrollbar-bg-red-950 dark:scrollbar-red-400",
              )}
            >
              {stack}
            </pre>
          </div>
        )}
        {errorCode && (
          <code
            className={clsx(
              "animated rounded-sm px-2 py-1 font-bold text-sm",
              "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-100",
            )}
          >
            {errorCode}
          </code>
        )}

        {!noReload && (
          <Button className="mt-12" onClick={() => window.location.reload()}>
            {t("errorBoundary.reload")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorView;
