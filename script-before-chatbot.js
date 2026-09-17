/* =====================================
   APEXSHOPY - STORE CONFIGURATION & STATE
===================================== */

const API_BASE_URL =
  "https://backend-kappa-orcin-35.vercel.app";

/* =====================================
   GOOGLE ANALYTICS 4
===================================== */

const GA4_MEASUREMENT_ID = "G-SKJ7KCSQNL";

function initGoogleAnalytics() {
  if (
    !GA4_MEASUREMENT_ID ||
    GA4_MEASUREMENT_ID === "G-XXXXXXXXXX"
  ) {
    console.warn(
      "Google Analytics Measurement ID is not configured."
    );
    return;
  }

  /* Prevent duplicate Google Analytics installation */
  if (
    document.querySelector(
      'script[data-apex-ga4="true"]'
    )
  ) {
    return;
  }

  window.dataLayer =
    window.dataLayer || [];

  window.gtag = function () {
    window.dataLayer.push(
      arguments
    );
  };

  window.gtag(
    "js",
    new Date()
  );

  window.gtag(
    "config",
    GA4_MEASUREMENT_ID,
    {
      send_page_view: true
    }
  );

  const script =
    document.createElement(
      "script"
    );

  script.async = true;

  script.src =
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      GA4_MEASUREMENT_ID
    )}`;

  script.dataset.apexGa4 =
    "true";

  document.head.appendChild(
    script
  );

  console.log(
    "Google Analytics 4 initialized:",
    GA4_MEASUREMENT_ID
  );
}

/* =====================================
   GA4 EVENT HELPER
===================================== */

function trackGA4Event(
  eventName,
  parameters = {}
) {
  if (
    typeof window.gtag !==
    "function"
  ) {
    return;
  }

  try {
    window.gtag(
      "event",
      eventName,
      parameters
    );
  } catch (error) {
    console.warn(
      "GA4 event failed:",
      eventName,
      error
    );
  }
}

/* =====================================
   GA4 PRODUCT VIEW
===================================== */

function trackProductView(
  product
) {
  if (!product) {
    return;
  }

  const productId =
    getProductId(product);

  const prices =
    getDisplayPrices(product);

  trackGA4Event(
    "view_item",
    {
      currency: "PKR",

      value:
        Number(
          prices.pricePKR
        ) || 0,

      items: [
        {
          item_id:
            String(
              productId || ""
            ),

          item_name:
            product.name ||
            "Product",

          item_category:
            getApexCategory(
              product
            ),

          price:
            Number(
              prices.pricePKR
            ) || 0
        }
      ]
    }
  );
}

/* =====================================
   GA4 ADD TO CART
===================================== */

function trackAddToCart(
  product,
  quantity = 1
) {
  if (!product) {
    return;
  }

  const productId =
    getProductId(product);

  const prices =
    getDisplayPrices(product);

  const price =
    Number(
      prices.pricePKR
    ) || 0;

  const finalQuantity =
    Number(quantity || 1);

  trackGA4Event(
    "add_to_cart",
    {
      currency: "PKR",

      value:
        price *
        finalQuantity,

      items: [
        {
          item_id:
            String(
              productId || ""
            ),

          item_name:
            product.name ||
            "Product",

          item_category:
            getApexCategory(
              product
            ),

          price: price,

          quantity:
            finalQuantity
        }
      ]
    }
  );
}

/* =====================================
   GA4 SEARCH
===================================== */

function trackSearch(
  searchTerm
) {
  const term =
    String(
      searchTerm || ""
    ).trim();

  if (!term) {
    return;
  }

  trackGA4Event(
    "search",
    {
      search_term: term
    }
  );
}

/* =====================================
   GA4 CATEGORY SELECTION
===================================== */

function trackCategorySelection(
  category
) {
  if (!category) {
    return;
  }

  trackGA4Event(
    "select_content",
    {
      content_type:
        "product_category",

      item_id:
        String(category)
    }
  );
}

/* =====================================
   GA4 AFFILIATE CLICK
===================================== */

function trackAffiliateClick(
  product
) {
  if (!product) {
    return;
  }

  const source =
    String(
      product.source || ""
    ).trim();

  trackGA4Event(
    "affiliate_click",
    {
      affiliate_source:
        source || "unknown",

      product_id:
        String(
          getProductId(product) ||
            ""
        ),

      product_name:
        product.name ||
        "Product",

      product_category:
        getApexCategory(
          product
        )
    }
  );
}

/* =====================================
   GA4 CHECKOUT START
===================================== */

function trackCheckoutStart() {
  if (
    !Array.isArray(cart) ||
    cart.length === 0
  ) {
    return;
  }

  let totalPKR = 0;

  const items =
    cart.map(
      (item) => {
        const quantity =
          Number(
            item.quantity
          ) || 1;

        const price =
          getPricePKR(
            item
          );

        totalPKR +=
          price *
          quantity;

        return {
          item_id:
            String(
              getProductId(item) ||
                ""
            ),

          item_name:
            item.name ||
            "Product",

          item_category:
            getApexCategory(
              item
            ),

          price:
            Number(price) || 0,

          quantity:
            quantity
        };
      }
    );

  trackGA4Event(
    "begin_checkout",
    {
      currency: "PKR",

      value: totalPKR,

      items: items
    }
  );
}

/* =====================================
   SOCIAL LINKS
===================================== */

const SOCIAL_LINKS = {
  facebook:
    "https://www.facebook.com/share/p/19WQNXqUhe/",

  instagram:
    "https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=10s3kk6s",

  reddit:
    "https://www.reddit.com/user/apexshopy"
};

/* =====================================
   STORE STATE
===================================== */

const USD_TO_PKR = 277;

let products = [];

let cart =
  loadCartFromStorage();

let activeCategory =
  "All";

let searchQuery =
  "";

let currentPage =
  1;

const productsPerPage =
  100;

let hasMoreProducts =
  true;

let isLoadingProducts =
  false;

let searchTimer =
  null;

/* =====================================
   AFFILIATE BUTTON STYLE
===================================== */

function injectAffiliateStyles() {
  if (
    document.getElementById(
      "apex-affiliate-button-styles"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "apex-affiliate-button-styles";

  style.textContent = `
    .affiliate-buy-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      min-height: 42px !important;
      box-sizing: border-box !important;
      margin-top: 10px !important;
      padding: 11px 16px !important;
      border: 1px solid #ff6a00 !important;
      border-radius: 10px !important;
      background: #ffffff !important;
      color: #ff6a00 !important;
      font-family: inherit !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      text-align: center !important;
      text-decoration: none !important;
      cursor: pointer !important;
      transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease !important;
    }

    .affiliate-buy-btn:hover {
      background: #ff6a00 !important;
      color: #ffffff !important;
      transform: translateY(-1px) !important;
      box-shadow:
        0 5px 14px rgba(255, 106, 0, 0.22) !important;
    }

    .affiliate-buy-btn:active {
      transform: translateY(0) !important;
    }

    .affiliate-buy-btn.aliexpress {
      border-color: #ff4747 !important;
      color: #ff4747 !important;
    }

    .affiliate-buy-btn.aliexpress:hover {
      background: #ff4747 !important;
      color: #ffffff !important;
    }

    .product-price-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .price-usd {
      font-weight: 800;
    }

    .price-pkr {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.85;
    }

    .modal-price-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
    }

    .modal-price-usd {
      font-size: 22px;
      font-weight: 800;
    }

    .modal-price-pkr {
      font-size: 16px;
      opacity: 0.85;
    }

    .cart-price-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    .cart-price-pkr {
      opacity: 0.85;
    }

    .affiliate-source-label {
      display: inline-block;
      margin-top: 5px;
      font-size: 11px;
      opacity: 0.7;
    }
  `;

  document.head.appendChild(
    style
  );
}

/* =====================================
   APEXSHOPY CATEGORY MAPPING
===================================== */

function getApexCategory(
  product
) {
  const category =
    String(
      product?.category || ""
    )
      .trim()
      .toLowerCase();

  const name =
    String(
      product?.name || ""
    )
      .trim()
      .toLowerCase();

  const description =
    String(
      product?.description || ""
    )
      .trim()
      .toLowerCase();

  const text =
    `${category} ${name} ${description}`;

  /* =================================
     1. WEARABLES
  ================================= */

  if (
    category.includes(
      "wearable"
    ) ||
    category.includes(
      "smart watch"
    ) ||
    category.includes(
      "smartwatch"
    ) ||
    category.includes(
      "fitness tracker"
    ) ||
    category.includes(
      "fitness band"
    ) ||
    category.includes(
      "smart band"
    ) ||
    text.includes(
      "smart watch"
    ) ||
    text.includes(
      "smartwatch"
    ) ||
    text.includes(
      "fitness tracker"
    ) ||
    text.includes(
      "fitness band"
    ) ||
    text.includes(
      "smart band"
    ) ||
    text.includes(
      "sports watch"
    ) ||
    text.includes(
      "heart rate monitor"
    ) ||
    text.includes(
      "smart bracelet"
    )
  ) {
    return "Wearables";
  }

  /* =================================
     2. SMART HOME
  ================================= */

  if (
    category.includes(
      "smart home"
    ) ||
    category.includes(
      "home automation"
    ) ||
    category.includes(
      "home appliance"
    ) ||
    category.includes(
      "smart device"
    ) ||
    category.includes(
      "lighting"
    ) ||
    category.includes(
      "security"
    ) ||
    text.includes(
      "smart home"
    ) ||
    text.includes(
      "smart bulb"
    ) ||
    text.includes(
      "smart lamp"
    ) ||
    text.includes(
      "smart plug"
    ) ||
    text.includes(
      "smart switch"
    ) ||
    text.includes(
      "smart socket"
    ) ||
    text.includes(
      "security camera"
    ) ||
    text.includes(
      "ip camera"
    ) ||
    text.includes(
      "doorbell camera"
    ) ||
    text.includes(
      "home security"
    ) ||
    text.includes(
      "robot vacuum"
    ) ||
    text.includes(
      "home automation"
    ) ||
    text.includes(
      "smart thermostat"
    ) ||
    text.includes(
      "smart lock"
    )
  ) {
    return "Smart Home";
  }

  /* =================================
     3. SPORTS & OUTDOORS
  ================================= */

  if (
    category.includes(
      "sports"
    ) ||
    category.includes(
      "sporting"
    ) ||
    category.includes(
      "outdoor"
    ) ||
    category.includes(
      "fitness"
    ) ||
    category.includes(
      "exercise"
    ) ||
    category.includes(
      "camping"
    ) ||
    category.includes(
      "hiking"
    ) ||
    category.includes(
      "cycling"
    ) ||
    category.includes(
      "fishing"
    ) ||
    category.includes(
      "running"
    ) ||
    category.includes(
      "sportswear"
    ) ||
    category.includes(
      "gym"
    ) ||
    category.includes(
      "training"
    ) ||
    text.includes(
      "gym equipment"
    ) ||
    text.includes(
      "workout"
    ) ||
    text.includes(
      "yoga"
    ) ||
    text.includes(
      "football"
    ) ||
    text.includes(
      "soccer"
    ) ||
    text.includes(
      "basketball"
    ) ||
    text.includes(
      "tennis"
    ) ||
    text.includes(
      "volleyball"
    ) ||
    text.includes(
      "badminton"
    ) ||
    text.includes(
      "golf"
    ) ||
    text.includes(
      "running shoes"
    ) ||
    text.includes(
      "sports shoes"
    ) ||
    text.includes(
      "boxing gloves"
    ) ||
    text.includes(
      "boxing"
    ) ||
    text.includes(
      "exercise equipment"
    ) ||
    text.includes(
      "fitness equipment"
    ) ||
    text.includes(
      "resistance band"
    ) ||
    text.includes(
      "dumbbell"
    ) ||
    text.includes(
      "jump rope"
    ) ||
    text.includes(
      "camping gear"
    ) ||
    text.includes(
      "hiking gear"
    )
  ) {
    return "Sports & Outdoors";
  }

  /* =================================
     4. ELECTRONICS
  ================================= */

  if (
    category.includes(
      "consumer electronics"
    ) ||
    category.includes(
      "computer"
    ) ||
    category.includes(
      "computers"
    ) ||
    category.includes(
      "phones"
    ) ||
    category.includes(
      "phone"
    ) ||
    category.includes(
      "mobile"
    ) ||
    category.includes(
      "tablet"
    ) ||
    category.includes(
      "electronic"
    ) ||
    category.includes(
      "camera"
    ) ||
    category.includes(
      "audio"
    ) ||
    category.includes(
      "headphone"
    ) ||
    category.includes(
      "earphone"
    ) ||
    category.includes(
      "speaker"
    ) ||
    category.includes(
      "gaming"
    ) ||
    category.includes(
      "computer accessories"
    ) ||
    category.includes(
      "home electronics"
    ) ||
    category.includes(
      "digital"
    ) ||
    text.includes(
      "bluetooth"
    ) ||
    text.includes(
      "keyboard"
    ) ||
    text.includes(
      "mouse"
    ) ||
    text.includes(
      "usb"
    ) ||
    text.includes(
      "charger"
    ) ||
    text.includes(
      "power bank"
    ) ||
    text.includes(
      "projector"
    ) ||
    text.includes(
      "drone"
    ) ||
    text.includes(
      "headphones"
    ) ||
    text.includes(
      "earbuds"
    ) ||
    text.includes(
      "wireless earbuds"
    ) ||
    text.includes(
      "gaming mouse"
    ) ||
    text.includes(
      "gaming keyboard"
    ) ||
    text.includes(
      "game controller"
    ) ||
    text.includes(
      "computer monitor"
    ) ||
    text.includes(
      "webcam"
    ) ||
    text.includes(
      "microphone"
    ) ||
    text.includes(
      "bluetooth speaker"
    ) ||
    text.includes(
      "phone case"
    ) ||
    text.includes(
      "mobile phone"
    ) ||
    text.includes(
      "smartphone"
    ) ||
    text.includes(
      "power adapter"
    )
  ) {
    return "Electronics";
  }

  /* =================================
     5. APPAREL
  ================================= */

  if (
    category.includes(
      "tops"
    ) ||
    category.includes(
      "tees"
    ) ||
    category.includes(
      "clothing"
    ) ||
    category.includes(
      "apparel"
    ) ||
    category.includes(
      "men's clothing"
    ) ||
    category.includes(
      "women's clothing"
    ) ||
    category.includes(
      "boys' clothing"
    ) ||
    category.includes(
      "girls' clothing"
    ) ||
    category.includes(
      "men clothing"
    ) ||
    category.includes(
      "women clothing"
    ) ||
    category.includes(
      "shoes"
    ) ||
    category.includes(
      "sneakers"
    ) ||
    category.includes(
      "underwear"
    ) ||
    category.includes(
      "sleepwear"
    ) ||
    category.includes(
      "jackets"
    ) ||
    category.includes(
      "pants"
    ) ||
    category.includes(
      "dresses"
    ) ||
    category.includes(
      "shirts"
    ) ||
    category.includes(
      "hoodies"
    ) ||
    category.includes(
      "skirts"
    ) ||
    category.includes(
      "socks"
    ) ||
    category.includes(
      "jeans"
    ) ||
    category.includes(
      "bottoms"
    ) ||
    category.includes(
      "outerwear"
    ) ||
    category.includes(
      "footwear"
    ) ||
    text.includes(
      "t-shirt"
    ) ||
    text.includes(
      "t shirt"
    ) ||
    text.includes(
      "tee shirt"
    ) ||
    text.includes(
      "sweatshirt"
    ) ||
    text.includes(
      "jeans"
    ) ||
    text.includes(
      "hoodie"
    ) ||
    text.includes(
      "joggers"
    ) ||
    text.includes(
      "leggings"
    ) ||
    text.includes(
      "shorts"
    ) ||
    text.includes(
      "trousers"
    ) ||
    text.includes(
      "dress"
    ) ||
    text.includes(
      "skirt"
    ) ||
    text.includes(
      "sneakers"
    ) ||
    text.includes(
      "shoes"
    ) ||
    text.includes(
      "clothing"
    )
  ) {
    return "Apparel";
  }

  /* =================================
     6. ACCESSORIES
  ================================= */

  if (
    category.includes(
      "bags"
    ) ||
    category.includes(
      "bag"
    ) ||
    category.includes(
      "luggage"
    ) ||
    category.includes(
      "wallet"
    ) ||
    category.includes(
      "jewelry"
    ) ||
    category.includes(
      "accessories"
    ) ||
    category.includes(
      "keychain"
    ) ||
    category.includes(
      "belts"
    ) ||
    category.includes(
      "belt"
    ) ||
    category.includes(
      "sunglasses"
    ) ||
    category.includes(
      "watches"
    ) ||
    category.includes(
      "watch"
    ) ||
    category.includes(
      "fashion accessories"
    ) ||
    text.includes(
      "backpack"
    ) ||
    text.includes(
      "handbag"
    ) ||
    text.includes(
      "crossbody"
    ) ||
    text.includes(
      "wallet"
    ) ||
    text.includes(
      "keychain"
    ) ||
    text.includes(
      "belt"
    ) ||
    text.includes(
      "sunglasses"
    ) ||
    text.includes(
      "watch strap"
    ) ||
    text.includes(
      "purse"
    ) ||
    text.includes(
      "tote bag"
    ) ||
    text.includes(
      "travel bag"
    ) ||
    text.includes(
      "luggage"
    ) ||
    text.includes(
      "jewelry"
    ) ||
    text.includes(
      "necklace"
    ) ||
    text.includes(
      "bracelet"
    ) ||
    text.includes(
      "ring"
    )
  ) {
    return "Accessories";
  }

  /* =================================
     7. TOOLS / AUTOMOTIVE
  ================================= */

  if (
    category.includes(
      "tool"
    ) ||
    category.includes(
      "tool parts"
    ) ||
    category.includes(
      "automotive"
    ) ||
    category.includes(
      "car"
    ) ||
    category.includes(
      "motorcycle"
    ) ||
    category.includes(
      "vehicle"
    ) ||
    category.includes(
      "replacement parts"
    ) ||
    category.includes(
      "auto"
    )
  ) {
    return "Accessories";
  }

  /* =================================
     DEFAULT
  ================================= */

  return "Accessories";
}

/* =====================================
   FETCH PRODUCTS FROM API
===================================== */

async function fetchProducts(
  reset = false
) {
  const container =
    document.getElementById(
      "productGrid"
    );

  if (
    isLoadingProducts
  ) {
    return;
  }

  if (
    !hasMoreProducts &&
    !reset
  ) {
    return;
  }

  if (reset) {
    currentPage = 1;
    hasMoreProducts = true;
    products = [];

    if (container) {
      container.innerHTML = `
        <div class="loading-msg">
          <p>Loading products...</p>
        </div>
      `;
    }
  }

  isLoadingProducts = true;

  try {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      currentPage
    );

    params.set(
      "limit",
      productsPerPage
    );

    /* =================================
       SERVER-SIDE CATEGORY FILTER
    ================================= */

    if (
      activeCategory &&
      activeCategory !== "All"
    ) {
      params.set(
        "category",
        activeCategory
      );
    }

    /* =================================
       SERVER-SIDE SEARCH FILTER
    ================================= */

    if (
      searchQuery.trim()
    ) {
      params.set(
        "search",
        searchQuery.trim()
      );
    }

    const response =
      await fetch(
        `${API_BASE_URL}/api/products?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json"
          }
        }
      );

    if (
      !response.ok
    ) {
      throw new Error(
        `HTTP error! Status: ${response.status}`
      );
    }

    const data =
      await response.json();

    if (
      !data.success ||
      !Array.isArray(
        data.products
      )
    ) {
      throw new Error(
        "Invalid products response from server."
      );
    }

    if (reset) {
      products = [
        ...data.products
      ];
    } else {
      products = [
        ...products,
        ...data.products
      ];
    }

    hasMoreProducts =
      Boolean(
        data.hasMore
      );

    currentPage += 1;

    renderProducts();

  } catch (error) {
    console.error(
      "Failed to load products:",
      error
    );

    if (
      container &&
      products.length === 0
    ) {
      container.innerHTML = `
        <div class="error-msg">
          <p>
            Unable to load products right now.
          </p>

          <button
            type="button"
            onclick="fetchProducts(true)"
          >
            Try Again
          </button>
        </div>
      `;
    }

    showToast(
      "Failed to connect to store server.",
      "error",
      4000
    );

  } finally {
    isLoadingProducts =
      false;
  }
}

/* =====================================
   UTILITIES
===================================== */

function getProductId(
  product
) {
  return (
    product?._id ||
    product?.id
  );
}

function escapeHTML(
  value
) {
  if (
    value === null ||
    typeof value ===
      "undefined"
  ) {
    return "";
  }

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

/* =====================================
   PRICE HELPERS
===================================== */

function getPricePKR(
  product
) {
  const pricePKR =
    Number(
      product?.pricePKR
    );

  if (
    Number.isFinite(
      pricePKR
    ) &&
    pricePKR >= 0
  ) {
    return pricePKR;
  }

  const legacyPrice =
    Number(
      product?.price
    );

  if (
    Number.isFinite(
      legacyPrice
    ) &&
    legacyPrice >= 0
  ) {
    return legacyPrice;
  }

  return 0;
}

function extractUSDFromAffiliateUrl(
  affiliateUrl
) {
  if (!affiliateUrl) {
    return null;
  }

  try {
    let decoded =
      String(
        affiliateUrl
      );

    for (
      let i = 0;
      i < 5;
      i++
    ) {
      const previous =
        decoded;

      try {
        decoded =
          decodeURIComponent(
            decoded
          );
      } catch {
        break;
      }

      if (
        decoded ===
        previous
      ) {
        break;
      }
    }

    const usdMatch =
      decoded.match(
        /USD[!:\s]+(\d+(?:[.,]\d{1,2})?)/i
      );

    if (
      usdMatch &&
      usdMatch[1]
    ) {
      const value =
        Number(
          usdMatch[1].replace(
            ",",
            "."
          )
        );

      if (
        Number.isFinite(
          value
        ) &&
        value > 0
      ) {
        return value;
      }
    }

    const patterns = [
      /(?:price|sale_price|salePrice|amount)[=:_-](\d+(?:[.,]\d{1,2})?)/i,
      /USD[^0-9]{0,10}(\d+(?:[.,]\d{1,2})?)/i
    ];

    for (
      const pattern of
        patterns
    ) {
      const match =
        decoded.match(
          pattern
        );

      if (
        match &&
        match[1]
      ) {
        const value =
          Number(
            match[1].replace(
              ",",
              "."
            )
          );

        if (
          Number.isFinite(
            value
          ) &&
          value > 0
        ) {
          return value;
        }
      }
    }

  } catch (error) {
    console.warn(
      "Could not extract USD price:",
      error
    );
  }

  return null;
}

function getPriceUSD(
  product
) {
  const directUSD =
    Number(
      product?.priceUSD
    );

  if (
    Number.isFinite(
      directUSD
    ) &&
    directUSD > 0
  ) {
    return directUSD;
  }

  const urlUSD =
    extractUSDFromAffiliateUrl(
      product?.affiliateUrl
    );

  if (
    urlUSD !== null &&
    urlUSD > 0
  ) {
    return urlUSD;
  }

  return null;
}

function formatUSD(
  amount
) {
  const num =
    Number(amount);

  return Number.isFinite(
    num
  ) &&
  num > 0
    ? `$${num.toFixed(2)}`
    : "";
}

function formatPKR(
  amount
) {
  const num =
    Number(amount);

  if (
    !Number.isFinite(
      num
    )
  ) {
    return "PKR 0.00";
  }

  return `PKR ${num.toLocaleString(
    "en-PK",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )}`;
}

function formatCurrency(
  amount
) {
  return formatPKR(
    amount
  );
}

function getDisplayPrices(
  product
) {
  const pricePKR =
    getPricePKR(
      product
    );

  const priceUSD =
    getPriceUSD(
      product
    );

  return {
    pricePKR,
    priceUSD
  };
}

/* =====================================
   STOCK
===================================== */

function getStockBadge(
  stock
) {
  const count =
    typeof stock !==
    "undefined"
      ? Number(stock)
      : 10;

  if (
    count <= 0
  ) {
    return `
      <span class="stock-badge out-of-stock">
        Out of Stock
      </span>
    `;
  }

  if (
    count <= 5
  ) {
    return `
      <span class="stock-badge low-stock">
        Only ${count} left!
      </span>
    `;
  }

  return `
    <span class="stock-badge in-stock">
      In Stock (${count})
    </span>
  `;
}

/* =====================================
   AFFILIATE HELPERS
===================================== */

function hasAffiliateUrl(
  product
) {
  return Boolean(
    product &&
    product.affiliateUrl &&
    String(
      product.affiliateUrl
    ).trim()
  );
}

function getAffiliateLabel(
  product
) {
  const source =
    String(
      product?.source ||
        ""
    )
      .trim()
      .toLowerCase();

  if (
    source.includes(
      "aliexpress"
    )
  ) {
    return "Buy on AliExpress";
  }

  if (
    source.includes(
      "admitad"
    )
  ) {
    return "Buy Now";
  }

  return "Buy Now";
}

function getAffiliateButton(
  product
) {
  if (
    !hasAffiliateUrl(
      product
    )
  ) {
    return "";
  }

  const affiliateUrl =
    escapeHTML(
      String(
        product.affiliateUrl
      )
    );

  const label =
    escapeHTML(
      getAffiliateLabel(
        product
      )
    );

  const source =
    String(
      product?.source ||
        ""
    ).toLowerCase();

  const className =
    source.includes(
      "aliexpress"
    )
      ? "affiliate-buy-btn aliexpress"
      : "affiliate-buy-btn";

  const productForTracking =
    JSON.stringify(
      {
        _id:
          getProductId(
            product
          ),
        id:
          product.id,
        name:
          product.name,
        category:
          product.category,
        source:
          product.source
      }
    )
      .replace(
        /\\/g,
        "\\\\"
      )
      .replace(
        /'/g,
        "\\'"
      );

  return `
    <a
      href="${affiliateUrl}"
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      class="${className}"
      onclick="
        event.stopPropagation();
        trackAffiliateClick(${productForTracking});
      "
    >
      ${label}
    </a>
  `;
}

/* =====================================
   RELATED PRODUCTS
===================================== */

function getRelatedProducts(
  currentProduct,
  limit = 3
) {
  const currentId =
    getProductId(
      currentProduct
    );

  const currentApexCategory =
    getApexCategory(
      currentProduct
    );

  return products
    .filter(
      (product) =>
        getApexCategory(
          product
        ) ===
          currentApexCategory &&
        String(
          getProductId(
            product
          )
        ) !==
          String(
            currentId
          )
    )
    .slice(
      0,
      limit
    );
}

/* =====================================
   CART STORAGE
===================================== */

function loadCartFromStorage() {
  try {
    const savedCart =
      localStorage.getItem(
        "apex_cart"
      );

    if (!savedCart) {
      return [];
    }

    const parsed =
      JSON.parse(
        savedCart
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];

  } catch (error) {
    console.error(
      "Error loading cart:",
      error
    );

    return [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(
      "apex_cart",
      JSON.stringify(
        cart
      )
    );

  } catch (error) {
    console.error(
      "Error saving cart:",
      error
    );
  }
}

/* =====================================
   TOAST
===================================== */

function showToast(
  message,
  type = "info",
  duration = 3000
) {
  let container =
    document.getElementById(
      "toast-container"
    );

  if (!container) {
    container =
      document.createElement(
        "div"
      );

    container.id =
      "toast-container";

    document.body.appendChild(
      container
    );
  }

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    `toast ${type}`;

  toast.style.setProperty(
    "--delay",
    `${duration / 1000}s`
  );

  toast.textContent =
    message;

  container.appendChild(
    toast
  );

  setTimeout(
    () => {
      toast.remove();
    },
    duration + 300
  );
}

/* =====================================
   THEME MANAGEMENT
===================================== */

function initTheme() {
  const savedTheme =
    localStorage.getItem(
      "apex_theme"
    );

  const systemPrefersDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  const theme =
    savedTheme ||
    (
      systemPrefersDark
        ? "dark"
        : "light"
    );

  document.documentElement.setAttribute(
    "data-theme",
    theme
  );

  updateThemeButton(
    theme
  );
}

function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute(
      "data-theme"
    );

  const newTheme =
    currentTheme ===
    "dark"
      ? "light"
      : "dark";

  document.documentElement.setAttribute(
    "data-theme",
    newTheme
  );

  localStorage.setItem(
    "apex_theme",
    newTheme
  );

  updateThemeButton(
    newTheme
  );
}

function updateThemeButton(
  theme
) {
  const button =
    document.getElementById(
      "themeToggleBtn"
    );

  if (!button) {
    return;
  }

  button.textContent =
    theme === "dark"
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";
}

/* =====================================
   CART SIDEBAR
===================================== */

function toggleCart() {
  const sidebar =
    document.getElementById(
      "cartSidebar"
    );

  const overlay =
    document.getElementById(
      "cartOverlay"
    );

  if (sidebar) {
    sidebar.classList.toggle(
      "open"
    );
  }

  if (overlay) {
    overlay.classList.toggle(
      "open"
    );
  }
}

/* =====================================
   SEARCH
===================================== */

function filterProducts() {
  const input =
    document.getElementById(
      "searchInput"
    );

  if (!input) {
    return;
  }

  searchQuery =
    input.value.trim();

  clearTimeout(
    searchTimer
  );

  searchTimer =
    setTimeout(
      () => {
        if (
          searchQuery
        ) {
          trackSearch(
            searchQuery
          );
        }

        fetchProducts(
          true
        );
      },
      350
    );
}

/* =====================================
   CATEGORY FILTER
===================================== */

function filterCategory(
  category,
  event
) {
  activeCategory =
    category;

  const buttons =
    document.querySelectorAll(
      ".categories button"
    );

  buttons.forEach(
    (button) => {
      button.classList.remove(
        "active"
      );
    }
  );

  if (
    event &&
    event.currentTarget
  ) {
    event.currentTarget.classList.add(
      "active"
    );
  }

  trackCategorySelection(
    category
  );

  fetchProducts(
    true
  );
}

/* =====================================
   RENDER PRODUCTS
===================================== */

function renderProducts() {
  const container =
    document.getElementById(
      "productGrid"
    );

  if (!container) {
    return;
  }

  /*
    Category filtering is performed
    by the backend.

    Local filtering remains as a
    compatibility safety layer.
  */

  const filteredProducts =
    products.filter(
      (product) =>
        activeCategory ===
          "All" ||
        getApexCategory(
          product
        ) ===
          activeCategory
    );

  if (
    filteredProducts.length ===
    0
  ) {
    container.innerHTML = `
      <div class="no-results">
        <p>
          ${
            searchQuery
              ? `No products found for "${escapeHTML(
                  searchQuery
                )}".`
              : "No products found."
          }
        </p>
      </div>
    `;

    renderLoadMoreButton();

    return;
  }

  container.innerHTML =
    filteredProducts
      .map(
        (product) => {
          const productId =
            getProductId(
              product
            );

          const safeId =
            escapeHTML(
              String(
                productId
              )
            );

          const safeName =
            escapeHTML(
              product.name ||
                "Product"
            );

          const safeImage =
            escapeHTML(
              product.image ||
                ""
            );

          const ratingDisplay =
            escapeHTML(
              product.rating ||
                "⭐ 5.0"
            );

          const prices =
            getDisplayPrices(
              product
            );

          const pricePKR =
            prices.pricePKR;

          const priceUSD =
            prices.priceUSD;

          const originalPricePKR =
            Number(
              product.originalPricePKR
            );

          const originalPriceUSD =
            Number(
              product.originalPriceUSD
            );

          const legacyOriginalPrice =
            Number(
              product.originalPrice
            );

          const hasOriginalPKR =
            Number.isFinite(
              originalPricePKR
            ) &&
            originalPricePKR >
              pricePKR;

          const hasOriginalUSD =
            Number.isFinite(
              originalPriceUSD
            ) &&
            priceUSD !== null &&
            originalPriceUSD >
              priceUSD;

          const hasLegacyOriginal =
            Number.isFinite(
              legacyOriginalPrice
            ) &&
            legacyOriginalPrice >
              pricePKR;

          const stockCount =
            typeof product.stock !==
            "undefined"
              ? Number(
                  product.stock
                )
              : 10;

          const isOutOfStock =
            stockCount <=
            0;

          const affiliateButton =
            getAffiliateButton(
              product
            );

          let priceHTML = `
            <div class="product-price-row">
          `;

          if (
            priceUSD !==
            null
          ) {
            priceHTML += `
              <span class="sale-price price-usd">
                ${formatUSD(
                  priceUSD
                )}
              </span>
            `;
          }

          priceHTML += `
              <span class="price-pkr">
                ${formatPKR(
                  pricePKR
                )}
              </span>
            </div>
          `;

          if (
            hasOriginalUSD ||
            hasOriginalPKR ||
            hasLegacyOriginal
          ) {
            priceHTML += `
              <div class="product-price-row">
            `;

            if (
              hasOriginalUSD
            ) {
              priceHTML += `
                <span class="original-price">
                  ${formatUSD(
                    originalPriceUSD
                  )}
                </span>
              `;
            }

            if (
              hasOriginalPKR
            ) {
              priceHTML += `
                <span class="original-price">
                  ${formatPKR(
                    originalPricePKR
                  )}
                </span>
              `;
            }

            if (
              !hasOriginalUSD &&
              !hasOriginalPKR &&
              hasLegacyOriginal
            ) {
              priceHTML += `
                <span class="original-price">
                  ${formatPKR(
                    legacyOriginalPrice
                  )}
                </span>
              `;
            }

            priceHTML += `
              </div>
            `;
          }

          return `
            <div
              class="card"
              data-id="${safeId}"
              onclick="openProductModal('${safeId}')"
            >

              <img
                src="${safeImage}"
                alt="${safeName}"
                loading="lazy"
              >

              <div class="card-info">

                <h3 class="card-title">
                  ${safeName}
                </h3>

                <div class="stock-container">
                  ${getStockBadge(
                    stockCount
                  )}
                </div>

                <div class="rating">
                  ${ratingDisplay}
                </div>

                ${priceHTML}

                ${affiliateButton}

                <button
                  type="button"
                  class="add-btn ${
                    isOutOfStock
                      ? "disabled-btn"
                      : ""
                  }"
                  ${
                    isOutOfStock
                      ? "disabled"
                      : ""
                  }
                  onclick="
                    event.stopPropagation();
                    addToCart('${safeId}')
                  "
                >
                  ${
                    isOutOfStock
                      ? "Out of Stock"
                      : "Add to Cart"
                  }
                </button>

              </div>
            </div>
          `;
        }
      )
      .join("");

  renderLoadMoreButton();
}

/* =====================================
   LOAD MORE
===================================== */

function renderLoadMoreButton() {
  const existingButton =
    document.getElementById(
      "loadMoreProductsBtn"
    );

  if (existingButton) {
    existingButton.remove();
  }

  if (
    !hasMoreProducts
  ) {
    return;
  }

  const button =
    document.createElement(
      "button"
    );

  button.id =
    "loadMoreProductsBtn";

  button.className =
    "load-more-btn";

  button.type =
    "button";

  button.textContent =
    "Load More Products";

  button.onclick =
    loadMoreProducts;

  const container =
    document.getElementById(
      "productGrid"
    );

  if (
    container &&
    container.parentNode
  ) {
    container.parentNode.appendChild(
      button
    );
  }
}

async function loadMoreProducts() {
  const button =
    document.getElementById(
      "loadMoreProductsBtn"
    );

  if (
    isLoadingProducts ||
    !hasMoreProducts
  ) {
    return;
  }

  if (button) {
    button.disabled =
      true;

    button.textContent =
      "Loading...";
  }

  await fetchProducts(
    false
  );

  const updatedButton =
    document.getElementById(
      "loadMoreProductsBtn"
    );

  if (
    !updatedButton
  ) {
    return;
  }

  if (
    hasMoreProducts
  ) {
    updatedButton.disabled =
      false;

    updatedButton.textContent =
      "Load More Products";
  } else {
    updatedButton.remove();
  }
}

/* =====================================
   PRODUCT MODAL
===================================== */

function openProductModal(
  productId
) {
  const product =
    products.find(
      (item) =>
        String(
          getProductId(
            item
          )
        ) ===
        String(
          productId
        )
    );

  if (!product) {
    return;
  }

  /* GA4 product view */
  trackProductView(
    product
  );

  const existingModal =
    document.getElementById(
      "productDetailModal"
    );

  if (existingModal) {
    existingModal.remove();
  }

  const actualProductId =
    getProductId(
      product
    );

  const safeId =
    escapeHTML(
      String(
        actualProductId
      )
    );

  const safeName =
    escapeHTML(
      product.name ||
        "Product"
    );

  const safeImage =
    escapeHTML(
      product.image ||
        ""
    );

  const safeDesc =
    escapeHTML(
      product.description ||
        "High quality product designed for durability and performance."
    );

  const ratingDisplay =
    escapeHTML(
      product.rating ||
        "⭐ 5.0"
    );

  const prices =
    getDisplayPrices(
      product
    );

  const pricePKR =
    prices.pricePKR;

  const priceUSD =
    prices.priceUSD;

  const originalPricePKR =
    Number(
      product.originalPricePKR
    );

  const originalPriceUSD =
    Number(
      product.originalPriceUSD
    );

  const legacyOriginalPrice =
    Number(
      product.originalPrice
    );

  const stockCount =
    typeof product.stock !==
    "undefined"
      ? Number(
          product.stock
        )
      : 10;

  const isOutOfStock =
    stockCount <=
    0;

  const relatedItems =
    getRelatedProducts(
      product,
      3
    );

  const relatedHTML =
    relatedItems.length >
    0
      ? `
        <div class="related-products-section">

          <h3>
            You May Also Like
          </h3>

          <div class="related-grid">

            ${relatedItems
              .map(
                (item) => {
                  const itemId =
                    getProductId(
                      item
                    );

                  const safeItemId =
                    escapeHTML(
                      String(
                        itemId
                      )
                    );

                  const itemPrices =
                    getDisplayPrices(
                      item
                    );

                  return `
                    <div
                      class="related-card"
                      onclick="openProductModal('${safeItemId}')"
                    >

                      <img
                        src="${escapeHTML(
                          item.image ||
                            ""
                        )}"
                        alt="${escapeHTML(
                          item.name ||
                            ""
                        )}"
                        loading="lazy"
                      >

                      <div class="related-card-title">
                        ${escapeHTML(
                          item.name ||
                            ""
                        )}
                      </div>

                      <div class="related-card-price">

                        ${
                          itemPrices.priceUSD !==
                          null
                            ? formatUSD(
                                itemPrices.priceUSD
                              )
                            : ""
                        }

                        ${formatPKR(
                          itemPrices.pricePKR
                        )}

                      </div>

                    </div>
                  `;
                }
              )
              .join("")}

          </div>

        </div>
      `
      : "";

  const affiliateButton =
    getAffiliateButton(
      product
    );

  let priceHTML = `
    <div class="modal-price-row">
  `;

  if (
    priceUSD !==
    null
  ) {
    priceHTML += `
      <span class="sale-price modal-price-usd">
        ${formatUSD(
          priceUSD
        )}
      </span>
    `;
  }

  priceHTML += `
      <span class="modal-price-pkr">
        ${formatPKR(
          pricePKR
        )}
      </span>
    </div>
  `;

  if (
    (
      Number.isFinite(
        originalPriceUSD
      ) &&
      originalPriceUSD > 0 &&
      priceUSD !==
        null &&
      originalPriceUSD >
        priceUSD
    ) ||
    (
      Number.isFinite(
        originalPricePKR
      ) &&
      originalPricePKR >
        pricePKR
    ) ||
    (
      Number.isFinite(
        legacyOriginalPrice
      ) &&
      legacyOriginalPrice >
        pricePKR
    )
  ) {
    priceHTML += `
      <div class="modal-price-row">
    `;

    if (
      Number.isFinite(
        originalPriceUSD
      ) &&
      originalPriceUSD > 0 &&
      priceUSD !==
        null &&
      originalPriceUSD >
        priceUSD
    ) {
      priceHTML += `
        <span class="original-price">
          ${formatUSD(
            originalPriceUSD
          )}
        </span>
      `;
    }

    if (
      Number.isFinite(
        originalPricePKR
      ) &&
      originalPricePKR >
        pricePKR
    ) {
      priceHTML += `
        <span class="original-price">
          ${formatPKR(
            originalPricePKR
          )}
        </span>
      `;
    }

    if (
      !Number.isFinite(
        originalPricePKR
      ) &&
      !Number.isFinite(
        originalPriceUSD
      ) &&
      Number.isFinite(
        legacyOriginalPrice
      ) &&
      legacyOriginalPrice >
        pricePKR
    ) {
      priceHTML += `
        <span class="original-price">
          ${formatPKR(
            legacyOriginalPrice
          )}
        </span>
      `;
    }

    priceHTML += `
      </div>
    `;
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "productDetailModal";

  modal.className =
    "modal-overlay";

  modal.onclick =
    (event) => {
      if (
        event.target ===
        modal
      ) {
        closeProductModal();
      }
    };

  modal.innerHTML = `
    <div class="modal-content product-modal-content">

      <button
        type="button"
        class="close-modal-x"
        onclick="closeProductModal()"
      >
        &times;
      </button>

      <div class="product-modal-body">

        <img
          src="${safeImage}"
          alt="${safeName}"
          class="product-modal-img"
        >

        <div class="product-modal-details">

          <h2>
            ${safeName}
          </h2>

          <div class="stock-container">
            ${getStockBadge(
              stockCount
            )}
          </div>

          <div class="rating">
            ${ratingDisplay}
          </div>

          <p class="product-description">
            ${safeDesc}
          </p>

          ${priceHTML}

          ${affiliateButton}

          <button
            type="button"
            class="add-btn ${
              isOutOfStock
                ? "disabled-btn"
                : ""
            }"
            ${
              isOutOfStock
                ? "disabled"
                : ""
            }
            onclick="
              addToCart('${safeId}');
              closeProductModal();
            "
          >
            ${
              isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"
            }
          </button>

        </div>
      </div>

      ${relatedHTML}

    </div>
  `;

  document.body.appendChild(
    modal
  );
}

function closeProductModal() {
  const modal =
    document.getElementById(
      "productDetailModal"
    );

  if (modal) {
    modal.remove();
  }
}

/* =====================================
   CART UI
===================================== */

function updateCartUI() {
  saveCartToStorage();

  const cartCountEl =
    document.getElementById(
      "cartCount"
    );

  const cartItemsEl =
    document.getElementById(
      "cartItems"
    );

  const cartTotalAmountEl =
    document.getElementById(
      "cartTotalAmount"
    );

  const totalItems =
    cart.reduce(
      (sum, item) =>
        sum +
        (
          Number(
            item.quantity
          ) || 0
        ),
      0
    );

  const totalPricePKR =
    cart.reduce(
      (sum, item) =>
        sum +
        getPricePKR(
          item
        ) *
          (
            Number(
              item.quantity
            ) || 0
          ),
      0
    );

  const totalPriceUSD =
    cart.reduce(
      (sum, item) => {
        const usd =
          getPriceUSD(
            item
          );

        if (
          usd ===
          null
        ) {
          return sum;
        }

        return (
          sum +
          usd *
            (
              Number(
                item.quantity
              ) || 0
            )
        );
      },
      0
    );

  if (
    cartCountEl
  ) {
    cartCountEl.textContent =
      totalItems;
  }

  if (
    cartTotalAmountEl
  ) {
    if (
      totalPriceUSD >
      0
    ) {
      cartTotalAmountEl.innerHTML = `
        ${formatUSD(
          totalPriceUSD
        )}

        <span class="price-pkr">
          ${formatPKR(
            totalPricePKR
          )}
        </span>
      `;
    } else {
      cartTotalAmountEl.textContent =
        formatPKR(
          totalPricePKR
        );
    }
  }

  if (
    !cartItemsEl
  ) {
    return;
  }

  if (
    cart.length ===
    0
  ) {
    cartItemsEl.innerHTML = `
      <p class="empty-cart-msg">
        Your cart is currently empty.
      </p>
    `;

    return;
  }

  cartItemsEl.innerHTML =
    cart
      .map(
        (item) => {
          const itemId =
            getProductId(
              item
            );

          const safeId =
            escapeHTML(
              String(
                itemId
              )
            );

          const safeName =
            escapeHTML(
              item.name ||
                "Product"
            );

          const safeImage =
            escapeHTML(
              item.image ||
                ""
            );

          const quantity =
            Number(
              item.quantity
            ) || 0;

          const pricePKR =
            getPricePKR(
              item
            );

          const priceUSD =
            getPriceUSD(
              item
            );

          const itemTotalPKR =
            pricePKR *
            quantity;

          const itemTotalUSD =
            priceUSD !==
            null
              ? priceUSD *
                quantity
              : null;

          return `
            <div
              class="cart-item"
              data-id="${safeId}"
            >

              <img
                src="${safeImage}"
                alt="${safeName}"
                class="cart-item-img"
                loading="lazy"
              >

              <div class="cart-item-details">

                <h4 class="cart-item-title">
                  ${safeName}
                </h4>

                <p class="cart-item-price">

                  <span class="cart-price-row">

                    ${
                      itemTotalUSD !==
                        null &&
                      itemTotalUSD > 0
                        ? `
                          <span>
                            ${formatUSD(
                              itemTotalUSD
                            )}
                          </span>
                        `
                        : ""
                    }

                    <span class="cart-price-pkr">
                      ${formatPKR(
                        itemTotalPKR
                      )}
                    </span>

                  </span>

                </p>

              </div>

              <div class="cart-controls">

                <button
                  type="button"
                  onclick="updateQuantity('${safeId}', -1)"
                >
                  -
                </button>

                <span>
                  ${quantity}
                </span>

                <button
                  type="button"
                  onclick="updateQuantity('${safeId}', 1)"
                >
                  +
                </button>

                <button
                  type="button"
                  class="remove-btn"
                  onclick="removeFromCart('${safeId}')"
                >
                  &times;
                </button>

              </div>

            </div>
          `;
        }
      )
      .join("");
}

/* =====================================
   ADD TO CART
===================================== */

function addToCart(
  productId
) {
  const product =
    products.find(
      (item) =>
        String(
          getProductId(
            item
          )
        ) ===
        String(
          productId
        )
    );

  if (!product) {
    return;
  }

  const actualProductId =
    getProductId(
      product
    );

  const maxStock =
    typeof product.stock !==
    "undefined"
      ? Number(
          product.stock
        )
      : 10;

  if (
    maxStock <=
    0
  ) {
    showToast(
      "Sorry, this product is currently out of stock!",
      "error",
      3000
    );

    return;
  }

  const existingItem =
    cart.find(
      (item) =>
        String(
          getProductId(
            item
          )
        ) ===
        String(
          actualProductId
        )
    );

  if (
    existingItem
  ) {
    if (
      existingItem.quantity +
        1 >
      maxStock
    ) {
      showToast(
        `Only ${maxStock} items available in stock.`,
        "error",
        3000
      );

      return;
    }

    existingItem.quantity +=
      1;

  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  /* GA4 add_to_cart */
  trackAddToCart(
    product,
    1
  );

  updateCartUI();

  showToast(
    `${
      product.name ||
      "Item"
    } added to cart!`,
    "success",
    2500
  );
}

/* =====================================
   UPDATE QUANTITY
===================================== */

function updateQuantity(
  productId,
  delta
) {
  const item =
    cart.find(
      (cartItem) =>
        String(
          getProductId(
            cartItem
          )
        ) ===
        String(
          productId
        )
    );

  if (!item) {
    return;
  }

  const product =
    products.find(
      (productItem) =>
        String(
          getProductId(
            productItem
          )
        ) ===
        String(
          productId
        )
    );

  const maxStock =
    product &&
    typeof product.stock !==
      "undefined"
      ? Number(
          product.stock
        )
      : 10;

  if (
    delta > 0 &&
    item.quantity +
      delta >
      maxStock
  ) {
    showToast(
      `Only ${maxStock} items available in stock.`,
      "error",
      3000
    );

    return;
  }

  item.quantity +=
    delta;

  if (
    item.quantity <=
    0
  ) {
    removeFromCart(
      productId
    );
  } else {
    updateCartUI();
  }
}

/* =====================================
   REMOVE FROM CART
===================================== */

function removeFromCart(
  productId
) {
  cart =
    cart.filter(
      (item) =>
        String(
          getProductId(
            item
          )
        ) !==
        String(
          productId
        )
    );

  updateCartUI();
}

/* =====================================
   CLEAR CART
===================================== */

function clearCart() {
  cart = [];

  updateCartUI();
}

/* =====================================
   ORDER SUMMARY
===================================== */

function buildOrderSummaryText() {
  const dateStr =
    new Date()
      .toLocaleDateString();

  let text =
    `🛒 *ApexShopy Order Details* (${dateStr})\n`;

  text +=
    `-----------------------------------\n`;

  let totalPKR =
    0;

  let totalUSD =
    0;

  let hasUSD =
    false;

  cart.forEach(
    (
      item,
      index
    ) => {
      const quantity =
        Number(
          item.quantity
        ) || 0;

      const pricePKR =
        getPricePKR(
          item
        );

      const priceUSD =
        getPriceUSD(
          item
        );

      const subtotalPKR =
        pricePKR *
        quantity;

      totalPKR +=
        subtotalPKR;

      let usdText =
        "";

      if (
        priceUSD !==
          null &&
        priceUSD > 0
      ) {
        const subtotalUSD =
          priceUSD *
          quantity;

        totalUSD +=
          subtotalUSD;

        hasUSD =
          true;

        usdText =
          ` / ${formatUSD(
            subtotalUSD
          )}`;
      }

      text +=
        `${index + 1}. ${
          item.name
        } x${quantity} - ${formatPKR(
          subtotalPKR
        )}${usdText}\n`;
    }
  );

  text +=
    `-----------------------------------\n`;

  if (
    hasUSD
  ) {
    text +=
      `*Total USD:* ${formatUSD(
        totalUSD
      )}\n`;
  }

  text +=
    `*Total PKR:* ${formatPKR(
      totalPKR
    )}\n`;

  text +=
    `Please process my order!`;

  return text;
}

/* =====================================
   CHECKOUT
===================================== */

async function checkoutMultiPlatform() {
  if (
    cart.length ===
    0
  ) {
    showToast(
      "Your cart is empty. Add items first!",
      "error",
      3000
    );

    return;
  }

  /* GA4 begin_checkout */
  trackCheckoutStart();

  const orderSummary =
    buildOrderSummaryText();

  let copySuccess =
    false;

  try {
    if (
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      await navigator.clipboard.writeText(
        orderSummary
      );

      copySuccess =
        true;

      showToast(
        "Order summary copied to clipboard!",
        "info",
        3000
      );
    }

  } catch (error) {
    console.warn(
      "Clipboard permission failed:",
      error
    );

    copySuccess =
      false;
  }

  showCheckoutModal(
    orderSummary,
    copySuccess
  );
}

/* =====================================
   CHECKOUT MODAL
===================================== */

function showCheckoutModal(
  orderSummary,
  isCopied
) {
  const existingModal =
    document.getElementById(
      "checkoutModal"
    );

  if (
    existingModal
  ) {
    existingModal.remove();
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "checkoutModal";

  modal.className =
    "modal-overlay";

  modal.onclick =
    (event) => {
      if (
        event.target ===
        modal
      ) {
        closeCheckoutModal();
      }
    };

  modal.innerHTML = `
    <div class="modal-content">

      <h2>
        ${
          isCopied
            ? "✅ Order Copied to Clipboard!"
            : "📋 Order Summary Ready"
        }
      </h2>

      <p>
        ${
          isCopied
            ? "Your order summary has been automatically copied. Send it directly via DM on your preferred platform:"
            : "Please copy the text box below manually and paste it into our message box:"
        }
      </p>

      <textarea
        readonly
        class="order-summary-box"
      ></textarea>

      <div class="social-links">

        <a
          href="${SOCIAL_LINKS.facebook}"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn fb"
        >
          Facebook Messenger
        </a>

        <a
          href="${SOCIAL_LINKS.instagram}"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn ig"
        >
          Instagram DM
        </a>

        <a
          href="${SOCIAL_LINKS.reddit}"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn rd"
        >
          Reddit Chat
        </a>

      </div>

      <button
        type="button"
        class="close-modal-btn"
        onclick="closeCheckoutModal()"
      >
        Close & Clear Cart
      </button>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  const textarea =
    modal.querySelector(
      ".order-summary-box"
    );

  if (textarea) {
    textarea.value =
      orderSummary;
  }
}

function closeCheckoutModal() {
  const modal =
    document.getElementById(
      "checkoutModal"
    );

  if (modal) {
    modal.remove();
  }

  clearCart();
}

/* =====================================
   ESC KEY
===================================== */

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key ===
      "Escape"
    ) {
      closeProductModal();

      const checkoutModal =
        document.getElementById(
          "checkoutModal"
        );

      if (
        checkoutModal
      ) {
        closeCheckoutModal();
      }
    }
  }
);

/* =====================================
   INITIALIZATION
===================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* =================================
       GOOGLE ANALYTICS 4 STARTS HERE
    ================================= */

    initGoogleAnalytics();

    /* =================================
       STORE INITIALIZATION
    ================================= */

    injectAffiliateStyles();

    initTheme();

    updateCartUI();
    
    initGoogleAnalytics();

    fetchProducts(
      true
    );
  }
);