import { X } from "lucide-react";

// ✅ HIGH-2 FIX: Componente separado para preview de imagem

interface ImagePreviewProps {
  imageUrl: string | null;
  onRemove: () => void;
}

export function ImagePreview({ imageUrl, onRemove }: ImagePreviewProps) {
  if (!imageUrl) return null;

  return (
    <div className="flex justify-center">
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted border-2 border-primary">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
