const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

app.use(express.json({ limit: "1mb" }));

// ============================================================
// STATIC IMAGES
// ============================================================

app.use(
  "/images",
  express.static(
    path.join(__dirname, "..", "public", "images")
  )
);

// ============================================================
// MONGODB CONNECTION
// ============================================================

let mongoConnectionPromise = null;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI environment variable is not configured"
    );
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  await mongoConnectionPromise;
}

// ============================================================
// ROOT / HEALTH CHECK
// ============================================================

app.get("/", async (req, res) => {
  try {
    await connectDatabase();

    return res.json({
      success: true,
      message: "ApexShopy backend is running",
    });
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ============================================================
// AUTHENTICATION ROUTES
//
// IMPORTANT:
// These routes do NOT require MongoDB.
// This prevents Vercel login from failing because of
// a database connection problem.
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);

// ============================================================
// DATABASE MIDDLEWARE
//
// Only database-dependent API routes come after this.
// ============================================================

app.use(
  async (req, res, next) => {
    try {
      await connectDatabase();
      next();
    } catch (error) {
      console.error(
        "MongoDB connection failed:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: error.message,
      });
    }
  }
);

// ============================================================
// PRODUCT ROUTES
// ============================================================

app.use(
  "/api/products",
  productRoutes
);

// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,
      message: "API endpoint not found.",
    });
  }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
);

// ============================================================
// START SERVER
// ============================================================

if (require.main === module) {
  const PORT =
    process.env.PORT || 5000;

  connectDatabase()
    .then(() => {
      app.listen(
        PORT,
        () => {
          console.log(
            `ApexShopy backend running on port ${PORT}`
          );
        }
      );
    })
    .catch((error) => {
      console.error(
        "MongoDB connection failed:"
      );

      console.error(
        error.message
      );

      process.exit(1);
    });
}

// ============================================================
// EXPORT APP
// ============================================================

module.exports = app;

