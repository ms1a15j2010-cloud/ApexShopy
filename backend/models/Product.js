const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ==============================
    // BASIC PRODUCT INFORMATION
    // ==============================

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Legacy/current price field.
    // Kept as PKR for compatibility.
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Explicit PKR price.
    pricePKR: {
      type: Number,
      min: 0,
      default: null,
    },

    // Original USD price from affiliate/feed data.
    // Never calculated from PKR automatically.
    priceUSD: {
      type: Number,
      min: 0,
      default: null,
    },

    // Currency used by the legacy `price` field.
    currency: {
      type: String,
      default: "PKR",
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==============================
    // ALIEXPRESS / ADMITAD
    // ==============================

    affiliateUrl: {
      type: String,
      default: "",
      trim: true,
    },

    source: {
      type: String,
      default: "",
      trim: true,
    },

    externalId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Product",
    productSchema
  );

