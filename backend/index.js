const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const productRoutes = require("./routes/products");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "..", "images")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ApexShopy backend is running",
  });
});

app.use("/api/products", productRoutes);

let mongoConnection = null;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not configured");
  }

  if (!mongoConnection) {
    mongoConnection = mongoose.connect(process.env.MONGODB_URI);
  }

  await mongoConnection;
}

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`ApexShopy backend running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:");
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = app;

