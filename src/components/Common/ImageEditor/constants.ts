import type { AspectRatio } from "./types";

export const HANDLE_SIZE = 12;
export const HANDLE_HIT_AREA = 24;
export const HANDLE_STROKE = 1.5;

export const MIN_CROP_SIZE = 30;

export const GRID_HORIZONTAL_GAP = 20;
export const GRID_ZOOM_TRANSITION_MS = 250;

export const MAX_IMAGE_ZOOM = 10;
export const WHEEL_ZOOM_TRANSITION_MS = 120;

export const ASPECT_RATIOS: AspectRatio[] = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
  { label: "Свободно", value: 0 },
];
