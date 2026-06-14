import type { FC } from "react";
import { getDisplacementMap } from "./getDisplacementMap";

export type DisplacementOptions = {
  height: number;
  width: number;
  radius: number;
  depth: number;
  strength?: number;
  chromaticAberration?: number;
  name: string;
};

const useDisplacementFilter = ({
  height,
  width,
  radius,
  depth,
  strength = 100,
  chromaticAberration = 0,
  name,
}: DisplacementOptions): [FC, string] => {
  const element = (
    <svg
      height={height}
      width={width}
      viewBox={`0 0 ${width} ${height}`}
      className="hidden"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={name + "-displace"} colorInterpolationFilters="sRGB">
          <feImage
            x="0"
            y="0"
            height={height}
            width={width}
            href={getDisplacementMap({
              height,
              width,
              radius,
              depth,
              name,
            })}
            result="displacementMap"
          />
          <feDisplacementMap
            transform-origin="center"
            in="SourceGraphic"
            in2="displacementMap"
            scale={strength + chromaticAberration * 2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            result="displacedR"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementMap"
            scale={strength + chromaticAberration}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            result="displacedG"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementMap"
            scale={strength}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                          0 0 0 0 0
                          0 0 1 0 0
                          0 0 0 1 0"
            result="displacedB"
          />
          <feBlend in="displacedR" in2="displacedG" mode="screen" />
          <feBlend in2="displacedB" mode="screen" />
        </filter>
      </defs>
    </svg>
  );

  return [() => element, name + "-displace"] as const;
};

export default useDisplacementFilter;
