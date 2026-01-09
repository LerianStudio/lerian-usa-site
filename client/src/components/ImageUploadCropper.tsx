import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/contexts/I18nContext";
import { useCropLogic } from "@/hooks/useCropLogic";
import { ImagePreview } from "./ImagePreview";
import { UploadArea } from "./UploadArea";
import { CropControls } from "./CropControls";

// ✅ HIGH-2 FIX: Refatorado para usar componentes menores

interface ImageUploadCropperProps {
  onImageSelected: (file: File, preview: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export function ImageUploadCropper({
  onImageSelected,
  currentImageUrl,
  label,
}: ImageUploadCropperProps) {
  const { t } = useI18n();
  const cropLogic = useCropLogic();

  // Estado para a foto salva (exibida no preview circular)
  const [savedPreview, setSavedPreview] = useState<string | null>(currentImageUrl || null);

  // Estado para a foto sendo editada
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sincronizar com currentImageUrl quando mudar
  useEffect(() => {
    setSavedPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  // Renderizar preview do crop em tempo real
  useEffect(() => {
    if (showCropper && cropLogic.imageRef.current && cropLogic.canvasRef.current) {
      cropLogic.renderCropPreview(cropLogic.dragPos, cropLogic.scale);
    }
  }, [cropLogic.dragPos, cropLogic.scale, showCropper, cropLogic]);

  const handleFileSelect = (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      alert(t("profile.invalidFileType") || "Por favor, selecione uma imagem");
      return;
    }

    // Validar tamanho (máximo 3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert(t("profile.fileTooLarge") || "Arquivo muito grande (máximo 3MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setSelectedFile(file);
        setEditingImage(e.target?.result as string);
        setShowCropper(true);
        cropLogic.reset();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCropImage = async () => {
    if (!selectedFile) return;

    try {
      const croppedFile = await cropLogic.cropImage(selectedFile);
      onImageSelected(croppedFile, "");

      // Resetar estado de edição
      setShowCropper(false);
      setEditingImage(null);
      setSelectedFile(null);
      cropLogic.reset();
    } catch (error) {
      console.error("Erro ao cortar imagem:", error);
      alert(t("profile.cropError") || "Erro ao cortar imagem");
    }
  };

  const handleCancel = () => {
    setShowCropper(false);
    setEditingImage(null);
    setSelectedFile(null);
    cropLogic.reset();
  };

  const handleRemovePhoto = () => {
    setSavedPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <Label>{label || (t("profile.profilePhoto") || "Foto de Perfil")}</Label>

      {!showCropper ? (
        <div className="space-y-4">
          <ImagePreview imageUrl={savedPreview} onRemove={handleRemovePhoto} />
          <UploadArea
            onFileSelect={handleFileSelect}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        </div>
      ) : (
        <CropControls
          canvasRef={cropLogic.canvasRef}
          imageRef={cropLogic.imageRef}
          scale={cropLogic.scale}
          editingImage={editingImage}
          onScaleChange={cropLogic.setScale}
          onMouseDown={cropLogic.handleMouseDown}
          onMouseMove={cropLogic.handleMouseMove}
          onMouseUp={cropLogic.handleMouseUp}
          onMouseLeave={cropLogic.handleMouseUp}
          onWheel={cropLogic.handleWheel}
          onCancel={handleCancel}
          onCrop={handleCropImage}
        />
      )}
    </div>
  );
}
