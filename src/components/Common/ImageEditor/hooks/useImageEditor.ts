import { useCallback, useEffect, useRef, useState } from "react";
import type { CropShape, Point, Rect, Size } from "../types";
import { clamp, fitSize } from "../utils";
import {
  GRID_HORIZONTAL_GAP,
  GRID_ZOOM_TRANSITION_MS,
  HANDLE_HIT_AREA,
  MAX_IMAGE_ZOOM,
  MIN_CROP_SIZE,
  WHEEL_ZOOM_TRANSITION_MS,
} from "../constants";

export type UseImageEditorArgs = {
  image: File | null;
  initialAspectRatio?: number;
  hideAspectRatioSelector?: boolean;
  cropShape: CropShape;
  onSave: (result: File) => void;
  onOpenChange: (open: boolean) => void;
};

function getCanvasPoint(
  canvas: HTMLCanvasElement | null,
  clientX: number,
  clientY: number,
): Point {
  const rect = canvas?.getBoundingClientRect();
  if (!rect) return { x: clientX, y: clientY };
  return { x: clientX - rect.left, y: clientY - rect.top };
}

export function useImageEditor({
  image,
  initialAspectRatio,
  hideAspectRatioSelector = false,
  cropShape,
  onSave,
  onOpenChange,
}: UseImageEditorArgs) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const getCanvasSize = useCallback((): Size => {
    const c = canvasRef.current;
    if (!c) return { w: 320, h: 320 };
    return { w: c.clientWidth, h: c.clientHeight };
  }, []);

  const [scale, setScale] = useState(1);
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
  const resizeCompleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const gridAnimationFrameRef = useRef<number | null>(null);
  const wheelAnimationFrameRef = useRef<number | null>(null);
  const wheelTargetScaleRef = useRef<number | null>(null);
  const wheelFocalPointRef = useRef<Point>({ x: 0, y: 0 });
  const pinchRef = useRef<{ distance: number } | null>(null);
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

  const getCropBoundedPosition = useCallback(
    (img: HTMLImageElement, position: Point, currentScale: number): Point => {
      const cs = csRef.current;
      const crop = cropRectRef.current;
      const { width, height } = getScaledSize(img, currentScale);

      const minX = crop.x + crop.width - width / 2 - cs.w / 2;
      const maxX = crop.x + width / 2 - cs.w / 2;
      const minY = crop.y + crop.height - height / 2 - cs.h / 2;
      const maxY = crop.y + height / 2 - cs.h / 2;

      return {
        x: clamp(position.x, Math.min(minX, maxX), Math.max(minX, maxX)),
        y: clamp(position.y, Math.min(minY, maxY), Math.max(minY, maxY)),
      };
    },
    [getScaledSize],
  );

  const zoomImageAt = useCallback(
    (requestedScale: number, focalPoint: Point) => {
      const img = imgRef.current;
      if (!img) return;

      const crop = cropRectRef.current;
      const minScale = Math.max(
        crop.width / img.width,
        crop.height / img.height,
      );
      const nextScale = clamp(
        requestedScale,
        minScale,
        minScale * MAX_IMAGE_ZOOM,
      );
      const currentScale = scaleRef.current;
      if (nextScale === currentScale) return;

      const zoomFactor = nextScale / currentScale;
      const cs = csRef.current;
      const nextPosition = getCropBoundedPosition(
        img,
        {
          x:
            focalPoint.x -
            cs.w / 2 -
            (focalPoint.x - cs.w / 2 - posRef.current.x) * zoomFactor,
          y:
            focalPoint.y -
            cs.h / 2 -
            (focalPoint.y - cs.h / 2 - posRef.current.y) * zoomFactor,
        },
        nextScale,
      );

      scaleRef.current = nextScale;
      posRef.current = nextPosition;
      setScale(nextScale);
      setPos(nextPosition);
    },
    [getCropBoundedPosition],
  );

  const clearResizeCompleteTimer = useCallback(() => {
    if (resizeCompleteTimerRef.current !== null) {
      clearTimeout(resizeCompleteTimerRef.current);
      resizeCompleteTimerRef.current = null;
    }
    if (gridAnimationFrameRef.current !== null) {
      cancelAnimationFrame(gridAnimationFrameRef.current);
      gridAnimationFrameRef.current = null;
    }
  }, []);

  const clearWheelZoom = useCallback(() => {
    if (wheelAnimationFrameRef.current !== null) {
      cancelAnimationFrame(wheelAnimationFrameRef.current);
      wheelAnimationFrameRef.current = null;
    }
    wheelTargetScaleRef.current = null;
    wheelFocalPointRef.current = { x: 0, y: 0 };
  }, []);

  const zoomGridToHorizontalBounds = useCallback((rect: Rect) => {
    const cs = csRef.current;
    const availableWidth = cs.w - GRID_HORIZONTAL_GAP * 2;
    const availableHeight = cs.h - GRID_HORIZONTAL_GAP * 2;
    if (
      rect.width <= 0 ||
      rect.height <= 0 ||
      availableWidth <= 0 ||
      availableHeight <= 0
    )
      return;

    // Zoom the complete editor around the grid centre. The grid reaches the
    // horizontal bounds with a small gap, while the image keeps its position
    // relative to the grid instead of being moved underneath it.
    const zoom = Math.min(
      availableWidth / rect.width,
      availableHeight / rect.height,
    );
    const gridCenter = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    };
    const imageCenter = {
      x: cs.w / 2 + posRef.current.x,
      y: cs.h / 2 + posRef.current.y,
    };
    const newScale = scaleRef.current * zoom;
    const newPos = {
      x: (imageCenter.x - gridCenter.x) * zoom,
      y: (imageCenter.y - gridCenter.y) * zoom,
    };
    const newRect = {
      x: Math.round((cs.w - rect.width * zoom) / 2),
      y: Math.round((cs.h - rect.height * zoom) / 2),
      width: Math.round(rect.width * zoom),
      height: Math.round(rect.height * zoom),
    };
    const startScale = scaleRef.current;
    const startPos = { ...posRef.current };
    const startRect = { ...cropRectRef.current };
    const startedAt = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / GRID_ZOOM_TRANSITION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      const nextScale = startScale + (newScale - startScale) * eased;
      const nextPos = {
        x: startPos.x + (newPos.x - startPos.x) * eased,
        y: startPos.y + (newPos.y - startPos.y) * eased,
      };
      const nextRect = {
        x: startRect.x + (newRect.x - startRect.x) * eased,
        y: startRect.y + (newRect.y - startRect.y) * eased,
        width: startRect.width + (newRect.width - startRect.width) * eased,
        height: startRect.height + (newRect.height - startRect.height) * eased,
      };

      scaleRef.current = nextScale;
      posRef.current = nextPos;
      cropRectRef.current = nextRect;
      setScale(nextScale);
      setPos(nextPos);
      setCropRect(nextRect);

      if (progress < 1) {
        gridAnimationFrameRef.current = requestAnimationFrame(animate);
      } else {
        gridAnimationFrameRef.current = null;
      }
    };

    gridAnimationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(
    () => () => {
      clearResizeCompleteTimer();
      clearWheelZoom();
    },
    [clearResizeCompleteTimer, clearWheelZoom],
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

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(cs.w * pixelRatio);
    canvas.height = Math.round(cs.h * pixelRatio);

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const { width, height } = getScaledSize(img, scale);
    const imgX = cs.w / 2 - width / 2 + pos.x;
    const imgY = cs.h / 2 - height / 2 + pos.y;
    ctx.drawImage(img, imgX, imgY, width, height);

    const rect = cropRect;

    if (cropShape === "circle") {
      // Draw full semi-transparent overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, cs.w, cs.h);

      // Cut out a circle using composite
      ctx.save();
      ctx.beginPath();
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const radius = Math.min(rect.width, rect.height) / 2;
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.clearRect(0, 0, cs.w, cs.h);
      // Redraw image inside the circle
      ctx.drawImage(img, imgX, imgY, width, height);
      ctx.restore();
    } else {
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
    }

    // Always draw square outline
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

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

    const HANDLE_SIZE = 12;
    const HANDLE_STROKE_LOCAL = 1.5;

    const handles: {
      key: string;
      cx: number;
      cy: number;
      posx: number;
      posy: number;
    }[] = [
      { key: "tl", cx: rect.x, cy: rect.y, posx: 1, posy: 1 },
      { key: "tr", cx: rect.x + rect.width, cy: rect.y, posx: -1, posy: 1 },
      { key: "bl", cx: rect.x, cy: rect.y + rect.height, posx: 1, posy: -1 },
      {
        key: "br",
        cx: rect.x + rect.width,
        cy: rect.y + rect.height,
        posx: -1,
        posy: -1,
      },
      { key: "tm", cx: rect.x + rect.width / 2, cy: rect.y, posx: 0, posy: 1 },
      {
        key: "bm",
        cx: rect.x + rect.width / 2,
        cy: rect.y + rect.height,
        posx: 0,
        posy: -1,
      },
      { key: "lm", cx: rect.x, cy: rect.y + rect.height / 2, posx: 1, posy: 0 },
      {
        key: "rm",
        cx: rect.x + rect.width,
        cy: rect.y + rect.height / 2,
        posx: -1,
        posy: 0,
      },
    ];
    for (const h of handles) {
      ctx.beginPath();
      if (h.posx !== 0)
        ctx.rect(
          h.cx - HANDLE_STROKE_LOCAL * h.posx,
          h.cy -
            (!h.posy
              ? HANDLE_STROKE_LOCAL + HANDLE_SIZE
              : HANDLE_STROKE_LOCAL) *
              (h.posy || 0.83333333),
          2 * HANDLE_STROKE_LOCAL * (h.posx || 1),
          HANDLE_SIZE * 2 * (h.posy || 1),
        );
      if (h.posy !== 0)
        ctx.rect(
          h.cx -
            (!h.posx
              ? HANDLE_STROKE_LOCAL + HANDLE_SIZE
              : HANDLE_STROKE_LOCAL) *
              (h.posx || 0.83333333),
          h.cy - HANDLE_STROKE_LOCAL * (h.posy || 0.5),
          HANDLE_SIZE * 2 * (h.posx || 1),
          2 * HANDLE_STROKE_LOCAL * (h.posy || 1),
        );
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.stroke();
    }
  }, [pos, scale, getScaledSize, cropRect, getCanvasSize, cropShape]);

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

  // Keep the image and crop grid aligned when the canvas changes size.
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

      const resizeFactor = Math.min(cs.w / prev.w, cs.h / prev.h);
      const newScale = scaleRef.current * resizeFactor;
      const newPos = {
        x: posRef.current.x * resizeFactor,
        y: posRef.current.y * resizeFactor,
      };
      const oldRect = cropRectRef.current;
      const oldCenter = {
        x: oldRect.x + oldRect.width / 2,
        y: oldRect.y + oldRect.height / 2,
      };
      const newWidth = oldRect.width * resizeFactor;
      const newHeight = oldRect.height * resizeFactor;
      const newRect = {
        x: Math.round(
          cs.w / 2 + (oldCenter.x - prev.w / 2) * resizeFactor - newWidth / 2,
        ),
        y: Math.round(
          cs.h / 2 + (oldCenter.y - prev.h / 2) * resizeFactor - newHeight / 2,
        ),
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      };

      csRef.current = cs;
      scaleRef.current = newScale;
      posRef.current = newPos;
      cropRectRef.current = newRect;
      setScale(newScale);
      setPos(newPos);
      setCropRect(newRect);
      clearResizeCompleteTimer();
      zoomGridToHorizontalBounds(newRect);
    });
    obs.observe(parent);
    return () => obs.disconnect();
  }, [clearResizeCompleteTimer, getCanvasSize, zoomGridToHorizontalBounds]);

  const getPointerPosition = (
    e: React.MouseEvent | React.TouchEvent,
  ): Point => {
    if ("touches" in e) {
      isTouchDevice.current = true;
      return getCanvasPoint(
        canvasRef.current,
        e.touches[0].clientX,
        e.touches[0].clientY,
      );
    }
    return getCanvasPoint(
      canvasRef.current,
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
    clearWheelZoom();
    if ("touches" in e && e.touches.length === 2) {
      const firstTouch = e.touches[0];
      const secondTouch = e.touches[1];
      const dx = secondTouch.clientX - firstTouch.clientX;
      const dy = secondTouch.clientY - firstTouch.clientY;
      pinchRef.current = { distance: Math.hypot(dx, dy) };
      setIsDragging(false);
      setIsResizing(false);
      setActiveHandle(null);
      return;
    }

    const point = getPointerPosition(e);
    lastPointer.current = point;
    clearResizeCompleteTimer();
    const handle = getHandleAt(point);
    if (handle) {
      setIsResizing(true);
      setActiveHandle(handle);
      dragStartRef.current = { point, rect: { ...cropRectRef.current } };
      return;
    }
    setIsDragging(true);
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e && e.touches.length === 2) {
      e.preventDefault();
      const firstTouch = e.touches[0];
      const secondTouch = e.touches[1];
      const dx = secondTouch.clientX - firstTouch.clientX;
      const dy = secondTouch.clientY - firstTouch.clientY;
      const distance = Math.hypot(dx, dy);
      const center = getCanvasPoint(
        canvasRef.current,
        (firstTouch.clientX + secondTouch.clientX) / 2,
        (firstTouch.clientY + secondTouch.clientY) / 2,
      );

      if (pinchRef.current && pinchRef.current.distance > 0) {
        zoomImageAt(
          scaleRef.current * (distance / pinchRef.current.distance),
          center,
        );
      }
      pinchRef.current = { distance };
      return;
    }

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

    if (isDragging && imgRef.current) {
      const dx = point.x - lastPointer.current.x;
      const dy = point.y - lastPointer.current.y;
      lastPointer.current = point;
      setPos((prev) =>
        getCropBoundedPosition(
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
    } else {
      canvas.style.cursor = "grab";
    }
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const img = imgRef.current;
    if (!img) return;

    const crop = cropRectRef.current;
    const minScale = Math.max(crop.width / img.width, crop.height / img.height);
    const currentTarget = wheelTargetScaleRef.current ?? scaleRef.current;
    const targetScale = clamp(
      currentTarget * Math.exp(-e.deltaY * 0.001),
      minScale,
      minScale * MAX_IMAGE_ZOOM,
    );
    const focalPoint = getCanvasPoint(canvasRef.current, e.clientX, e.clientY);
    const startScale = scaleRef.current;
    const startedAt = performance.now();

    if (wheelAnimationFrameRef.current !== null) {
      cancelAnimationFrame(wheelAnimationFrameRef.current);
    }
    wheelTargetScaleRef.current = targetScale;

    const animate = (now: number) => {
      const progress = Math.min(
        (now - startedAt) / WHEEL_ZOOM_TRANSITION_MS,
        1,
      );
      const eased = 1 - (1 - progress) ** 3;
      zoomImageAt(startScale + (targetScale - startScale) * eased, focalPoint);

      if (progress < 1) {
        wheelAnimationFrameRef.current = requestAnimationFrame(animate);
      } else {
        wheelAnimationFrameRef.current = null;
        wheelTargetScaleRef.current = null;
      }
    };

    wheelAnimationFrameRef.current = requestAnimationFrame(animate);
  };

  const onPointerUp = () => {
    pinchRef.current = null;
    clearResizeCompleteTimer();
    resizeCompleteTimerRef.current = setTimeout(() => {
      zoomGridToHorizontalBounds(cropRectRef.current);
      resizeCompleteTimerRef.current = null;
    }, 500);

    setIsDragging(false);
    setIsResizing(false);
    setActiveHandle(null);
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

    const outputSize = fitSize(cropW, cropH, { width: 1080, height: 2160 });

    outCanvas.width = outputSize.width;
    outCanvas.height = outputSize.height;

    outCtx.drawImage(
      img,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      outputSize.width,
      outputSize.height,
    );

    outCanvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], "avatar.png", { type: "image/png" });

        await new Promise((resolve, reject) => {
          const objectURL = URL.createObjectURL(blob);
          const checkImg = new Image();

          checkImg.onload = () => {
            URL.revokeObjectURL(objectURL);
            resolve({
              width: checkImg.naturalWidth,
              height: checkImg.naturalHeight,
            });
          };

          checkImg.onerror = () => {
            URL.revokeObjectURL(objectURL);
            reject(new Error("Failed to load image from Blob."));
          };

          checkImg.src = objectURL;
        });

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

  return {
    canvasRef,
    aspectRatio,
    cropRect,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
    reset,
    handleSave,
    handleAspectRatioChange,
  };
}
