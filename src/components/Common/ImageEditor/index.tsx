import { type FC, useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ASPECT_RATIOS } from "./types";
import { Button } from "@/components/ui/button";

export type ImageEditorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: File | null;
  onSave: (result: File) => void;
  aspectRatio?: number;
  hideAspectRatioSelector?: boolean;
};

type Point = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
type Size = { w: number; h: number };

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const HANDLE_RADIUS = 4;
const HANDLE_HIT_AREA = 16;
const MIN_CROP_SIZE = 30;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const ImageEditorModal: FC<ImageEditorModalProps> = ({
  open,
  onOpenChange,
  image,
  onSave,
  aspectRatio: initialAspectRatio,
  hideAspectRatioSelector = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const getCanvasSize = useCallback((): Size => {
    const c = canvasRef.current;
    if (!c) return { w: 320, h: 320 };
    return { w: c.clientWidth, h: c.clientHeight };
  }, []);

  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(MIN_SCALE);
  const [maxScale, setMaxScale] = useState(MAX_SCALE);
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [aspectRatio, setAspectRatio] = useState<number>(
    initialAspectRatio ?? 0,
  );

  const [cropRect, setCropRect] = useState<Rect>({
    x: 0,
    y: 0,
    width: 320,
    height: 320,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isMovingCrop, setIsMovingCrop] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const lastPointer = useRef<Point>({ x: 0, y: 0 });
  const cropRectRef = useRef<Rect>(cropRect);
  const scaleRef = useRef(scale);
  const posRef = useRef(pos);
  const csRef = useRef<Size>({ w: 320, h: 320 });
  const dragStartRef = useRef<{ point: Point; rect: Rect }>({
    point: { x: 0, y: 0 },
    rect: { x: 0, y: 0, width: 0, height: 0 },
  });
  const isTouchDevice = useRef(false);

  useEffect(() => {
    cropRectRef.current = cropRect;
  }, [cropRect]);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  const getScaledSize = useCallback(
    (img: HTMLImageElement, s: number) => ({
      width: img.width * s,
      height: img.height * s,
    }),
    [],
  );

  const getImageBounds = useCallback((): Rect | null => {
    const img = imgRef.current;
    if (!img) return null;
    const s = scaleRef.current;
    const p = posRef.current;
    const cs = csRef.current;
    const { width, height } = getScaledSize(img, s);
    const left = cs.w / 2 - width / 2 + p.x;
    const top = cs.h / 2 - height / 2 + p.y;
    return { x: left, y: top, width, height };
  }, [getScaledSize]);

  const clampRectToImage = useCallback(
    (rect: Rect): Rect => {
      const bounds = getImageBounds();
      if (!bounds) return rect;
      let { x, y, width, height } = rect;

      // Constrain to ratio if set
      if (aspectRatio > 0) {
        const cr = width / height;
        if (cr > aspectRatio) {
          const nw = height * aspectRatio;
          x += (width - nw) / 2;
          width = nw;
        } else {
          const nh = width / aspectRatio;
          y += (height - nh) / 2;
          height = nh;
        }
      }

      // Clamp to image bounds
      if (x < bounds.x) x = bounds.x;
      if (y < bounds.y) y = bounds.y;
      if (x + width > bounds.x + bounds.width)
        width = Math.max(0, bounds.x + bounds.width - x);
      if (y + height > bounds.y + bounds.height)
        height = Math.max(0, bounds.y + bounds.height - y);
      if (x + width > bounds.x + bounds.width)
        x = bounds.x + bounds.width - width;
      if (y + height > bounds.y + bounds.height)
        y = bounds.y + bounds.height - height;
      if (x < bounds.x) x = bounds.x;
      if (y < bounds.y) y = bounds.y;

      // Re-constrain to ratio after clamping
      if (aspectRatio > 0) {
        const cr = width / height;
        if (cr > aspectRatio) {
          const nw = height * aspectRatio;
          x += (width - nw) / 2;
          width = nw;
        } else {
          const nh = width / aspectRatio;
          y += (height - nh) / 2;
          height = nh;
        }
        if (x < bounds.x) x = bounds.x;
        if (y < bounds.y) y = bounds.y;
        if (x + width > bounds.x + bounds.width)
          x = bounds.x + bounds.width - width;
        if (y + height > bounds.y + bounds.height)
          y = bounds.y + bounds.height - height;
        if (x < bounds.x) x = bounds.x;
        if (y < bounds.y) y = bounds.y;
      }

      if (width < MIN_CROP_SIZE) {
        width = MIN_CROP_SIZE;
        if (x + width > bounds.x + bounds.width)
          x = bounds.x + bounds.width - width;
        if (x < bounds.x) x = bounds.x;
      }
      if (height < MIN_CROP_SIZE) {
        height = MIN_CROP_SIZE;
        if (y + height > bounds.y + bounds.height)
          y = bounds.y + bounds.height - height;
        if (y < bounds.y) y = bounds.y;
      }

      return {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      };
    },
    [getImageBounds, aspectRatio],
  );

  const getBoundedPosition = useCallback(
    (img: HTMLImageElement, position: Point, currentScale: number): Point => {
      const cs = csRef.current;
      const { width, height } = getScaledSize(img, currentScale);
      const halfW = width / 2;
      const halfH = height / 2;
      const maxX = Math.max(0, halfW - cs.w / 2);
      const maxY = Math.max(0, halfH - cs.h / 2);
      return {
        x: clamp(position.x, -maxX, maxX),
        y: clamp(position.y, -maxY, maxY),
      };
    },
    [getScaledSize],
  );

  const constrainRectToRatio = useCallback(
    (rect: Rect, ratio: number, cs: Size): Rect => {
      if (ratio <= 0) return rect;
      let { x, y, width, height } = rect;
      const cr = width / height;
      if (cr > ratio) {
        const nw = height * ratio;
        x += (width - nw) / 2;
        width = nw;
      } else {
        const nh = width / ratio;
        y += (height - nh) / 2;
        height = nh;
      }
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + width > cs.w) x = cs.w - width;
      if (y + height > cs.h) y = cs.h - height;
      return {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      };
    },
    [],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const cs = getCanvasSize();
    if (cs.w <= 0 || cs.h <= 0) return;
    csRef.current = cs;

    canvas.width = cs.w;
    canvas.height = cs.h;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const { width, height } = getScaledSize(img, scale);
    const imgX = cs.w / 2 - width / 2 + pos.x;
    const imgY = cs.h / 2 - height / 2 + pos.y;
    ctx.drawImage(img, imgX, imgY, width, height);

    const rect = cropRect;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, cs.w, rect.y);
    ctx.fillRect(0, rect.y + rect.height, cs.w, cs.h - rect.y - rect.height);
    ctx.fillRect(0, rect.y, rect.x, rect.height);
    ctx.fillRect(
      rect.x + rect.width,
      rect.y,
      cs.w - rect.x - rect.width,
      rect.height,
    );

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    if (aspectRatio > 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        `${Math.round((rect.width / rect.height) * 100) / 100}`,
        rect.x + rect.width / 2,
        rect.y + rect.height - 4,
      );
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 0.5;
    const thirdW = rect.width / 3;
    const thirdH = rect.height / 3;
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

    const handles: { key: string; cx: number; cy: number }[] = [
      { key: "tl", cx: rect.x, cy: rect.y },
      { key: "tr", cx: rect.x + rect.width, cy: rect.y },
      { key: "bl", cx: rect.x, cy: rect.y + rect.height },
      { key: "br", cx: rect.x + rect.width, cy: rect.y + rect.height },
      { key: "tm", cx: rect.x + rect.width / 2, cy: rect.y },
      { key: "bm", cx: rect.x + rect.width / 2, cy: rect.y + rect.height },
      { key: "lm", cx: rect.x, cy: rect.y + rect.height / 2 },
      { key: "rm", cx: rect.x + rect.width, cy: rect.y + rect.height / 2 },
    ];
    for (const h of handles) {
      ctx.beginPath();
      ctx.arc(h.cx, h.cy, HANDLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [pos, scale, getScaledSize, cropRect, aspectRatio, getCanvasSize]);

  // Load image
  useEffect(() => {
    if (!image) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        const cs = getCanvasSize();
        csRef.current = cs;

        const initialScale = Math.min(cs.w / img.width, cs.h / img.height);
        const initialPos = getBoundedPosition(
          img,
          { x: 0, y: 0 },
          initialScale,
        );

        setMinScale(initialScale);
        setMaxScale(initialScale * MAX_SCALE);
        setScale(initialScale);
        setPos(initialPos);

        let initialRect: Rect = { x: 0, y: 0, width: cs.w, height: cs.h };
        if (aspectRatio > 0) {
          initialRect = constrainRectToRatio(initialRect, aspectRatio, cs);
        }

        const { width: scaledW, height: scaledH } = getScaledSize(
          img,
          initialScale,
        );
        const imgLeft = cs.w / 2 - scaledW / 2 + initialPos.x;
        const imgTop = cs.h / 2 - scaledH / 2 + initialPos.y;
        const imgRight = imgLeft + scaledW;
        const imgBottom = imgTop + scaledH;
        let rx = initialRect.x,
          ry = initialRect.y,
          rw = initialRect.width,
          rh = initialRect.height;

        if (rx < imgLeft) rx = imgLeft;
        if (ry < imgTop) ry = imgTop;
        if (rx + rw > imgRight) rw = Math.max(0, imgRight - rx);
        if (ry + rh > imgBottom) rh = Math.max(0, imgBottom - ry);
        if (rx + rw > imgRight) rx = imgRight - rw;
        if (ry + rh > imgBottom) ry = imgBottom - rh;
        if (rx < imgLeft) rx = imgLeft;
        if (ry < imgTop) ry = imgTop;

        if (aspectRatio > 0) {
          const cr = rw / rh;
          if (cr > aspectRatio) {
            const nw = rh * aspectRatio;
            rx += (rw - nw) / 2;
            rw = nw;
          } else {
            const nh = rw / aspectRatio;
            ry += (rh - nh) / 2;
            rh = nh;
          }
          if (rx < imgLeft) rx = imgLeft;
          if (ry < imgTop) ry = imgTop;
          if (rx + rw > imgRight) rx = imgRight - rw;
          if (ry + rh > imgBottom) ry = imgBottom - rh;
          if (rx < imgLeft) rx = imgLeft;
          if (ry < imgTop) ry = imgTop;
        }

        setCropRect({
          x: Math.round(rx),
          y: Math.round(ry),
          width: Math.round(rw),
          height: Math.round(rh),
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(image);
  }, [
    image,
    getBoundedPosition,
    aspectRatio,
    getCanvasSize,
    getScaledSize,
    constrainRectToRatio,
  ]);

  // Redraw whenever dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  // Resize handling: re-fit image AND scale crop rect proportionally
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    let prevCs = getCanvasSize();
    const obs = new ResizeObserver(() => {
      const cs = getCanvasSize();
      if (cs.w <= 0 || cs.h <= 0) return;
      if (Math.abs(cs.w - prevCs.w) <= 1 && Math.abs(cs.h - prevCs.h) <= 1)
        return;
      const prev = prevCs;
      prevCs = cs;
      const img = imgRef.current;
      if (!img) return;

      // Re-fit image
      const newScale = Math.min(cs.w / img.width, cs.h / img.height);
      setScale(newScale);
      setPos({ x: 0, y: 0 });
      setMinScale(newScale);
      setMaxScale(newScale * MAX_SCALE);

      // Scale crop rect proportionally
      const sx = cs.w / prev.w;
      const sy = cs.h / prev.h;
      setCropRect((prevRect) => {
        const nr = {
          x: Math.round(prevRect.x * sx),
          y: Math.round(prevRect.y * sy),
          width: Math.round(prevRect.width * sx),
          height: Math.round(prevRect.height * sy),
        };
        // Re-constrain to aspect ratio if set
        if (aspectRatio > 0) {
          return constrainRectToRatio(nr, aspectRatio, cs);
        }
        return nr;
      });

      draw();
    });
    obs.observe(parent);
    return () => obs.disconnect();
  }, [draw, getCanvasSize, aspectRatio, constrainRectToRatio]);

  // =============== Pointer handling ===============

  const getCanvasPoint = (clientX: number, clientY: number): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: clientX, y: clientY };
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const getPointerPosition = (
    e: React.MouseEvent | React.TouchEvent,
  ): Point => {
    if ("touches" in e) {
      isTouchDevice.current = true;
      return getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
    return getCanvasPoint(
      (e as React.MouseEvent).clientX,
      (e as React.MouseEvent).clientY,
    );
  };

  const getHandleAt = (point: Point): string | null => {
    const rect = cropRectRef.current;
    const handles: Record<string, Point> = {
      tl: { x: rect.x, y: rect.y },
      tr: { x: rect.x + rect.width, y: rect.y },
      bl: { x: rect.x, y: rect.y + rect.height },
      br: { x: rect.x + rect.width, y: rect.y + rect.height },
      tm: { x: rect.x + rect.width / 2, y: rect.y },
      bm: { x: rect.x + rect.width / 2, y: rect.y + rect.height },
      lm: { x: rect.x, y: rect.y + rect.height / 2 },
      rm: { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
    };
    for (const [key, pos] of Object.entries(handles)) {
      if (
        Math.abs(point.x - pos.x) < HANDLE_HIT_AREA &&
        Math.abs(point.y - pos.y) < HANDLE_HIT_AREA
      )
        return key;
    }
    return null;
  };

  const isInsideCrop = (point: Point): boolean => {
    const rect = cropRectRef.current;
    return (
      point.x >= rect.x + HANDLE_HIT_AREA &&
      point.x <= rect.x + rect.width - HANDLE_HIT_AREA &&
      point.y >= rect.y + HANDLE_HIT_AREA &&
      point.y <= rect.y + rect.height - HANDLE_HIT_AREA
    );
  };

  const handleResize = (
    handle: string,
    startRect: Rect,
    startPoint: Point,
    currentPoint: Point,
  ): Rect => {
    const dx = currentPoint.x - startPoint.x;
    const dy = currentPoint.y - startPoint.y;
    const cs = csRef.current;
    let { x, y, width, height } = startRect;

    if (aspectRatio > 0) {
      const ratio = aspectRatio;
      if (handle === "tm" || handle === "bm") {
        let newH = handle === "tm" ? height - dy : height + dy;
        newH = Math.max(MIN_CROP_SIZE, Math.abs(newH));
        const newW = newH * ratio;
        x = startRect.x + startRect.width / 2 - newW / 2;
        y =
          handle === "tm" ? startRect.y + startRect.height - newH : startRect.y;
        return {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(newW),
          height: Math.round(newH),
        };
      }
      if (handle === "lm" || handle === "rm") {
        let newW = handle === "lm" ? width - dx : width + dx;
        newW = Math.max(MIN_CROP_SIZE, Math.abs(newW));
        const newH = newW / ratio;
        x =
          handle === "lm" ? startRect.x + startRect.width - newW : startRect.x;
        y = startRect.y + startRect.height / 2 - newH / 2;
        return {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(newW),
          height: Math.round(newH),
        };
      }

      let fixedX: number, fixedY: number;
      switch (handle) {
        case "tl":
          fixedX = startRect.x + startRect.width;
          fixedY = startRect.y + startRect.height;
          break;
        case "tr":
          fixedX = startRect.x;
          fixedY = startRect.y + startRect.height;
          break;
        case "bl":
          fixedX = startRect.x + startRect.width;
          fixedY = startRect.y;
          break;
        case "br":
          fixedX = startRect.x;
          fixedY = startRect.y;
          break;
        default:
          fixedX = 0;
          fixedY = 0;
      }
      let newW: number, newH: number;
      switch (handle) {
        case "br":
          newW = currentPoint.x - fixedX;
          newH = currentPoint.y - fixedY;
          break;
        case "tr":
          newW = currentPoint.x - fixedX;
          newH = fixedY - currentPoint.y;
          break;
        case "bl":
          newW = fixedX - currentPoint.x;
          newH = currentPoint.y - fixedY;
          break;
        case "tl":
          newW = fixedX - currentPoint.x;
          newH = fixedY - currentPoint.y;
          break;
        default:
          newW = 0;
          newH = 0;
      }
      newW = Math.max(MIN_CROP_SIZE, Math.abs(newW));
      newH = Math.max(MIN_CROP_SIZE, Math.abs(newH));
      if (newW / newH > ratio) {
        newW = newH * ratio;
      } else {
        newH = newW / ratio;
      }
      switch (handle) {
        case "br":
          x = fixedX;
          y = fixedY;
          break;
        case "tr":
          x = fixedX;
          y = fixedY - newH;
          break;
        case "bl":
          x = fixedX - newW;
          y = fixedY;
          break;
        case "tl":
          x = fixedX - newW;
          y = fixedY - newH;
          break;
      }
      width = Math.round(newW);
      height = Math.round(newH);
    } else {
      switch (handle) {
        case "tl":
          x = startRect.x + dx;
          y = startRect.y + dy;
          width = startRect.width - dx;
          height = startRect.height - dy;
          break;
        case "tr":
          y = startRect.y + dy;
          width = startRect.width + dx;
          height = startRect.height - dy;
          break;
        case "bl":
          x = startRect.x + dx;
          width = startRect.width - dx;
          height = startRect.height + dy;
          break;
        case "br":
          width = startRect.width + dx;
          height = startRect.height + dy;
          break;
        case "tm":
          y = startRect.y + dy;
          height = startRect.height - dy;
          break;
        case "bm":
          height = startRect.height + dy;
          break;
        case "lm":
          x = startRect.x + dx;
          width = startRect.width - dx;
          break;
        case "rm":
          width = startRect.width + dx;
          break;
      }
    }

    if (width < MIN_CROP_SIZE) {
      if (handle.includes("l"))
        x = startRect.x + startRect.width - MIN_CROP_SIZE;
      width = MIN_CROP_SIZE;
    }
    if (height < MIN_CROP_SIZE) {
      if (handle.includes("t"))
        y = startRect.y + startRect.height - MIN_CROP_SIZE;
      height = MIN_CROP_SIZE;
    }

    x = clamp(x, 0, cs.w - MIN_CROP_SIZE);
    y = clamp(y, 0, cs.h - MIN_CROP_SIZE);
    width = clamp(width, MIN_CROP_SIZE, cs.w - x);
    height = clamp(height, MIN_CROP_SIZE, cs.h - y);

    return { x, y, width, height };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const point = getPointerPosition(e);
    lastPointer.current = point;
    const handle = getHandleAt(point);
    if (handle) {
      setIsResizing(true);
      setActiveHandle(handle);
      dragStartRef.current = { point, rect: { ...cropRectRef.current } };
      return;
    }
    if (isInsideCrop(point)) {
      setIsMovingCrop(true);
      dragStartRef.current = { point, rect: { ...cropRectRef.current } };
      return;
    }
    setIsDragging(true);
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const point = getPointerPosition(e);

    if (isResizing && activeHandle) {
      const newRect = handleResize(
        activeHandle,
        dragStartRef.current.rect,
        dragStartRef.current.point,
        point,
      );
      setCropRect(clampRectToImage(newRect));
      return;
    }

    if (isMovingCrop) {
      const dx = point.x - dragStartRef.current.point.x;
      const dy = point.y - dragStartRef.current.point.y;
      const startRect = dragStartRef.current.rect;
      const bounds = getImageBounds();
      let newX = startRect.x + dx,
        newY = startRect.y + dy;
      if (bounds) {
        newX = clamp(newX, bounds.x, bounds.x + bounds.width - startRect.width);
        newY = clamp(
          newY,
          bounds.y,
          bounds.y + bounds.height - startRect.height,
        );
      }
      setCropRect({ ...startRect, x: newX, y: newY });
      return;
    }

    if (isDragging && imgRef.current) {
      const dx = point.x - lastPointer.current.x;
      const dy = point.y - lastPointer.current.y;
      lastPointer.current = point;
      setPos((prev) =>
        getBoundedPosition(
          imgRef.current!,
          { x: prev.x + dx, y: prev.y + dy },
          scale,
        ),
      );
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const handle = getHandleAt(point);
    if (handle) {
      const cursors: Record<string, string> = {
        tl: "nwse-resize",
        tr: "nesw-resize",
        bl: "nesw-resize",
        br: "nwse-resize",
        tm: "ns-resize",
        bm: "ns-resize",
        lm: "ew-resize",
        rm: "ew-resize",
      };
      canvas.style.cursor = cursors[handle] || "default";
    } else if (isInsideCrop(point)) {
      canvas.style.cursor = "move";
    } else {
      canvas.style.cursor = "grab";
    }
  };

  const onPointerUp = () => {
    if (isResizing && aspectRatio > 0 && activeHandle) {
      setCropRect((prev) =>
        clampRectToImage(
          constrainRectToRatio(prev, aspectRatio, csRef.current),
        ),
      );
    } else if (isResizing || isMovingCrop) {
      setCropRect((prev) => clampRectToImage(prev));
    }
    setIsDragging(false);
    setIsResizing(false);
    setIsMovingCrop(false);
    setActiveHandle(null);
  };

  const handleZoom = (delta: number, clientX?: number, clientY?: number) => {
    if (!imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cs = csRef.current;
    const mouseX = clientX ? clientX - rect.left : cs.w / 2;
    const mouseY = clientY ? clientY - rect.top : cs.h / 2;

    setScale((prevScale) => {
      const newScale = clamp(prevScale - delta * 0.008, minScale, maxScale);
      if (prevScale !== newScale) {
        const factor = newScale / prevScale;
        setPos((prevPos) => {
          const newX = mouseX - (mouseX - (cs.w / 2 + prevPos.x)) * factor;
          const newY = mouseY - (mouseY - (cs.h / 2 + prevPos.y)) * factor;
          return getBoundedPosition(
            imgRef.current!,
            { x: newX, y: newY },
            newScale,
          );
        });
      }
      return newScale;
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY, e.clientX, e.clientY);
  };

  const reset = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const cs = csRef.current;
    const initialScale = Math.min(cs.w / img.width, cs.h / img.height);
    const initialPos = getBoundedPosition(img, { x: 0, y: 0 }, initialScale);
    setScale(initialScale);
    setPos(initialPos);

    let initialRect: Rect = { x: 0, y: 0, width: cs.w, height: cs.h };
    if (aspectRatio > 0)
      initialRect = constrainRectToRatio(initialRect, aspectRatio, cs);

    const { width: scaledW, height: scaledH } = getScaledSize(
      img,
      initialScale,
    );
    const imgLeft = cs.w / 2 - scaledW / 2 + initialPos.x;
    const imgTop = cs.h / 2 - scaledH / 2 + initialPos.y;
    const imgRight = imgLeft + scaledW;
    const imgBottom = imgTop + scaledH;
    let rx = initialRect.x,
      ry = initialRect.y,
      rw = initialRect.width,
      rh = initialRect.height;

    if (rx < imgLeft) rx = imgLeft;
    if (ry < imgTop) ry = imgTop;
    if (rx + rw > imgRight) rw = Math.max(0, imgRight - rx);
    if (ry + rh > imgBottom) rh = Math.max(0, imgBottom - ry);
    if (rx + rw > imgRight) rx = imgRight - rw;
    if (ry + rh > imgBottom) ry = imgBottom - rh;
    if (rx < imgLeft) rx = imgLeft;
    if (ry < imgTop) ry = imgTop;

    if (aspectRatio > 0) {
      const cr = rw / rh;
      if (cr > aspectRatio) {
        const nw = rh * aspectRatio;
        rx += (rw - nw) / 2;
        rw = nw;
      } else {
        const nh = rw / aspectRatio;
        ry += (rh - nh) / 2;
        rh = nh;
      }
      if (rx < imgLeft) rx = imgLeft;
      if (ry < imgTop) ry = imgTop;
      if (rx + rw > imgRight) rx = imgRight - rw;
      if (ry + rh > imgBottom) ry = imgBottom - rh;
      if (rx < imgLeft) rx = imgLeft;
      if (ry < imgTop) ry = imgTop;
    }

    setCropRect({
      x: Math.round(rx),
      y: Math.round(ry),
      width: Math.round(rw),
      height: Math.round(rh),
    });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const cs = csRef.current;
    const { width, height } = getScaledSize(img, scale);
    const imgX = cs.w / 2 - width / 2 + pos.x;
    const imgY = cs.h / 2 - height / 2 + pos.y;

    const cropX = (cropRect.x - imgX) / scale;
    const cropY = (cropRect.y - imgY) / scale;
    const cropW = cropRect.width / scale;
    const cropH = cropRect.height / scale;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = Math.round(cropW);
    outCanvas.height = Math.round(cropH);
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) return;

    outCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    outCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "avatar.png", { type: "image/png" });
        onSave(file);
        onOpenChange(false);
      },
      "image/png",
      0.95,
    );
  };

  const handleAspectRatioChange = (ratio: number) => {
    if (hideAspectRatioSelector) return;
    setAspectRatio(ratio);
    if (ratio > 0) {
      setCropRect((prev) => constrainRectToRatio(prev, ratio, csRef.current));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black backdrop-blur-sm"
        className="p-6 bg-transparent h-full max-h-none! w-full! max-w-none!"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="relative overflow-hidden w-full h-full max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                onMouseDown={onPointerDown}
                onMouseMove={onPointerMove}
                onMouseUp={onPointerUp}
                onMouseLeave={onPointerUp}
                onTouchStart={onPointerDown}
                onTouchMove={onPointerMove}
                onTouchEnd={onPointerUp}
                onWheel={onWheel}
                className="touch-none absolute inset-0 w-full h-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-md mx-auto pb-2 shrink-0">
            {!hideAspectRatioSelector && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.label}
                    onClick={() => handleAspectRatioChange(ar.value)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors bg-card ${
                      aspectRatio === ar.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-border"
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            )}

            {cropRect && (
              <Button
                className="self-center bg-transparent h-7 px-3 rounded-full border-2 w-fit border-white hover:bg-white hover:text-black font-black"
                onClick={reset}
              >
                Сбросить
              </Button>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted bg-card"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditorModal;
