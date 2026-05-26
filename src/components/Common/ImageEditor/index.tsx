import { type FC, useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export type ImageEditorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: File | null;
  onSave: (result: File) => void;
};

type Point = { x: number; y: number };

const CANVAS_SIZE = 320;
const MIN_SCALE = 1;
const MAX_SCALE = 5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const ImageEditorModal: FC<ImageEditorModalProps> = ({
  open,
  onOpenChange,
  image,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(MIN_SCALE);
  const [maxScale, setMaxScale] = useState(MAX_SCALE);
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const lastPointer = useRef<Point>({ x: 0, y: 0 });
  const isTouchDevice = useRef(false);

  // Получение размеров изображения с учетом масштаба
  const getScaledSize = useCallback(
    (img: HTMLImageElement, s: number) => ({
      width: img.width * s,
      height: img.height * s,
    }),
    [],
  );

  // Ограничение позиции (чтобы не было пустых зон)
  const getBoundedPosition = useCallback(
    (img: HTMLImageElement, position: Point, currentScale: number): Point => {
      const { width, height } = getScaledSize(img, currentScale);

      const halfW = width / 2;
      const halfH = height / 2;

      const maxX = Math.max(0, halfW - CANVAS_SIZE / 2);
      const maxY = Math.max(0, halfH - CANVAS_SIZE / 2);

      return {
        x: clamp(position.x, -maxX, maxX),
        y: clamp(position.y, -maxY, maxY),
      };
    },
    [getScaledSize],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const { width, height } = getScaledSize(img, scale);
    const x = CANVAS_SIZE / 2 - width / 2 + pos.x;
    const y = CANVAS_SIZE / 2 - height / 2 + pos.y;

    ctx.drawImage(img, x, y, width, height);
  }, [pos, scale, getScaledSize]);

  // Загрузка изображения
  useEffect(() => {
    if (!image) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;

        // Вычисляем минимальный масштаб, чтобы изображение заполнило canvas

        const initialScale = Math.max(
          CANVAS_SIZE / img.width,
          CANVAS_SIZE / img.height,
        );
        const initialPos = getBoundedPosition(
          img,
          { x: 0, y: 0 },
          initialScale,
        );

        setMinScale(initialScale);
        setMaxScale(initialScale * MAX_SCALE);
        setScale(initialScale);
        setPos(initialPos);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(image);
  }, [image, getBoundedPosition]);

  // Перерисовка
  useEffect(() => {
    draw();
  }, [draw]);

  // =============== Обработчики ===============

  const getPointerPosition = (
    e: React.MouseEvent | React.TouchEvent,
  ): Point => {
    if ("touches" in e) {
      isTouchDevice.current = true;
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX,
      y: (e as React.MouseEvent).clientY,
    };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPosition(e);
    lastPointer.current = pos;
    setIsDragging(true);
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !imgRef.current) return;

    const current = getPointerPosition(e);
    const dx = current.x - lastPointer.current.x;
    const dy = current.y - lastPointer.current.y;

    lastPointer.current = current;

    setPos((prev) =>
      getBoundedPosition(
        imgRef.current!,
        { x: prev.x + dx, y: prev.y + dy },
        scale,
      ),
    );
  };

  const onPointerUp = () => setIsDragging(false);

  // Зум к курсору (самое важное улучшение)
  const handleZoom = (delta: number, clientX?: number, clientY?: number) => {
    if (!imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const mouseX = clientX ? clientX - rect.left : CANVAS_SIZE / 2;
    const mouseY = clientY ? clientY - rect.top : CANVAS_SIZE / 2;

    setScale((prevScale) => {
      const newScale = clamp(prevScale - delta * 0.008, minScale, maxScale);

      if (prevScale !== newScale) {
        const factor = newScale / prevScale;
        setPos((prevPos) => {
          const newX =
            mouseX - (mouseX - (CANVAS_SIZE / 2 + prevPos.x)) * factor;
          const newY =
            mouseY - (mouseY - (CANVAS_SIZE / 2 + prevPos.y)) * factor;

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

  const zoomIn = () => handleZoom((-minScale * 100) / 2);
  const zoomOut = () => handleZoom((minScale * 100) / 2);
  const reset = () => {
    if (!imgRef.current) return;

    const img = imgRef.current;

    const initialScale = Math.max(
      CANVAS_SIZE / img.width,
      CANVAS_SIZE / img.height,
    );

    setScale(initialScale);
    setPos({ x: 0, y: 0 });
  };
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-95 p-6">
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative rounded-xl overflow-hidden border border-border shadow-sm"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
          >
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
              className="cursor-grab active:cursor-grabbing touch-none"
            />
          </div>

          {/* Панель управления */}
          <div className="flex items-center gap-3">
            <button
              onClick={zoomOut}
              className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xl"
            >
              −
            </button>

            <span className="text-sm font-medium text-muted-foreground w-16 text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xl"
            >
              +
            </button>

            <button
              onClick={reset}
              className="ml-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted"
            >
              Сбросить
            </button>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted"
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
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditorModal;
