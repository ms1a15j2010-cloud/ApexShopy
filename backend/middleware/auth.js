const jwt = require("jsonwebtoken");

// ============================================================
// REQUIRE ADMIN AUTHENTICATION
// ============================================================

function requireAdminAuth(req, res, next) {
  try {
    // ----------------------------------------------------------
    // JWT secret
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // Authorization header
    // ----------------------------------------------------------

    const authorization =
      req.headers.authorization || "";

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    // ----------------------------------------------------------
    // Expected format:
    //
    // Authorization: Bearer YOUR_JWT_TOKEN
    // ----------------------------------------------------------

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
          "Invalid authentication token.",
      });
    }

    const token = parts[1];

    // ----------------------------------------------------------
    // Verify JWT
    // ----------------------------------------------------------

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // ----------------------------------------------------------
    // Verify admin role
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // Store authenticated admin information
    // ----------------------------------------------------------

    req.admin = {
      username: decoded.username,
      role: decoded.role,
    };

    // ----------------------------------------------------------
    // Continue to protected route
    // ----------------------------------------------------------

    next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    // ----------------------------------------------------------
    // Expired token
    // ----------------------------------------------------------

    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token expired.",
      });
    }

    // ----------------------------------------------------------
    // Invalid token
    // ----------------------------------------------------------

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    // ----------------------------------------------------------
    // Other authentication errors
    // ----------------------------------------------------------

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed.",
    });
  }
}

module.exports = requireAdminAuth;

