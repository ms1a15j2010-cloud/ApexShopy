const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

async function resetAdminPassword() {
  try {
    console.log("Connecting to MongoDB...");

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not configured in the .env file."
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log("MongoDB connected.");

    const username = "admin";

    const newPassword = "Admin@123456";

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    const admin = await Admin.findOneAndUpdate(
      { username },
      {
        username,
        password: hashedPassword,
        role: "admin",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    console.log("");
    console.log("==========================================");
    console.log("ADMIN PASSWORD RESET SUCCESSFULLY");
    console.log("==========================================");
    console.log("Username:", admin.username);
    console.log("Password:", newPassword);
    console.log("Role:", admin.role);
    console.log("ID:", admin._id.toString());
    console.log("==========================================");
    console.log("");
    console.log("You can now log in to the ApexShopy Admin Panel.");
    console.log("");

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
    console.log("Done.");

  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error("ADMIN PASSWORD RESET FAILED");
    console.error("==========================================");
    console.error(error.message);
    console.error("==========================================");
    console.error("");

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error(
        "MongoDB disconnect error:",
        disconnectError.message
      );
    }

    process.exit(1);
  }
}

resetAdminPassword();