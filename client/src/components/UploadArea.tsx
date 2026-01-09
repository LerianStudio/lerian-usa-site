import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

// ✅ HIGH-2 FIX: Componente separado para área de upload

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function UploadArea({
  onFileSelect,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: UploadAreaProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/30 hover:border-primary/50"
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-medium mb-1">
        {t("profile.dragDropImage") || "Arraste uma imagem aqui ou clique para selecionar"}
      </p>
      <p className="text-xs text-muted-foreground">
        {t("profile.imageLimits") || "JPG, PNG ou WebP (máximo 3MB)"}
      </p>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
