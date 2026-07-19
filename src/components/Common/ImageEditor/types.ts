export type AspectRatio = {
  label: string;
  value: number; // width / height
};

export type CropShape = "circle" | "rect";
export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Size = { w: number; h: number };

export type Handle = "tl" | "tr" | "bl" | "br" | "tm" | "bm" | "lm" | "rm";
