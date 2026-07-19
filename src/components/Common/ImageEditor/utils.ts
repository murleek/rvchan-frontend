export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function fitSize(
  width: number,
  height: number,
  maxSize: { width: number; height: number },
) {
  const scale = Math.min(maxSize.width / width, maxSize.height / height, 1);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}
