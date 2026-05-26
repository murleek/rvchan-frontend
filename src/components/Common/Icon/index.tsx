import clsx from "clsx";
import type { FC } from "react";

type IconProps = {
  name: string;
  className?: string;
  fill?: boolean;
  weight?: number;
  grade?: number;
  opsz?: number;
};

const Icon: FC<IconProps> = ({
  name,
  className,
  fill,
  weight,
  grade,
  opsz,
}) => (
  <span
    className={clsx("material-symbols-rounded block!", className)}
    style={{
      fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight || 400}, 'GRAD' ${grade || 0}, 'opsz' ${opsz || 24}`,
    }}
  >
    {name}
  </span>
);

export default Icon;
