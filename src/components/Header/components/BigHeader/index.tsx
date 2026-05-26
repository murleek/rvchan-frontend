import clsx from "clsx";
import { type FC } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import useScrollHidden from "../../hooks/useScrollHidden";

const BigHeader: FC<
  {
    className?: string;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLHeadingElement>
> = ({ className, children, ...props }) => {
  const hideTitle = useSelector((state: RootState) => state.header.hideTitle);
  const isTitleHidden = useScrollHidden(hideTitle);

  return (
    <h1
      className={clsx(
        "text-4xl font-black mb-4 md:mt-4 animated",
        !isTitleHidden && "opacity-0 pointer-events-none",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
};

export default BigHeader;
