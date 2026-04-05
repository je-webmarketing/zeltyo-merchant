import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: "Token manquant",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      businessId: decoded.businessId,
      name: decoded.name || "",
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: "Token invalide ou expiré",
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: "Utilisateur non authentifié",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: "Accès refusé",
      });
    }

    return next();
  };
}

export function requireBusinessAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      error: "Utilisateur non authentifié",
    });
  }

  const requestedBusinessId =
    req.params.businessId ||
    req.body.businessId ||
    req.query.businessId ||
    null;

  if (!requestedBusinessId) {
    return next();
  }

  if (req.user.businessId !== requestedBusinessId) {
    return res.status(403).json({
      ok: false,
      error: "Accès interdit à ce commerce",
    });
  }

  return next();
}