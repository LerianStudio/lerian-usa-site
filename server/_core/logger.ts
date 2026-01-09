import pino from "pino";

// ✅ MEDIUM-9: Logger estruturado para produção

const isDevelopment = process.env.NODE_ENV !== "production";

// Configuração base do logger
const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  
  // Formatação bonita em desenvolvimento, JSON em produção
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,

  // Redact de dados sensíveis
  redact: {
    paths: [
      "password",
      "token",
      "authorization",
      "cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.secret",
    ],
    remove: true,
  },

  // Serializers customizados
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      remoteAddress: req.socket?.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

// Loggers específicos por contexto
export const authLogger = logger.child({ context: "auth" });
export const dbLogger = logger.child({ context: "database" });
export const uploadLogger = logger.child({ context: "upload" });
export const apiLogger = logger.child({ context: "api" });

export default logger;
