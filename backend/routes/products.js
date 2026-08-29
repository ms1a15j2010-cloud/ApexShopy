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
// GET PRODUCTS
// Pagination + Search
// ============================================================

router.get("/", async (req, res) => {
  try {
    // ----------------------------------------------------------
    // Pagination
    // ----------------------------------------------------------

    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 40;

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
      const safeSearch = escapeRegex(search);

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

    const skip = (page - 1) * limit;

    // ----------------------------------------------------------
    // Fetch products
    // ----------------------------------------------------------

    const products = await Product.find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // ----------------------------------------------------------
    // Count filtered products
    // ----------------------------------------------------------

    const total = await Product.countDocuments(filter);

    const totalPages =
      total > 0
        ? Math.ceil(total / limit)
        : 1;

    const hasMore =
      skip + products.length < total;

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
      message: "Failed to fetch products",
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
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get product error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// ============================================================
// CREATE PRODUCT
// ============================================================

router.post("/", async (req, res) => {
  try {
    const product =
      await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error.message
    );

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================================
// UPDATE PRODUCT
// ============================================================

router.put("/:id", async (req, res) => {
  try {
    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error.message
    );

    res.status(400).json({
      success: false,
      message: error.message,
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
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error.message
    );

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;