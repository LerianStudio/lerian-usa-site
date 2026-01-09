import { Request, Response, NextFunction } from "express";
import { sdk } from "../\_core/sdk";

/**
 * Middleware de autenticação obrigatória
 * Verifica se o usuário está autenticado antes de permitir acesso
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await sdk.authenticateRequest(req);

    if (!user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
    }

    // Anexar usuário ao request para uso posterior
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("[Auth Middleware] Error:", error);
    return res.status(401).json({
      error: "Invalid authentication",
      code: "INVALID_TOKEN",
    });
  }
}

/**
 * Middleware de autenticação com verificação de role admin
 */
export async function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await sdk.authenticateRequest(req);

    if (!user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required",
        code: "FORBIDDEN",
      });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("[Admin Auth Middleware] Error:", error);
    return res.status(401).json({
      error: "Invalid authentication",
      code: "INVALID_TOKEN",
    });
  }
}
