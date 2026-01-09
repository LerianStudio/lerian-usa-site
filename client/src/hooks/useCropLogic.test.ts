import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCropLogic } from "./useCropLogic";

// ✅ HIGH-3 FIX: Testes para hook useCropLogic

describe("useCropLogic", () => {
  let hook: ReturnType<typeof useCropLogic>;

  beforeEach(() => {
    const { result } = renderHook(() => useCropLogic());
    hook = result.current;
  });

  it("deve inicializar com valores padrão", () => {
    expect(hook.dragPos).toEqual({ x: 0, y: 0 });
    expect(hook.scale).toBe(1);
    expect(hook.isDragging).toBe(false);
  });

  it("deve ter referências para canvas e image", () => {
    expect(hook.canvasRef).toBeDefined();
    expect(hook.imageRef).toBeDefined();
  });

  it("deve ter método renderCropPreview", () => {
    expect(typeof hook.renderCropPreview).toBe("function");
  });

  it("deve ter método cropImage", () => {
    expect(typeof hook.cropImage).toBe("function");
  });

  it("deve ter handlers de mouse", () => {
    expect(typeof hook.handleMouseDown).toBe("function");
    expect(typeof hook.handleMouseMove).toBe("function");
    expect(typeof hook.handleMouseUp).toBe("function");
  });

  it("deve ter handler de wheel", () => {
    expect(typeof hook.handleWheel).toBe("function");
  });

  it("deve ter método reset", () => {
    expect(typeof hook.reset).toBe("function");
  });

  it("deve ter setters para dragPos, scale e isDragging", () => {
    expect(typeof hook.setDragPos).toBe("function");
    expect(typeof hook.setScale).toBe("function");
    expect(typeof hook.setIsDragging).toBe("function");
  });
});
