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

  /*
    Keep the existing `price` field intact.

    If pricePKR exists, use it as the PKR display price.
    Otherwise fall back to the existing price field.
  */

  const pricePKR =
    Number.isFinite(Number(product.pricePKR))
      ? Number(product.pricePKR)
      : Number(product.price);

  /*
    priceUSD is optional for existing products.

    We deliberately DO NOT guess a USD price from PKR here.
    Existing products will receive priceUSD when the
    Admitad importer is updated.
  */

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

  /*
    Keep legacy `price` synchronized with PKR so the
    existing frontend/cart continues working.
  */

  normalized.price =
    normalized.pricePKR;

  return normalized;
}

// ============================================================
// GET PRODUCTS
// Pagination + Search
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
    // Build MongoDB filter
    // ----------------------------------------------------------

    const filter = {};

    if (search) {
      const safeSearch =
        escapeRegex(search);

      filter.$or = [
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
      ];
    }

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

    /*
      If pricePKR is supplied but legacy price isn't,
      keep the old `price` field compatible.
    */

    if (
      body.price === undefined &&
      body.pricePKR !== undefined
    ) {
      body.price =
        Number(body.pricePKR);
    }

    /*
      If price is supplied but pricePKR isn't,
      preserve compatibility by treating the existing
      price as the PKR price.
    */

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

    /*
      Keep price and pricePKR synchronized
      when only one is supplied.
    */

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