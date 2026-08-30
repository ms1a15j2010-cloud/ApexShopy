const mongoose = require("mongoose");

// ============================================================
// ADMIN SCHEMA
// ============================================================

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "admin",
      enum: ["admin"],
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// ADMIN MODEL
// ============================================================

const Admin =
  mongoose.models.Admin ||
  mongoose.model("Admin", adminSchema);

module.exports = Admin;

