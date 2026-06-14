import { forwardRef, type CSSProperties, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";
import useDisplacementFilter, {
  type DisplacementOptions,
} from "./getDisplacementFilter";

import { useMeasure } from "@uidotdev/usehooks";
import clsx from "clsx";

type GlassElementProps = Omit<DisplacementOptions, "height" | "width"> & {
  children?: ReactNode | undefined;
  wrapClassName?: string;
  blur?: number;
  debug?: boolean;
  elRef?: React.Ref<HTMLDivElement>;
} & React.ComponentProps<"div">;

export const GlassElement: FC<GlassElementProps> = forwardRef(
  (
    {
      depth,
      radius,
      children,
      strength,
      chromaticAberration,
      blur = 2,
      className,
      wrapClassName,
      style,
      name = Math.random().toString(36).substring(2, 9),
    },
    ref,
  ) => {
    const [childRef, { width, height }] = useMeasure();

    const [Element, filterName] = useDisplacementFilter({
      height: height || 0,
      width: width || 0,
      radius,
      depth,
      strength,
      chromaticAberration,
      name: `lg-${name}`,
    });

    /* Change element depth on click */
    // const [clicked, setClicked] = useState(false);
    // const depth = baseDepth / (clicked ? 0.7 : 1);

    return (
      <div
        className={clsx(
          "liquid bg-card/40 inset-shadow-[0_0_4px_0_rgba(255,255,255,0.5)] dark:inset-shadow-[0_0_4px_0_rgba(0,0,0,0.5)] cursor-pointer",
          wrapClassName,
        )}
        style={
          {
            "--liquid-filter": `url("#${filterName}")`,
            "--liquid-blur": `${blur}px`,
            "--liquid-radius": `${radius}px`,
            ...style,
          } as CSSProperties & {
            "--liquid-filter": string;
            "--liquid-blur": string;
            "--liquid-radius": string;
          }
        }
        // onMouseDown={() => setClicked(true)}
        // onMouseUp={() => setClicked(false)}
        ref={ref}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div ref={childRef} className={className}>
          {children}
        </div>
        {createPortal(<Element />, document.getElementById("svg")!)}
      </div>
    );
  },
);
