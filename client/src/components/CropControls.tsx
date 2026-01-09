import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";

// ✅ HIGH-2 FIX: Componente separado para controles de crop

interface CropControlsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
  scale: number;
  editingImage: string | null;
  onScaleChange: (scale: number) => void;
  onMouseDown: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onWheel: (e: React.WheelEvent) => void;
  onCancel: () => void;
  onCrop: () => void;
}

export function CropControls({
  canvasRef,
  imageRef,
  scale,
  editingImage,
  onScaleChange,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
  onCancel,
  onCrop,
}: CropControlsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {/* Cropper */}
      <div className="bg-muted rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">
          {t("profile.cropInstructions") || "Arraste para mover, use a roda do mouse para zoom"}
        </p>

        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onWheel={onWheel}
            className="w-64 h-64 border-2 border-primary rounded-full cursor-move bg-black"
          />
          <img
            ref={imageRef}
            src={editingImage || ""}
            alt="Crop source"
            style={{ display: "none" }}
          />
        </div>

        {/* Zoom slider */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground">
            {t("profile.zoom") || "Zoom"}: {Math.round(scale * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={onCrop} className="bg-primary">
            {t("profile.cropAndSave") || "Cortar e Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
