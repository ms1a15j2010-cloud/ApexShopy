const mongoose = require("mongoose");
const https = require("https");
const Product = require("./models/Product");

require("dotenv").config({
  path: __dirname + "/.env",
});

const FEED_URL = process.env.ADMITAD_FEED_URL;

if (!FEED_URL) {
  throw new Error(
    "ADMITAD_FEED_URL is missing from backend/.env"
  );
}

const BATCH_SIZE = 500;

// ============================================================
// CATEGORY RULES
//
// ApexShopy categories are determined from the actual product
// name instead of blindly trusting the Admitad category.
// ============================================================

const CATEGORY_RULES = {
  Wearables: [
    "smart watch",
    "smartwatch",
    "fitness tracker",
    "fitness band",
    "smart band",
    "sports watch",
    "smart ring",
    "fitness bracelet",
    "activity tracker",
    "heart rate monitor",
    "blood pressure watch",
    "gps watch",
  ],

  "Smart Home": [
    "smart home",
    "home automation",
    "smart bulb",
    "smart lamp",
    "smart plug",
    "smart switch",
    "smart socket",
    "security camera",
    "ip camera",
    "wifi camera",
    "wi-fi camera",
    "doorbell camera",
    "video doorbell",
    "home security",
    "robot vacuum",
    "robot cleaner",
    "smart thermostat",
    "smart sensor",
    "smart door",
    "smart lock",
  ],

  "Sports & Outdoors": [
    "sports",
    "sporting",
    "sportswear",
    "fitness",
    "exercise",
    "gym",
    "gym equipment",
    "workout",
    "weight lifting",
    "weightlifting",
    "barbell",
    "dumbbell",
    "kettlebell",
    "squat stand",
    "squat rack",
    "power rack",
    "bench press",
    "fitness bench",
    "pull up",
    "pull-up",
    "parallel bar",
    "horizontal bar",
    "resistance band",
    "resistance bands",
    "yoga",
    "yoga mat",
    "pilates",
    "running",
    "running shoes",
    "sports shoes",
    "football",
    "soccer",
    "basketball",
    "tennis",
    "volleyball",
    "baseball",
    "badminton",
    "golf",
    "cycling",
    "bicycle",
    "bike",
    "camping",
    "hiking",
    "fishing",
    "outdoor",
    "swimming",
    "boxing",
    "martial arts",
    "sports bag",
  ],

  Apparel: [
    "t-shirt",
    "t shirt",
    "tee shirt",
    "tees",
    "shirt",
    "shirts",
    "top",
    "tops",
    "clothing",
    "apparel",
    "men's clothing",
    "mens clothing",
    "women's clothing",
    "womens clothing",
    "boys clothing",
    "girls clothing",
    "hoodie",
    "hoodies",
    "sweatshirt",
    "sweatshirts",
    "jacket",
    "jackets",
    "coat",
    "coats",
    "pants",
    "trousers",
    "jeans",
    "joggers",
    "shorts",
    "skirt",
    "skirts",
    "dress",
    "dresses",
    "socks",
    "underwear",
    "lingerie",
    "sleepwear",
    "swimwear",
    "leggings",
    "bra",
    "blouse",
    "sweater",
    "vest",
    "tracksuit",
    "uniform",
    "sneakers",
    "shoes",
    "boots",
    "sandals",
    "slippers",
  ],

  Accessories: [
    "bag",
    "bags",
    "backpack",
    "handbag",
    "crossbody",
    "luggage",
    "suitcase",
    "wallet",
    "purse",
    "belt",
    "belts",
    "sunglasses",
    "jewelry",
    "jewellery",
    "necklace",
    "bracelet",
    "earring",
    "earrings",
    "ring",
    "keychain",
    "key chain",
    "watch strap",
    "watch band",
    "phone case",
    "mobile case",
    "tablet case",
    "card holder",
    "passport holder",
  ],

  Electronics: [
    "computer",
    "laptop",
    "desktop",
    "pc",
    "phone",
    "smartphone",
    "mobile phone",
    "tablet",
    "camera",
    "digital camera",
    "webcam",
    "headphone",
    "headphones",
    "earphone",
    "earphones",
    "earbud",
    "earbuds",
    "speaker",
    "bluetooth speaker",
    "gaming",
    "game console",
    "playstation",
    "ps5",
    "ps4",
    "xbox",
    "nintendo",
    "keyboard",
    "mouse",
    "computer mouse",
    "usb",
    "charger",
    "charging cable",
    "power bank",
    "projector",
    "drone",
    "microphone",
    "monitor",
    "display",
    "ssd",
    "hard drive",
    "memory card",
    "router",
    "wifi router",
    "wi-fi router",
    "bluetooth",
    "led tv",
    "television",
    "tv box",
    "electronic",
    "electronics",
  ],

  "Tools & Automotive": [
    "tool",
    "tools",
    "tool parts",
    "hand tool",
    "power tool",
    "drill",
    "saw",
    "wrench",
    "screwdriver",
    "pliers",
    "automotive",
    "auto parts",
    "car parts",
    "car accessory",
    "car accessories",
    "car",
    "vehicle",
    "motorcycle",
    "motorbike",
    "engine",
    "brake",
    "brakes",
    "crankshaft",
    "throttle body",
    "fuel pump",
    "pump assembly",
    "diesel engine",
    "spark plug",
    "air filter",
    "oil filter",
    "bearing",
    "pulley",
    "valve",
    "gasket",
    "replacement parts",
  ],
};

// ============================================================
// CATEGORY CLASSIFIER
// ============================================================

function classifyCategory(name, feedCategory) {
  const productName = String(name || "").toLowerCase();
  const originalCategory = String(
    feedCategory || ""
  ).toLowerCase();

  // ----------------------------------------------------------
  // IMPORTANT:
  //
  // Product name gets priority over Admitad category.
  // This prevents products incorrectly marked "Tool Parts"
  // by the feed from being placed into Tools & Automotive.
  // ----------------------------------------------------------

  const categoryPriority = [
    "Wearables",
    "Smart Home",
    "Sports & Outdoors",
    "Apparel",
    "Accessories",
    "Electronics",
    "Tools & Automotive",
  ];

  for (const category of categoryPriority) {
    const keywords = CATEGORY_RULES[category];

    for (const keyword of keywords) {
      if (productName.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  // ----------------------------------------------------------
  // If the product name did not identify a category,
  // inspect the original Admitad category.
  // ----------------------------------------------------------

  if (originalCategory) {
    for (const category of categoryPriority) {
      const keywords = CATEGORY_RULES[category];

      for (const keyword of keywords) {
        if (
          originalCategory.includes(
            keyword.toLowerCase()
          )
        ) {
          return category;
        }
      }
    }
  }

  // ----------------------------------------------------------
  // Final fallback
  // ----------------------------------------------------------

  return "Other";
}

// ============================================================
// HELPER: DOWNLOAD CSV
// ============================================================

function downloadCSV(url, attempt = 1) {
  return new Promise((resolve, reject) => {
    console.log(
      `Downloading Admitad feed... attempt ${attempt}/5`
    );

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
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return downloadCSV(
            res.headers.location,
            attempt
          )
            .then(resolve)
            .catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(
            new Error(
              `Admitad returned HTTP ${res.statusCode}`
            )
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
      request.destroy(
        new Error(
          "Admitad download timed out"
        )
      );
    });

    request.on("error", reject);
  });
}

// ============================================================
// CSV PARSER
// ============================================================

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      char === ";" &&
      !insideQuotes
    ) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);

  return result;
}

// ============================================================
// CLEAN VALUE
// ============================================================

function cleanValue(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .trim();
}

// ============================================================
// PARSE CSV
// ============================================================

function parseCSV(csv) {
  const lines = csv
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error(
      "CSV contains no products"
    );
  }

  const headers = parseCSVLine(
    lines[0]
  ).map((header) =>
    cleanValue(header).toLowerCase()
  );

  console.log("");
  console.log("CSV columns:");
  console.log(headers.join(";"));
  console.log("");

  const products = [];

  for (
    let i = 1;
    i < lines.length;
    i++
  ) {
    const values =
      parseCSVLine(lines[i]);

    const product = {};

    headers.forEach(
      (header, index) => {
        product[header] =
          cleanValue(
            values[index]
          );
      }
    );

    products.push(product);
  }

  return products;
}

// ============================================================
// PRICE PARSER
// ============================================================

function parsePrice(value) {
  if (!value) {
    return NaN;
  }

  let cleaned = String(value)
    .replace(/[^\d.,-]/g, "")
    .trim();

  if (
    cleaned.includes(",") &&
    cleaned.includes(".")
  ) {
    if (
      cleaned.lastIndexOf(",") >
      cleaned.lastIndexOf(".")
    ) {
      cleaned = cleaned
        .replace(/\./g, "")
        .replace(",", ".");
    } else {
      cleaned =
        cleaned.replace(
          /,/g,
          ""
        );
    }
  } else if (
    cleaned.includes(",")
  ) {
    cleaned =
      cleaned.replace(
        ",",
        "."
      );
  }

  return Number.parseFloat(
    cleaned
  );
}

// ============================================================
// IMAGE NORMALIZER
// ============================================================

function normalizeImage(url) {
  if (!url) {
    return "";
  }

  return String(url).trim();
}

// ============================================================
// IMPORT PRODUCTS
// ============================================================

async function importProducts() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing from backend/.env"
      );
    }

    console.log(
      "Connecting to MongoDB..."
    );

    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 30000,
      }
    );

    console.log(
      "MongoDB connected."
    );
    console.log("");

    // ----------------------------------------------------------
    // DOWNLOAD FEED
    // ----------------------------------------------------------

    let csv;

    for (
      let attempt = 1;
      attempt <= 5;
      attempt++
    ) {
      try {
        csv =
          await downloadCSV(
            FEED_URL,
            attempt
          );

        break;
      } catch (error) {
        console.log(
          `Download failed: ${error.message}`
        );

        if (attempt === 5) {
          throw error;
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              3000
            )
        );
      }
    }

    console.log(
      `Downloaded ${csv.length} characters.`
    );

    // ----------------------------------------------------------
    // PARSE FEED
    // ----------------------------------------------------------

    const products =
      parseCSV(csv);

    console.log(
      `Found ${products.length} products.`
    );

    console.log("");

    // ----------------------------------------------------------
    // STATISTICS
    // ----------------------------------------------------------

    const categoryStats = {};

    let imported = 0;
    let skipped = 0;
    let batch = [];

    // ----------------------------------------------------------
    // PROCESS PRODUCTS
    // ----------------------------------------------------------

    for (
      let i = 0;
      i < products.length;
      i++
    ) {
      const item =
        products[i];

      const externalId =
        cleanValue(item.id);

      const name =
        cleanValue(item.name);

      const url =
        cleanValue(item.url);

      const feedCategory =
        cleanValue(
          item.category
        );

      const image =
        normalizeImage(
          item.picture
        );

      const price =
        parsePrice(
          item.price
        );

      // --------------------------------------------------------
      // REQUIRED FIELDS
      // --------------------------------------------------------

      if (
        !externalId ||
        !name ||
        !Number.isFinite(
          price
        ) ||
        price < 0
      ) {
        skipped++;
        continue;
      }

      // --------------------------------------------------------
      // CLASSIFY PRODUCT
      // --------------------------------------------------------

      const category =
        classifyCategory(
          name,
          feedCategory
        );

      // --------------------------------------------------------
      // CATEGORY STATISTICS
      // --------------------------------------------------------

      categoryStats[category] =
        (categoryStats[category] ||
          0) + 1;

      // --------------------------------------------------------
      // DATABASE OPERATION
      // --------------------------------------------------------

      batch.push({
        updateOne: {
          filter: {
            name:
              name.substring(
                0,
                200
              ),
          },

          update: {
            $set: {
              name:
                name.substring(
                  0,
                  200
                ),

              description:
                "AliExpress product. Buy from AliExpress.",

              price,

              pricePKR: price,

              priceUSD: null,

              category,

              image,

              stock: 1,

              affiliateUrl:
                url,

              source:
                "AliExpress",

              externalId,
            },
          },

          upsert: true,
        },
      });

      // --------------------------------------------------------
      // WRITE BATCH
      // --------------------------------------------------------

      if (
        batch.length >=
        BATCH_SIZE
      ) {
        const result =
          await Product.bulkWrite(
            batch,
            {
              ordered: false,
            }
          );

        imported +=
          (result.upsertedCount ||
            0) +
          (result.modifiedCount ||
            0);

        batch = [];

        console.log(
          `Processed ${
            i + 1
          } / ${
            products.length
          } | Imported/Updated: ${imported} | Skipped: ${skipped}`
        );
      }
    }

    // ----------------------------------------------------------
    // REMAINING BATCH
    // ----------------------------------------------------------

    if (
      batch.length > 0
    ) {
      const result =
        await Product.bulkWrite(
          batch,
          {
            ordered: false,
          }
        );

      imported +=
        (result.upsertedCount ||
          0) +
        (result.modifiedCount ||
          0);
    }

    // ----------------------------------------------------------
    // FINAL REPORT
    // ----------------------------------------------------------

    console.log("");

    console.log(
      "================================="
    );

    console.log(
      "ALIEXPRESS IMPORT COMPLETED"
    );

    console.log(
      "================================="
    );

    console.log(
      `Imported/Updated: ${imported}`
    );

    console.log(
      `Skipped:          ${skipped}`
    );

    console.log(
      `Total:            ${products.length}`
    );

    console.log("");

    console.log(
      "CATEGORY DISTRIBUTION:"
    );

    console.log(
      "---------------------------------"
    );

    Object.entries(
      categoryStats
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .forEach(
        ([category, count]) => {
          console.log(
            `${category}: ${count}`
          );
        }
      );

    console.log(
      "================================="
    );

    const total =
      await Product.countDocuments();

    console.log(
      `Total products in MongoDB: ${total}`
    );

    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected."
    );

    console.log(
      "Import completed successfully."
    );
  } catch (error) {
    console.error("");

    console.error(
      "IMPORT FAILED:"
    );

    console.error(
      error.message
    );

    await mongoose
      .disconnect()
      .catch(() => {});

    process.exit(1);
  }
}

// ============================================================
// START
// ============================================================

importProducts();