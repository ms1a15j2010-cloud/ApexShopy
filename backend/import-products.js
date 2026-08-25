const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

async function importProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    const productsPath = path.join(__dirname, "..", "products.json");
    const products = JSON.parse(
      fs.readFileSync(productsPath, "utf8")
    );

    console.log(`Found ${products.length} products in products.json.`);

    let imported = 0;
    let skipped = 0;

    for (const product of products) {
      const existingProduct = await Product.findOne({
        name: product.name,
      });

      if (existingProduct) {
        skipped++;
        continue;
      }

      await Product.create({
        name: product.name,
        description: product.description || "",
        price: product.price,
        category: product.category || "",
        image: product.image || "",
        stock:
          typeof product.stock !== "undefined"
            ? product.stock
            : 0,
      });

      imported++;
    }

    console.log(`Imported: ${imported}`);
    console.log(`Skipped existing: ${skipped}`);

    const total = await Product.countDocuments();

    console.log(`Total products in MongoDB: ${total}`);

    await mongoose.disconnect();

    console.log("Import completed successfully.");
  } catch (error) {
    console.error("Import failed:");
    console.error(error.message);

    process.exit(1);
  }
}

importProducts();