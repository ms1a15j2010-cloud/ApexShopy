/* =====================================
   1. STORE CONFIGURATION & STATE
===================================== */

const API_BASE_URL =
  "https://backend-kappa-orcin-35.vercel.app";

const SOCIAL_LINKS = {
  facebook:
    "https://www.facebook.com/share/p/19WQNXqUhe/",
  instagram:
    "https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=10s3kk6s",
  reddit:
    "https://www.reddit.com/user/apexshopy",
};

let products = [];
let cart = loadCartFromStorage();

let activeCategory = "All";
let searchQuery = "";

// Pagination
let currentPage = 1;
const productsPerPage = 40;
let hasMoreProducts = true;
let isLoadingProducts = false;

// Search debounce
let searchTimer = null;


/* =====================================
   2. FETCH PRODUCTS FROM API
===================================== */

async function fetchProducts(reset = false) {
  const container =
    document.getElementById("productGrid");

  if (isLoadingProducts) {
    return;
  }

  if (!hasMoreProducts && !reset) {
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
    const params = new URLSearchParams();

    params.set("page", currentPage);
    params.set("limit", productsPerPage);

    if (searchQuery.trim()) {
      params.set(
        "search",
        searchQuery.trim()
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/products?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status}`
      );
    }

    const data =
      await response.json();

    if (
      !data.success ||
      !Array.isArray(data.products)
    ) {
      throw new Error(
        "Invalid products response from server."
      );
    }

    if (reset) {
      products = [
        ...data.products,
      ];
    } else {
      products = [
        ...products,
        ...data.products,
      ];
    }

    hasMoreProducts =
      Boolean(data.hasMore);

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
    isLoadingProducts = false;
  }
}


/* =====================================
   3. UTILITIES
===================================== */

function getProductId(product) {
  return (
    product?._id ||
    product?.id ||
    product?.externalId
  );
}


function escapeHTML(value) {
  if (
    value === null ||
    typeof value === "undefined"
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
   4. PRICE HELPERS
===================================== */

/*
  PKR price.

  Backend now sends:
    pricePKR
    price

  pricePKR is preferred.
*/

function getPKRPrice(product) {
  const pricePKR =
    Number(product?.pricePKR);

  if (
    Number.isFinite(pricePKR) &&
    pricePKR >= 0
  ) {
    return pricePKR;
  }

  const legacyPrice =
    Number(product?.price);

  if (
    Number.isFinite(legacyPrice) &&
    legacyPrice >= 0
  ) {
    return legacyPrice;
  }

  return 0;
}


/*
  Decode an affiliate URL several times.

  Admitad/AliExpress URLs can contain
  nested encoded AliExpress URLs.
*/

function decodeAffiliateURL(url) {
  if (!url) {
    return "";
  }

  let decoded =
    String(url);

  for (
    let i = 0;
    i < 5;
    i++
  ) {
    try {
      const next =
        decodeURIComponent(
          decoded
        );

      if (
        next === decoded
      ) {
        break;
      }

      decoded = next;

    } catch (error) {
      break;
    }
  }

  return decoded;
}


/*
  Extract the original USD price
  from the existing AliExpress URL.

  Example encoded data may contain:

    USD!19.88!19.88

  or:

    USD%2119.88%2119.88
*/

function getUSDPriceFromAffiliateURL(
  affiliateUrl
) {
  if (!affiliateUrl) {
    return null;
  }

  const decoded =
    decodeAffiliateURL(
      affiliateUrl
    );

  /*
    AliExpress affiliate feeds commonly
    contain the currency followed by price.
  */

  const patterns = [
    /USD[!|;,\s]+(\d+(?:\.\d{1,2})?)/i,
    /USD(\d+(?:\.\d{1,2})?)/i,
    /(?:price|sale_price|amount)[=:"']+USD[!|;,\s]+(\d+(?:\.\d{1,2})?)/i,
    /(?:USD|US\$|\$)\s*(\d+(?:\.\d{1,2})?)/i,
  ];

  for (
    const pattern of patterns
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
        Number(match[1]);

      if (
        Number.isFinite(value) &&
        value > 0
      ) {
        return value;
      }
    }
  }

  /*
    Fallback specifically for
    AliExpress URL parameter patterns.
  */

  const usdIndex =
    decoded
      .toUpperCase()
      .indexOf("USD");

  if (
    usdIndex !== -1
  ) {
    const afterUSD =
      decoded.substring(
        usdIndex + 3
      );

    const fallback =
      afterUSD.match(
        /[!|;,\s]+(\d+(?:\.\d{1,2})?)/
      );

    if (
      fallback &&
      fallback[1]
    ) {
      const value =
        Number(
          fallback[1]
        );

      if (
        Number.isFinite(value) &&
        value > 0
      ) {
        return value;
      }
    }
  }

  return null;
}


/*
  USD price priority:

  1. priceUSD from database
  2. USD price inside affiliateUrl
  3. null

  IMPORTANT:
  We do NOT convert PKR back into USD.
  This keeps the original AliExpress price intact.
*/

function getUSDPrice(product) {
  const databaseUSD =
    Number(
      product?.priceUSD
    );

  if (
    Number.isFinite(databaseUSD) &&
    databaseUSD > 0
  ) {
    return databaseUSD;
  }

  return getUSDPriceFromAffiliateURL(
    product?.affiliateUrl
  );
}


function formatUSD(amount) {
  const num =
    Number(amount);

  return Number.isFinite(num)
    ? `$${num.toFixed(2)}`
    : "$0.00";
}


function formatPKR(amount) {
  const num =
    Number(amount);

  return Number.isFinite(num)
    ? `PKR ${num.toLocaleString(
        "en-PK",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`
    : "PKR 0.00";
}


/*
  Kept for compatibility with existing
  cart/order code.
*/

function formatCurrency(amount) {
  return formatPKR(
    amount
  );
}


/* =====================================
   5. STOCK
===================================== */

function getStockBadge(stock) {
  const count =
    typeof stock !== "undefined"
      ? Number(stock)
      : 10;

  if (count <= 0) {
    return `
      <span class="stock-badge out-of-stock">
        Out of Stock
      </span>
    `;
  }

  if (count <= 5) {
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
   6. RELATED PRODUCTS
===================================== */

function getRelatedProducts(
  currentProduct,
  limit = 3
) {
  const currentId =
    getProductId(
      currentProduct
    );

  return products
    .filter(
      (product) => {
        return (
          product.category ===
            currentProduct.category &&
          String(
            getProductId(
              product
            )
          ) !==
            String(currentId)
        );
      }
    )
    .slice(
      0,
      limit
    );
}


/* =====================================
   7. CART STORAGE
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

    return Array.isArray(parsed)
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
   8. TOAST
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
   9. THEME MANAGEMENT
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
    currentTheme === "dark"
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
   10. CART SIDEBAR
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
   11. SEARCH
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
        fetchProducts(
          true
        );
      },
      350
    );
}


/* =====================================
   12. CATEGORY FILTER
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

  fetchProducts(
    true
  );
}


/* =====================================
   13. AFFILIATE BUYING FLOW
===================================== */


/*
  Opens the Admitad/AliExpress
  affiliate URL.

  The affiliate URL is the URL supplied
  by the Admitad feed, so the affiliate
  tracking remains intact.
*/

function buyFromAffiliate(
  productId
) {
  const product =
    products.find(
      (item) =>
        String(
          getProductId(item)
        ) ===
        String(productId)
    );

  if (!product) {
    showToast(
      "Product not found.",
      "error",
      3000
    );

    return;
  }

  const affiliateUrl =
    product.affiliateUrl;

  if (
    !affiliateUrl ||
    typeof affiliateUrl !==
      "string"
  ) {
    showToast(
      "Buying link is not available for this product.",
      "error",
      4000
    );

    return;
  }

  /*
    Open affiliate destination
    in a new tab.
  */

  window.open(
    affiliateUrl,
    "_blank",
    "noopener,noreferrer"
  );
}


/*
  Compatibility aliases.

  These make the function usable if
  another part of the HTML calls one
  of these names.
*/

function buyProduct(
  productId
) {
  buyFromAffiliate(
    productId
  );
}


function openAffiliateLink(
  productId
) {
  buyFromAffiliate(
    productId
  );
}


/* =====================================
   14. RENDER PRODUCTS
===================================== */

function renderProducts() {
  const container =
    document.getElementById(
      "productGrid"
    );

  if (!container) {
    return;
  }

  const filteredProducts =
    products.filter(
      (product) => {
        return (
          activeCategory ===
            "All" ||
          product.category ===
            activeCategory
        );
      }
    );

  if (
    filteredProducts.length === 0
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

          const pkrPrice =
            getPKRPrice(
              product
            );

          const usdPrice =
            getUSDPrice(
              product
            );

          const stockCount =
            typeof product.stock !==
            "undefined"
              ? Number(
                  product.stock
                )
              : 10;

          const isOutOfStock =
            stockCount <= 0;

          const hasAffiliate =
            Boolean(
              product.affiliateUrl
            );

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

                <div class="price-container">

                  ${
                    usdPrice !== null
                      ? `
                        <span class="sale-price">
                          ${formatUSD(
                            usdPrice
                          )}
                        </span>
                      `
                      : ""
                  }

                  <span
                    class="pkr-price"
                  >
                    ${formatPKR(
                      pkrPrice
                    )}
                  </span>

                </div>

                <div
                  class="product-actions"
                >

                  ${
                    hasAffiliate
                      ? `
                        <button
                          type="button"
                          class="buy-btn"
                          onclick="
                            event.stopPropagation();
                            buyFromAffiliate('${safeId}');
                          "
                        >
                          Buy on AliExpress
                        </button>
                      `
                      : ""
                  }

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
                      addToCart('${safeId}');
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
            </div>
          `;
        }
      )
      .join("");

  renderLoadMoreButton();
}


/* =====================================
   15. LOAD MORE
===================================== */

function renderLoadMoreButton() {
  const existingButton =
    document.getElementById(
      "loadMoreProductsBtn"
    );

  if (existingButton) {
    existingButton.remove();
  }

  if (!hasMoreProducts) {
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
    button.disabled = true;
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

  if (!updatedButton) {
    return;
  }

  if (hasMoreProducts) {
    updatedButton.disabled =
      false;

    updatedButton.textContent =
      "Load More Products";
  } else {
    updatedButton.remove();
  }
}


/* =====================================
   16. PRODUCT MODAL
===================================== */

function openProductModal(
  productId
) {
  const product =
    products.find(
      (item) =>
        String(
          getProductId(item)
        ) ===
        String(productId)
    );

  if (!product) {
    return;
  }

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

  const pkrPrice =
    getPKRPrice(
      product
    );

  const usdPrice =
    getUSDPrice(
      product
    );

  const stockCount =
    typeof product.stock !==
    "undefined"
      ? Number(
          product.stock
        )
      : 10;

  const isOutOfStock =
    stockCount <= 0;

  const hasAffiliate =
    Boolean(
      product.affiliateUrl
    );

  const relatedItems =
    getRelatedProducts(
      product,
      3
    );

  const relatedHTML =
    relatedItems.length > 0
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

                  const itemUSD =
                    getUSDPrice(
                      item
                    );

                  const itemPKR =
                    getPKRPrice(
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

                      <div
                        class="related-card-title"
                      >
                        ${escapeHTML(
                          item.name ||
                            ""
                        )}
                      </div>

                      <div
                        class="related-card-price"
                      >
                        ${
                          itemUSD !== null
                            ? formatUSD(
                                itemUSD
                              )
                            : ""
                        }

                        <br>

                        ${formatPKR(
                          itemPKR
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
    <div
      class="modal-content product-modal-content"
    >

      <button
        type="button"
        class="close-modal-x"
        onclick="closeProductModal()"
      >
        &times;
      </button>

      <div
        class="product-modal-body"
      >

        <img
          src="${safeImage}"
          alt="${safeName}"
          class="product-modal-img"
        >

        <div
          class="product-modal-details"
        >

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

          <p
            class="product-description"
          >
            ${safeDesc}
          </p>

          <div
            class="price-container"
          >

            ${
              usdPrice !== null
                ? `
                  <span
                    class="sale-price"
                  >
                    ${formatUSD(
                      usdPrice
                    )}
                  </span>
                `
                : ""
            }

            <span
              class="pkr-price"
            >
              ${formatPKR(
                pkrPrice
              )}
            </span>

          </div>

          <div
            class="product-modal-actions"
          >

            ${
              hasAffiliate
                ? `
                  <button
                    type="button"
                    class="buy-btn"
                    onclick="
                      buyFromAffiliate('${safeId}');
                    "
                  >
                    Buy on AliExpress
                  </button>
                `
                : ""
            }

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
   17. CART UI
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

  const totalPrice =
    cart.reduce(
      (sum, item) =>
        sum +
        (
          Number(
            item.price
          ) || 0
        ) *
          (
            Number(
              item.quantity
            ) || 0
          ),
      0
    );

  if (cartCountEl) {
    cartCountEl.textContent =
      totalItems;
  }

  if (cartTotalAmountEl) {
    cartTotalAmountEl.textContent =
      formatPKR(
        totalPrice
      );
  }

  if (!cartItemsEl) {
    return;
  }

  if (cart.length === 0) {
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

          const price =
            Number(
              item.price
            ) || 0;

          const itemTotal =
            price *
            quantity;

          const itemUSD =
            getUSDPrice(
              item
            );

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

              <div
                class="cart-item-details"
              >

                <h4
                  class="cart-item-title"
                >
                  ${safeName}
                </h4>

                <p
                  class="cart-item-price"
                >
                  ${
                    itemUSD !== null
                      ? `${formatUSD(
                          itemUSD
                        )} | `
                      : ""
                  }

                  ${formatPKR(
                    price
                  )}

                  x ${quantity}

                  =
                  ${formatPKR(
                    itemTotal
                  )}
                </p>

              </div>

              <div
                class="cart-controls"
              >

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
   18. CART MUTATIONS
===================================== */

function addToCart(
  productId
) {
  const product =
    products.find(
      (item) =>
        String(
          getProductId(item)
        ) ===
        String(productId)
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

  if (maxStock <= 0) {
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
          getProductId(item)
        ) ===
        String(
          actualProductId
        )
    );

  if (existingItem) {
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
      quantity: 1,
    });
  }

  updateCartUI();

  showToast(
    `${product.name || "Item"} added to cart!`,
    "success",
    2500
  );
}


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
        String(productId)
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
        String(productId)
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
    item.quantity <= 0
  ) {
    removeFromCart(
      productId
    );
  } else {
    updateCartUI();
  }
}


function removeFromCart(
  productId
) {
  cart =
    cart.filter(
      (item) =>
        String(
          getProductId(item)
        ) !==
        String(productId)
    );

  updateCartUI();
}


function clearCart() {
  cart = [];

  updateCartUI();
}


/* =====================================
   19. CHECKOUT
===================================== */

function buildOrderSummaryText() {
  const dateStr =
    new Date()
      .toLocaleDateString();

  let text =
    `🛒 *ApexShopy Order Details* (${dateStr})\n`;

  text +=
    `-----------------------------------\n`;

  let totalPKR = 0;

  cart.forEach(
    (item, index) => {
      const subtotal =
        (
          Number(
            item.price
          ) || 0
        ) *
        (
          Number(
            item.quantity
          ) || 0
        );

      totalPKR +=
        subtotal;

      const itemUSD =
        getUSDPrice(
          item
        );

      text +=
        `${index + 1}. ${item.name} x${item.quantity}`;

      if (
        itemUSD !== null
      ) {
        text +=
          ` - ${formatUSD(
            itemUSD *
              (
                Number(
                  item.quantity
                ) || 0
              )
          )}`;
      }

      text +=
        ` - ${formatPKR(
          subtotal
        )}\n`;
    }
  );

  text +=
    `-----------------------------------\n`;

  text +=
    `*Total Order Value:* ${formatPKR(
      totalPKR
    )}\n`;

  text +=
    `Please process my order!`;

  return text;
}


async function checkoutMultiPlatform() {
  if (cart.length === 0) {
    showToast(
      "Your cart is empty. Add items first!",
      "error",
      3000
    );

    return;
  }

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


function showCheckoutModal(
  orderSummary,
  isCopied
) {
  const existingModal =
    document.getElementById(
      "checkoutModal"
    );

  if (existingModal) {
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
    <div
      class="modal-content"
    >

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

      <div
        class="social-links"
      >

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
   20. INITIALIZATION
===================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initTheme();

    updateCartUI();

    fetchProducts(
      true
    );
  }
);