const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const productRoutes = require("./routes/products");

const app = express();

app.use(cors());

app.use("/images", express.static(path.join(__dirname, "..", "images")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ApexShopy backend is running",
  });
});

app.use("/api/products", productRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`ApexShopy backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  });