const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ============================================================
// ADMIN LOGIN
// ============================================================

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ----------------------------------------------------------
    // Validate request
    // ----------------------------------------------------------

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    // ----------------------------------------------------------
    // Check required environment variables
    // ----------------------------------------------------------

    if (
      !process.env.ADMIN_USERNAME ||
      !process.env.ADMIN_PASSWORD_HASH ||
      !process.env.JWT_SECRET
    ) {
      console.error(
        "Admin authentication environment variables are not configured."
      );

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    // ----------------------------------------------------------
    // Normalize username
    // ----------------------------------------------------------

    const suppliedUsername =
      username.trim().toLowerCase();

    const configuredUsername =
      process.env.ADMIN_USERNAME
        .trim()
        .toLowerCase();

    // ----------------------------------------------------------
    // Check username
    //
    // We deliberately return the same error message for an
    // incorrect username or password.
    // ----------------------------------------------------------

    if (suppliedUsername !== configuredUsername) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // ----------------------------------------------------------
    // Check password
    // ----------------------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        password,
        process.env.ADMIN_PASSWORD_HASH
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // ----------------------------------------------------------
    // Create JWT
    // ----------------------------------------------------------

    const token = jwt.sign(
      {
        username: configuredUsername,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    // ----------------------------------------------------------
    // Successful login
    // ----------------------------------------------------------

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        username: configuredUsername,
        role: "admin",
      },
    });

  } catch (error) {
    console.error(
      "Admin login error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
});

// ============================================================
// VERIFY CURRENT ADMIN TOKEN
// ============================================================

router.get("/verify", (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const authorization =
      req.headers.authorization || "";

    const parts =
      authorization.trim().split(" ");

    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !== "bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const decoded =
      jwt.verify(
        parts[1],
        process.env.JWT_SECRET
      );

    if (
      !decoded ||
      decoded.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    return res.json({
      success: true,
      authenticated: true,
      admin: {
        username: decoded.username,
        role: decoded.role,
      },
    });

  } catch (error) {
    console.error(
      "Admin verification error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      authenticated: false,
      message: "Invalid or expired authentication token.",
    });
  }
});

module.exports = router;

