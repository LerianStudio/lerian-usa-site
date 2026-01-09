import { Request, Response, NextFunction } from "express";

/**
 * HIGH-4: CSRF Protection via Origin/Referer Validation
 * 
 * Esta é uma abordagem moderna e eficaz para proteção CSRF que:
 * 1. Valida o header Origin em requests de mutação
 * 2. Fallback para Referer se Origin não estiver presente
 * 3. Permite requests same-origin e de origens confiáveis
 * 
 * Combinado com cookies SameSite=Strict, oferece proteção robusta.
 */

// Lista de origens permitidas (strings e patterns)
const ALLOWED_ORIGIN_STRINGS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://localhost:3000",
];

// Adicionar domínio de produção se configurado
if (process.env.VITE_APP_URL) {
  ALLOWED_ORIGIN_STRINGS.push(process.env.VITE_APP_URL);
}

// Patterns para domínios dinâmicos
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/.*\.manus\.space$/,
  /^https:\/\/.*\.manus\.computer$/,
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  
  // Verificar strings exatas
  if (ALLOWED_ORIGIN_STRINGS.includes(origin)) {
    return true;
  }
  
  // Verificar patterns
  return ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));
}

function extractOriginFromReferer(referer: string | undefined): string | undefined {
  if (!referer) return undefined;
  try {
    const url = new URL(referer);
    return url.origin;
  } catch {
    return undefined;
  }
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Permitir métodos seguros (GET, HEAD, OPTIONS)
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Obter Origin ou extrair do Referer
  const origin = req.headers.origin || extractOriginFromReferer(req.headers.referer);

  // Se não há Origin/Referer, pode ser request server-to-server ou ferramenta de teste
  if (!origin) {
    // Em desenvolvimento, permitir requests sem origin (Postman, curl, etc.)
    if (process.env.NODE_ENV === "development") {
      return next();
    }
    // Em produção, rejeitar requests sem origin para endpoints de mutação
    console.warn(`[CSRF] Request without origin: ${req.method} ${req.path}`);
    return res.status(403).json({
      error: "Forbidden",
      code: "CSRF_ORIGIN_MISSING",
      message: "Origin header required for this request",
    });
  }

  // Verificar se a origem é permitida
  if (!isAllowedOrigin(origin)) {
    console.warn(`[CSRF] Invalid origin: ${origin} for ${req.method} ${req.path}`);
    return res.status(403).json({
      error: "Forbidden",
      code: "CSRF_ORIGIN_INVALID",
      message: "Request origin not allowed",
    });
  }

  next();
}

/**
 * Middleware mais restritivo para operações críticas
 * Requer Origin mesmo em desenvolvimento
 */
export function strictCsrfProtection(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin || extractOriginFromReferer(req.headers.referer);

  if (!origin || !isAllowedOrigin(origin)) {
    console.warn(`[CSRF-Strict] Blocked: ${origin || "no origin"} for ${req.method} ${req.path}`);
    return res.status(403).json({
      error: "Forbidden",
      code: "CSRF_VALIDATION_FAILED",
      message: "CSRF validation failed",
    });
  }

  next();
}
