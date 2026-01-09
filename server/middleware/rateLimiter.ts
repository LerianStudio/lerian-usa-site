import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV === "development";

// ============================================================
// RATE LIMITER GERAL (Todas as rotas)
// Em desenvolvimento: 1000 requests por 15 minutos
// Em produção: 100 requests por 15 minutos
// ============================================================
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDev ? 1000 : 100,
  message: {
    error: "Muitas requisições. Tente novamente em 15 minutos.",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// ============================================================
// RATE LIMITER PARA AUTENTICAÇÃO (Mais restritivo)
// Em desenvolvimento: 50 tentativas
// Em produção: 10 tentativas
// ============================================================
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDev ? 50 : 10,
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
    retryAfter: 900,
  },
  skipSuccessfulRequests: true,
});

// ============================================================
// RATE LIMITER PARA UPLOAD (Muito restritivo)
// Em desenvolvimento: 100 uploads por hora
// Em produção: 20 uploads por hora
// ============================================================
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: isDev ? 100 : 20,
  message: {
    error: "Limite de uploads excedido. Tente novamente em 1 hora.",
    code: "UPLOAD_RATE_LIMIT_EXCEEDED",
    retryAfter: 3600,
  },
  skipSuccessfulRequests: false,
});

// ============================================================
// RATE LIMITER PARA API PÚBLICA (Moderado)
// Em desenvolvimento: 500 requests por minuto
// Em produção: 60 requests por minuto
// ============================================================
export const publicApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: isDev ? 500 : 60,
  message: {
    error: "Limite de requisições da API excedido.",
    code: "API_RATE_LIMIT_EXCEEDED",
  },
});

// ============================================================
// RATE LIMITER PARA MUTATIONS (Mais restritivo que queries)
// Em desenvolvimento: 200 mutations a cada 5 minutos
// Em produção: 30 mutations a cada 5 minutos
// ============================================================
export const mutationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: isDev ? 200 : 30,
  message: {
    error: "Muitas operações de escrita. Aguarde alguns minutos.",
    code: "MUTATION_RATE_LIMIT_EXCEEDED",
  },
});
