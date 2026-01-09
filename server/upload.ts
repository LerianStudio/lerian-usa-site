import { Router } from "express";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { requireAuth } from "./middleware/auth";
import { uploadLimiter } from "./middleware/rateLimiter";
import { uploadLogger } from "./_core/logger";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Validação básica de MIME type (primeira camada)
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
});

// ✅ HIGH-3: Lista de magic bytes permitidos
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/webm",
];

export const uploadRouter = Router();

// ✅ HIGH-2 + HIGH-3: Rate limiting + autenticação + validação de magic bytes
uploadRouter.post("/upload", uploadLimiter, requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ HIGH-3: VALIDAÇÃO DE MAGIC BYTES (segunda camada - mais segura)
    const detectedType = await fileTypeFromBuffer(req.file.buffer);

    // Para SVG, file-type não detecta, então verificamos manualmente
    const isSvg = req.file.mimetype === "image/svg+xml" && 
                  req.file.buffer.toString("utf8", 0, 100).includes("<svg");

    if (!detectedType && !isSvg) {
      return res.status(400).json({
        error: "Could not determine file type",
        code: "INVALID_FILE",
      });
    }

    const actualMime = isSvg ? "image/svg+xml" : detectedType!.mime;

    if (!ALLOWED_FILE_TYPES.includes(actualMime)) {
      return res.status(400).json({
        error: "Invalid file type",
        code: "INVALID_FILE_TYPE",
        detected: actualMime,
        allowed: ALLOWED_FILE_TYPES,
      });
    }

    // ✅ VALIDAÇÃO EXTRA: MIME type do header vs. magic bytes
    const claimedCategory = req.file.mimetype.split("/")[0];
    const actualCategory = actualMime.split("/")[0];
    
    if (claimedCategory !== actualCategory) {
      return res.status(400).json({
        error: "File type mismatch",
        code: "FILE_TYPE_MISMATCH",
        claimed: req.file.mimetype,
        actual: actualMime,
      });
    }

    // ✅ MEDIUM-9: Log estruturado de auditoria
    const user = (req as any).user;
    uploadLogger.info({
      userId: user.id,
      userEmail: user.email,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: actualMime,
    }, "File uploaded successfully");

    // Usar extensão detectada, não do nome original (mais seguro)
    const ext = isSvg ? "svg" : detectedType!.ext;
    const fileName = `${nanoid()}.${ext}`;
    const fileKey = `uploads/${fileName}`;

    const { url } = await storagePut(
      fileKey,
      req.file.buffer,
      actualMime
    );

    res.json({ 
      url, 
      key: fileKey,
      type: actualMime,
    });
  } catch (error) {
    // ✅ MEDIUM-9: Log estruturado de erro
    uploadLogger.error({ err: error }, "Upload failed");
    res.status(500).json({ error: "Upload failed" });
  }
});
