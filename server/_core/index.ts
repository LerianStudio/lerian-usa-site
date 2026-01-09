import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { uploadRouter } from "../upload";
import { generalLimiter, authLimiter, publicApiLimiter } from "../middleware/rateLimiter";
import { csrfProtection } from "../middleware/csrfProtection";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ✅ Trust proxy para rate limiting funcionar corretamente atrás de proxy/load balancer
  app.set('trust proxy', 1);

  // ✅ HIGH-1: Security Headers com Helmet
  const isDev = process.env.NODE_ENV === "development";
  
  app.use(
    helmet({
      // Content Security Policy - desabilitado em dev para permitir preview do Manus
      contentSecurityPolicy: isDev ? false : {
        directives: {
          defaultSrc: ["'self'"],
          // Permitir iframe do Manus para preview
          frameAncestors: ["'self'", "https://*.manus.computer", "https://*.manus.space", "https://*.manus.im"],
          scriptSrc: [
            "'self'",
            ...(process.env.NODE_ENV === "development" ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
            "https://www.youtube.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
          ],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https:",
          ],
          connectSrc: [
            "'self'",
            ...(process.env.NODE_ENV === "development" ? ["ws://localhost:*", "http://localhost:*"] : []),
          ],
          frameSrc: [
            "'self'",
            "https://www.youtube.com",
            "https://www.youtube-nocookie.com",
          ],
          mediaSrc: [
            "'self'",
            "https://www.youtube.com",
          ],
          objectSrc: ["'none'"],
        },
      },
      // HTTP Strict Transport Security (HSTS)
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // Prevent clickjacking - desabilitado para permitir preview do Manus
      // O frame-ancestors no CSP já protege contra clickjacking
      frameguard: false,
      // Prevent MIME type sniffing
      noSniff: true,
      // Hide X-Powered-By header
      hidePoweredBy: true,
      // XSS Protection (legacy browsers)
      xssFilter: true,
      // Referrer Policy
      referrerPolicy: {
        policy: "strict-origin-when-cross-origin",
      },
      // Cross-Origin policies
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // ✅ Permissions Policy customizado
  app.use((req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
    );
    next();
  });

  // ✅ HIGH-2: Rate Limiting Global
  app.use(generalLimiter);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback (com rate limit de auth)
  app.use("/api/oauth", authLimiter);
  registerOAuthRoutes(app);

  // ✅ HIGH-4: CSRF Protection para endpoints de mutação
  app.use("/api", csrfProtection);

  // Upload endpoint (rate limit específico no próprio router)
  app.use("/api", uploadRouter);

  // tRPC API (com rate limit de API pública)
  app.use("/api/trpc", publicApiLimiter);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
