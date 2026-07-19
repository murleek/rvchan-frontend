import { Rect } from "../types";

export function drawGrid(ctx: CanvasRenderingContext2D, rect: Rect) {
  const thirdW = rect.width / 3;
  const thirdH = rect.height / 3;

  ctx.strokeStyle = "rgba(255,255,255,.4)";
  ctx.lineWidth = 0.5;

  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(rect.x + thirdW * i, rect.y);
    ctx.lineTo(rect.x + thirdW * i, rect.y + rect.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rect.x, rect.y + thirdH * i);
    ctx.lineTo(rect.x + rect.width, rect.y + thirdH * i);
    ctx.stroke();
  }
}
