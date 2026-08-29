const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// ============================================================
// HELPER: Escape special regex characters
// ============================================================

function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// ============================================================
// HELPER: Normalize product prices
// ============================================================

function normalizeProductPrices(product) {
  const normalized = {
    ...product,
  };

  const pricePKR =
    Number.isFinite(Number(product.pricePKR))
      ? Number(product.pricePKR)
      : Number(product.price);

  const priceUSD =
    Number.isFinite(Number(product.priceUSD))
      ? Number(product.priceUSD)
      : null;

  normalized.pricePKR =
    Number.isFinite(pricePKR)
      ? Number(pricePKR.toFixed(2))
      : 0;

  normalized.priceUSD =
    priceUSD !== null
      ? Number(priceUSD.toFixed(2))
      : null;

  normalized.price =
    normalized.pricePKR;

  return normalized;
}

// ============================================================
// APEXSHOPY CATEGORY KEYWORDS
//
// These mirror the category logic used by the frontend.
//
// IMPORTANT:
// The order matters.
// Wearables and Smart Home are checked before Electronics,
// Sports & Outdoors before Apparel, etc.
// ============================================================

const CATEGORY_RULES = {
  Wearables: [
    "wearable",
    "smart watch",
    "smartwatch",
    "fitness tracker",
    "fitness band",
    "smart band",
    "sports watch",
    "heart rate monitor",
  ],

  "Smart Home": [
    "smart home",
    "home automation",
    "home appliance",
    "security",
    "lighting",
    "smart bulb",
    "smart lamp",
    "smart plug",
    "smart switch",
    "security camera",
    "ip camera",
    "doorbell camera",
    "home security",
    "robot vacuum",
  ],

  "Sports & Outdoors": [
    "sports",
    "sporting",
    "outdoor",
    "fitness",
    "exercise",
    "camping",
    "hiking",
    "cycling",
    "fishing",
    "running",
    "sportswear",
    "gym equipment",
    "workout",
    "yoga",
    "football",
    "soccer",
    "basketball",
    "tennis",
    "volleyball",
    "running shoes",
    "sports shoes",
  ],

  Apparel: [
    "tops",
    "tees",
    "clothing",
    "apparel",
    "men's clothing",
    "women's clothing",
    "boys' clothing",
    "girls' clothing",
    "shoes",
    "sneakers",
    "underwear",
    "sleepwear",
    "jackets",
    "pants",
    "dresses",
    "shirts",
    "hoodies",
    "skirts",
    "socks",
    "t-shirt",
    "t shirt",
    "sweatshirt",
    "jeans",
    "hoodie",
    "joggers",
  ],

  Accessories: [
    "bags",
    "luggage",
    "wallet",
    "jewelry",
    "accessories",
    "keychain",
    "belts",
    "sunglasses",
    "watches",
    "backpack",
    "handbag",
    "crossbody",
    "belt",
    "watch strap",
  ],

  Electronics: [
    "consumer electronics",
    "computer",
    "phones",
    "phone",
    "tablet",
    "electronic",
    "camera",
    "audio",
    "headphone",
    "earphone",
    "speaker",
    "gaming",
    "computer accessories",
    "home electronics",
    "bluetooth",
    "keyboard",
    "mouse",
    "usb",
    "charger",
    "power bank",
    "projector",
    "drone",
    "headphones",
    "earbuds",
  ],

  AccessoriesTools: [
    "tool",
    "tool parts",
    "automotive",
    "car",
    "motorcycle",
    "vehicle",
    "replacement parts",
  ],
};

// ============================================================
// HELPER: Build category MongoDB filter
//
// Category matching is performed against BOTH:
//   - product.category
//   - product.name
//
// This allows products such as:
// "Smart Watch Fitness Tracker"
// to be found even if the database category itself
// is something more generic.
// ============================================================

function buildCategoryFilter(category) {
  if (!category || category === "All") {
    return null;
  }

  const normalizedCategory =
    String(category)
      .trim()
      .toLowerCase();

  let actualCategory = null;

  for (const categoryName of Object.keys(
    CATEGORY_RULES
  )) {
    if (
      categoryName.toLowerCase() ===
      normalizedCategory
    ) {
      actualCategory = categoryName;
      break;
    }
  }

  if (!actualCategory) {
    return null;
  }

  const keywords =
    CATEGORY_RULES[
      actualCategory
    ];

  const expressions = [];

  keywords.forEach(
    (keyword) => {
      const safeKeyword =
        escapeRegex(keyword);

      expressions.push({
        category: {
          $regex: safeKeyword,
          $options: "i",
        },
      });

      expressions.push({
        name: {
          $regex: safeKeyword,
          $options: "i",
        },
      });
    }
  );

  return {
    $or: expressions,
  };
}

// ============================================================
// GET PRODUCTS
// Pagination + Search + Category
// ============================================================

router.get("/", async (req, res) => {
  try {
    // ----------------------------------------------------------
    // Pagination
    // ----------------------------------------------------------

    let page =
      parseInt(req.query.page, 10) || 1;

    let limit =
      parseInt(req.query.limit, 10) || 40;

    if (page < 1) {
      page = 1;
    }

    if (limit < 1) {
      limit = 40;
    }

    // Never allow a request to pull more than 100 products.
    if (limit > 100) {
      limit = 100;
    }

    // ----------------------------------------------------------
    // Search
    // ----------------------------------------------------------

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    // ----------------------------------------------------------
    // Category
    // ----------------------------------------------------------

    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : "";

    // ----------------------------------------------------------
    // Build MongoDB filter
    // ----------------------------------------------------------

    const filterParts = [];

    // ----------------------------------------------------------
    // SEARCH FILTER
    // ----------------------------------------------------------

    if (search) {
      const safeSearch =
        escapeRegex(search);

      filterParts.push({
        $or: [
          {
            name: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            description: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            category: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            source: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            externalId: {
              $regex: safeSearch,
              $options: "i",
            },
          },
        ],
      });
    }

    // ----------------------------------------------------------
    // CATEGORY FILTER
    // ----------------------------------------------------------

    const categoryFilter =
      buildCategoryFilter(
        category
      );

    if (categoryFilter) {
      filterParts.push(
        categoryFilter
      );
    }

    // ----------------------------------------------------------
    // FINAL FILTER
    // ----------------------------------------------------------

    const filter =
      filterParts.length === 0
        ? {}
        : filterParts.length === 1
        ? filterParts[0]
        : {
            $and: filterParts,
          };

    // ----------------------------------------------------------
    // Calculate pagination
    // ----------------------------------------------------------

    const skip =
      (page - 1) * limit;

    // ----------------------------------------------------------
    // Fetch products
    // ----------------------------------------------------------

    const rawProducts =
      await Product.find(filter)
        .sort({
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean();

    // ----------------------------------------------------------
    // Normalize prices
    // ----------------------------------------------------------

    const products =
      rawProducts.map(
        normalizeProductPrices
      );

    // ----------------------------------------------------------
    // Count filtered products
    // ----------------------------------------------------------

    const total =
      await Product.countDocuments(
        filter
      );

    const totalPages =
      total > 0
        ? Math.ceil(
            total / limit
          )
        : 1;

    const hasMore =
      skip +
        products.length <
      total;

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    res.json({
      success: true,
      page,
      limit,
      count: products.length,
      total,
      totalPages,
      hasMore,
      search,
      category:
        category || "All",
      products,
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch products",
      error: error.message,
    });
  }
});

// ============================================================
// GET ONE PRODUCT
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      ).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    const normalizedProduct =
      normalizeProductPrices(
        product
      );

    res.json({
      success: true,
      product:
        normalizedProduct,
    });
  } catch (error) {
    console.error(
      "Get product error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch product",
      error: error.message,
    });
  }
});

// ============================================================
// CREATE PRODUCT
// ============================================================

router.post("/", async (req, res) => {
  try {
    const body = {
      ...req.body,
    };

    // Keep price and pricePKR compatible.

    if (
      body.price === undefined &&
      body.pricePKR !== undefined
    ) {
      body.price =
        Number(body.pricePKR);
    }

    if (
      body.pricePKR === undefined &&
      body.price !== undefined
    ) {
      body.pricePKR =
        Number(body.price);
    }

    const product =
      await Product.create(
        body
      );

    res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error.message
    );

    res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
});

// ============================================================
// UPDATE PRODUCT
// ============================================================

router.put("/:id", async (req, res) => {
  try {
    const body = {
      ...req.body,
    };

    // Keep price and pricePKR synchronized.

    if (
      body.pricePKR !== undefined &&
      body.price === undefined
    ) {
      body.price =
        Number(body.pricePKR);
    }

    if (
      body.price !== undefined &&
      body.pricePKR === undefined
    ) {
      body.pricePKR =
        Number(body.price);
    }

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    res.json({
      success: true,
      message:
        "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error.message
    );

    res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
});

// ============================================================
// DELETE PRODUCT
// ============================================================

router.delete("/:id", async (req, res) => {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    res.json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error.message
    );

    res.status(400).json({
      success: false,
      message:
        "Failed to delete product",
      error: error.message,
    });
  }
});

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;

