const jwt = require("jsonwebtoken");

// ============================================================
// REQUIRE ADMIN AUTHENTICATION
// ============================================================

function requireAdminAuth(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication is not configured.",
      });
    }

    const authorization =
      req.headers.authorization || "";

    const parts =
      authorization.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !== "bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const token = parts[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    if (
      !decoded ||
      decoded.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required.",
      });
    }

    req.admin = {
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token expired.",
      });
    }

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed.",
    });
  }
}

module.exports =
  requireAdminAuth;

