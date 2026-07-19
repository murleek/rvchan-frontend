import { type FC } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ASPECT_RATIOS } from "./constants";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { CropShape } from "./types";
import { useImageEditor } from "./hooks/useImageEditor";

export type ImageEditorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: File | null;
  onSave: (result: File) => void;
  aspectRatio?: number;
  hideAspectRatioSelector?: boolean;
  cropShape?: CropShape;
};

const ImageEditorModal: FC<ImageEditorModalProps> = ({
  open,
  onOpenChange,
  image,
  onSave,
  aspectRatio: initialAspectRatio,
  hideAspectRatioSelector = false,
  cropShape = "rect",
}) => {
  const {
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
  } = useImageEditor({
    image,
    initialAspectRatio,
    hideAspectRatioSelector,
    cropShape,
    onSave,
    onOpenChange,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black"
        className="p-6 h-full max-h-none! w-full! max-w-none! bg-transparent"
        onClose={() => onOpenChange(false)}
        showCloseButton={false}
      >
        <div className="flex flex-col h-full gap-3">
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="relative overflow-hidden w-full h-full max-w-full max-h-full rounded-xl">
              <canvas
                ref={canvasRef}
                onMouseDown={onPointerDown}
                onMouseMove={onPointerMove}
                onMouseUp={onPointerUp}
                onMouseLeave={onPointerUp}
                onWheel={onWheel}
                onTouchStart={onPointerDown}
                onTouchMove={onPointerMove}
                onTouchEnd={onPointerUp}
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
              <Button
                className="rounded-full size-12 p-1! font-black bg-white text-black hover:bg-white text-md z-10 active:scale-125 active:brightness-125 backdrop-filter-[brightness()] cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                <ChevronLeft className="size-8" />
              </Button>
              <Button
                className="rounded-full h-12 font-black text-md flex-1 z-10 cursor-pointer"
                onClick={handleSave}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditorModal;
