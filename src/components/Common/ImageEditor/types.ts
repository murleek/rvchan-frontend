export type AspectRatio = {
  label: string;
  value: number; // width / height
};

export const ASPECT_RATIOS: AspectRatio[] = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
  { label: "Свободно", value: 0 },
];
