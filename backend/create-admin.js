const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

// ============================================================
// CREATE INITIAL ADMIN ACCOUNT
// ============================================================

async function createAdmin() {
  try {
    // ----------------------------------------------------------
    // Check environment variables
    // ----------------------------------------------------------

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not configured in backend/.env"
      );
    }

    if (!process.env.ADMIN_PASSWORD_HASH) {
      throw new Error(
        "ADMIN_PASSWORD_HASH is not configured in backend/.env"
      );
    }

    // ----------------------------------------------------------
    // Connect to MongoDB
    // ----------------------------------------------------------

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected.");

    // ----------------------------------------------------------
    // Admin username
    // ----------------------------------------------------------

    const username = "admin";

    // ----------------------------------------------------------
    // Check whether admin already exists
    // ----------------------------------------------------------

    const existingAdmin = await Admin.findOne({
      username,
    });

    if (existingAdmin) {
      console.log(
        `Admin "${username}" already exists.`
      );

      console.log(
        "No new admin account was created."
      );

      await mongoose.disconnect();

      return;
    }

    // ----------------------------------------------------------
    // Verify the supplied bcrypt hash
    // ----------------------------------------------------------

    const hash = process.env.ADMIN_PASSWORD_HASH;

    if (
      typeof hash !== "string" ||
      !hash.startsWith("$2")
    ) {
      throw new Error(
        "ADMIN_PASSWORD_HASH does not appear to be a valid bcrypt hash."
      );
    }

    // ----------------------------------------------------------
    // Create admin
    // ----------------------------------------------------------

    const admin = await Admin.create({
      username,
      password: hash,
      role: "admin",
    });

    console.log("");
    console.log("==========================================");
    console.log("ADMIN ACCOUNT CREATED SUCCESSFULLY");
    console.log("==========================================");
    console.log(`Username: ${admin.username}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`ID:       ${admin._id}`);
    console.log("==========================================");
    console.log("");

    // ----------------------------------------------------------
    // Disconnect
    // ----------------------------------------------------------

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
    console.log("Done.");
  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error("FAILED TO CREATE ADMIN ACCOUNT");
    console.error("==========================================");
    console.error(error.message);
    console.error("==========================================");
    console.error("");

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors.
    }

    process.exit(1);
  }
}

// ============================================================
// RUN
// ============================================================

createAdmin();

