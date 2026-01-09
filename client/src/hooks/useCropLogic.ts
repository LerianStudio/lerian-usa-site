import { useState, useRef, useCallback } from "react";

// ✅ HIGH-2 FIX: Hook customizado para lógica de crop

export interface CropState {
  dragPos: { x: number; y: number };
  scale: number;
  isDragging: boolean;
}

export function useCropLogic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const renderCropPreview = useCallback((pos: { x: number; y: number }, scaleValue: number) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 256;
    canvas.width = size;
    canvas.height = size;

    // Desenhar círculo
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // Desenhar imagem com transformações
    const img = imageRef.current;
    const scaledWidth = img.width * scaleValue;
    const scaledHeight = img.height * scaleValue;
    const x = size / 2 - scaledWidth / 2 + pos.x;
    const y = size / 2 - scaledHeight / 2 + pos.y;

    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  }, []);

  const cropImage = useCallback((selectedFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!imageRef.current || !canvasRef.current || !selectedFile) {
        reject(new Error("Missing required elements for crop"));
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      const size = 256;
      canvas.width = size;
      canvas.height = size;

      // Desenhar círculo
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      // Desenhar imagem com transformações
      const img = imageRef.current;
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = size / 2 - scaledWidth / 2 + dragPos.x;
      const y = size / 2 - scaledHeight / 2 + dragPos.y;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Converter canvas para blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }

        // Criar novo File a partir do blob
        const croppedFile = new File([blob], selectedFile.name, {
          type: "image/png",
          lastModified: Date.now(),
        });

        resolve(croppedFile);
      });
    });
  }, [scale, dragPos]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = e.clientX - rect.left - rect.width / 2;
    const deltaY = e.clientY - rect.top - rect.height / 2;

    setDragPos((prev) => ({
      x: Math.max(-200, Math.min(200, prev.x + deltaX * 0.5)),
      y: Math.max(-200, Math.min(200, prev.y + deltaY * 0.5)),
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  const reset = useCallback(() => {
    setDragPos({ x: 0, y: 0 });
    setScale(1);
    setIsDragging(false);
  }, []);

  return {
    // Refs
    canvasRef,
    imageRef,
    // State
    dragPos,
    scale,
    isDragging,
    // Setters
    setDragPos,
    setScale,
    setIsDragging,
    // Methods
    renderCropPreview,
    cropImage,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    reset,
  };
}
