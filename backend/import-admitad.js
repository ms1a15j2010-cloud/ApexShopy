const mongoose = require("mongoose");
const https = require("https");
const Product = require("./models/Product");
require("dotenv").config({ path: __dirname + "/.env" });

const FEED_URL = process.env.ADMITAD_FEED_URL;

if (!FEED_URL) {
  throw new Error("ADMITAD_FEED_URL is missing from backend/.env");
}

const BATCH_SIZE = 500;

function downloadCSV(url, attempt = 1) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading Admitad feed... attempt ${attempt}/5`);

    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/csv,*/*",
        },
        timeout: 120000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadCSV(res.headers.location, attempt)
            .then(resolve)
            .catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(
            new Error(`Admitad returned HTTP ${res.statusCode}`)
          );
        }

        let data = "";

        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });

        res.on("error", reject);
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("Admitad download timed out"));
    });

    request.on("error", reject);
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ";" && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);

  return result;
}

function cleanValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .trim();
}

function parseCSV(csv) {
  const lines = csv
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV contains no products");
  }

  const headers = parseCSVLine(lines[0]).map((header) =>
    cleanValue(header).toLowerCase()
  );

  console.log("");
  console.log("CSV columns:");
  console.log(headers.join(";"));
  console.log("");

  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    const product = {};

    headers.forEach((header, index) => {
      product[header] = cleanValue(values[index]);
    });

    products.push(product);
  }

  return products;
}

function parsePrice(value) {
  if (!value) {
    return NaN;
  }

  let cleaned = String(value)
    .replace(/[^\d.,-]/g, "")
    .trim();

  // Handle European decimal format if needed
  if (cleaned.includes(",") && cleaned.includes(".")) {
    if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }

  return Number.parseFloat(cleaned);
}

function normalizeImage(url) {
  if (!url) {
    return "";
  }

  return String(url).trim();
}

async function importProducts() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log("MongoDB connected.");
    console.log("");

    let csv;

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        csv = await downloadCSV(FEED_URL, attempt);
        break;
      } catch (error) {
        console.log(`Download failed: ${error.message}`);

        if (attempt === 5) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    console.log(`Downloaded ${csv.length} characters.`);

    const products = parseCSV(csv);

    console.log(`Found ${products.length} products.`);
    console.log("");

    let imported = 0;
    let skipped = 0;
    let batch = [];

    for (let i = 0; i < products.length; i++) {
      const item = products[i];

      const externalId = cleanValue(item.id);
      const name = cleanValue(item.name);
      const url = cleanValue(item.url);
      const category = cleanValue(item.category);
      const image = normalizeImage(item.picture);

      const price = parsePrice(item.price);

      // Required fields
      if (!externalId || !name || !Number.isFinite(price) || price < 0) {
        skipped++;
        continue;
      }

      batch.push({
        updateOne: {
          filter: {
            name: name.substring(0, 200),
          },
          update: {
            $set: {
              name: name.substring(0, 200),
              description: `AliExpress product. Buy from AliExpress.`,
              price,
              category: category || "AliExpress",
              image,
              stock: 1,
              affiliateUrl: url,
              source: "AliExpress",
              externalId,
            },
          },
          upsert: true,
        },
      });

      if (batch.length >= BATCH_SIZE) {
        const result = await Product.bulkWrite(batch, {
          ordered: false,
        });

        imported +=
          (result.upsertedCount || 0) +
          (result.modifiedCount || 0);

        batch = [];

        console.log(
          `Processed ${i + 1} / ${products.length} | Imported/Updated: ${imported} | Skipped: ${skipped}`
        );
      }
    }

    // Process remaining products
    if (batch.length > 0) {
      const result = await Product.bulkWrite(batch, {
        ordered: false,
      });

      imported +=
        (result.upsertedCount || 0) +
        (result.modifiedCount || 0);
    }

    console.log("");
    console.log("=================================");
    console.log("ALIEXPRESS IMPORT COMPLETED");
    console.log("=================================");
    console.log(`Imported/Updated: ${imported}`);
    console.log(`Skipped:          ${skipped}`);
    console.log(`Total:            ${products.length}`);
    console.log("=================================");

    await mongoose.disconnect();
  } catch (error) {
    console.error("");
    console.error("IMPORT FAILED:");
    console.error(error.message);

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
}

importProducts();