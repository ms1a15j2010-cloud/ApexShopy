const API_BASE_URL =
  "https://backend-kappa-orcin-35.vercel.app/api/products";

const AUTH_API_URL =
  "https://backend-kappa-orcin-35.vercel.app/api/auth";

const PRODUCTS_PER_PAGE = 40;

const AUTH_TOKEN_KEY =
  "apexshopy_admin_token";

const ADMIN_USER_KEY =
  "apexshopy_admin_user";

let currentPage = 1;
let totalPages = 1;
let totalProducts = 0;
let products = [];

// ============================================================
// AUTHENTICATION STORAGE
// ============================================================

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredAdmin() {
  try {
    const stored =
      localStorage.getItem(ADMIN_USER_KEY);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error(
      "Failed to read stored admin:",
      error
    );

    return null;
  }
}

function saveAuthentication(token, admin) {
  localStorage.setItem(
    AUTH_TOKEN_KEY,
    token
  );

  localStorage.setItem(
    ADMIN_USER_KEY,
    JSON.stringify(admin)
  );
}

function clearAuthentication() {
  localStorage.removeItem(
    AUTH_TOKEN_KEY
  );

  localStorage.removeItem(
    ADMIN_USER_KEY
  );
}

// ============================================================
// LOGIN / DASHBOARD DISPLAY
// ============================================================

function showLoginScreen() {
  const loginScreen =
    document.getElementById(
      "loginScreen"
    );

  const dashboard =
    document.getElementById(
      "adminDashboard"
    );

  const productModal =
    document.getElementById(
      "productModal"
    );

  if (loginScreen) {
    loginScreen.classList.remove(
      "hidden"
    );
  }

  if (dashboard) {
    dashboard.classList.add(
      "hidden"
    );
  }

  if (productModal) {
    productModal.classList.add(
      "hidden"
    );
  }
}

function showDashboard() {
  const loginScreen =
    document.getElementById(
      "loginScreen"
    );

  const dashboard =
    document.getElementById(
      "adminDashboard"
    );

  if (loginScreen) {
    loginScreen.classList.add(
      "hidden"
    );
  }

  if (dashboard) {
    dashboard.classList.remove(
      "hidden"
    );
  }

  const admin =
    getStoredAdmin();

  const loggedInAdmin =
    document.getElementById(
      "loggedInAdmin"
    );

  if (
    loggedInAdmin &&
    admin &&
    admin.username
  ) {
    loggedInAdmin.textContent =
      admin.username;
  }
}

function handleAuthenticationFailure(
  message = "Your session has expired. Please log in again."
) {
  clearAuthentication();

  products = [];
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;

  showLoginScreen();

  const loginError =
    document.getElementById(
      "loginError"
    );

  if (loginError) {
    loginError.textContent =
      message;

    loginError.classList.remove(
      "hidden"
    );
  }
}

// ============================================================
// VERIFY TOKEN WITH VERCEL BACKEND
// ============================================================

async function verifyAuthentication() {
  const token =
    getAuthToken();

  if (!token) {
    return false;
  }

  try {
    const response =
      await fetch(
        `${AUTH_API_URL}/verify`,
        {
          method: "GET",

          headers: {
            "Authorization":
              `Bearer ${token}`
          },

          cache: "no-store"
        }
      );

    let data;

    try {
      data =
        await response.json();
    } catch (error) {
      console.error(
        "Invalid verification response:",
        error
      );

      clearAuthentication();

      return false;
    }

    if (
      !response.ok ||
      !data.success ||
      !data.authenticated
    ) {
      clearAuthentication();

      return false;
    }

    if (data.admin) {
      localStorage.setItem(
        ADMIN_USER_KEY,
        JSON.stringify(
          data.admin
        )
      );
    }

    return true;
  } catch (error) {
    console.error(
      "Authentication verification failed:",
      error
    );

    /*
      Network errors should NOT immediately
      delete a valid token. The user can still
      try to continue if the backend is temporarily
      unreachable.
    */

    return false;
  }
}

// ============================================================
// ADMIN LOGIN
// ============================================================

async function handleLogin(event) {
  event.preventDefault();

  const usernameInput =
    document.getElementById(
      "loginUsername"
    );

  const passwordInput =
    document.getElementById(
      "loginPassword"
    );

  const loginButton =
    document.getElementById(
      "loginButton"
    );

  const loginError =
    document.getElementById(
      "loginError"
    );

  if (
    !usernameInput ||
    !passwordInput
  ) {
    return;
  }

  const username =
    usernameInput.value.trim();

  const password =
    passwordInput.value;

  if (!username || !password) {
    showLoginError(
      "Username and password are required."
    );

    return;
  }

  if (loginError) {
    loginError.textContent = "";

    loginError.classList.add(
      "hidden"
    );
  }

  if (loginButton) {
    loginButton.disabled = true;

    loginButton.textContent =
      "Signing in...";
  }

  try {
    const response =
      await fetch(
        `${AUTH_API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            username,
            password
          })
        }
      );

    let data;

    try {
      data =
        await response.json();
    } catch (error) {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Invalid username or password."
      );
    }

    if (!data.token) {
      throw new Error(
        "Login succeeded but no authentication token was returned."
      );
    }

    /*
      Save JWT and admin information.
    */

    saveAuthentication(
      data.token,
      data.admin || {
        username:
          username.toLowerCase(),
        role: "admin"
      }
    );

    /*
      Clear password field.
    */

    passwordInput.value = "";

    /*
      Show dashboard immediately.
    */

    showDashboard();

    /*
      Verify the newly received token
      against the live Vercel backend.
    */

    const verified =
      await verifyAuthentication();

    if (!verified) {
      handleAuthenticationFailure(
        "Login succeeded, but the authentication token could not be verified."
      );

      return;
    }

    /*
      Load products after successful
      authentication.
    */

    await loadProducts(1);

  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    showLoginError(
      error.message ||
      "Login failed. Please try again."
    );
  } finally {
    if (loginButton) {
      loginButton.disabled = false;

      loginButton.textContent =
        "Sign In";
    }
  }
}

function showLoginError(message) {
  const loginError =
    document.getElementById(
      "loginError"
    );

  if (!loginError) {
    alert(message);
    return;
  }

  loginError.textContent =
    message;

  loginError.classList.remove(
    "hidden"
  );
}

function logoutAdmin() {
  clearAuthentication();

  products = [];
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;

  showLoginScreen();

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  if (loginForm) {
    loginForm.reset();
  }

  const loginError =
    document.getElementById(
      "loginError"
    );

  if (loginError) {
    loginError.textContent = "";

    loginError.classList.add(
      "hidden"
    );
  }
}

// ============================================================
// AUTHORIZATION HEADER
// ============================================================

function getAuthHeaders() {
  const token =
    getAuthToken();

  if (!token) {
    return {
      "Content-Type":
        "application/json"
    };
  }

  return {
    "Content-Type":
      "application/json",

    "Authorization":
      `Bearer ${token}`
  };
}

// ============================================================
// LOAD PRODUCTS
// ============================================================

async function loadProducts(
  page = 1
) {
  const tbody =
    document.getElementById(
      "adminProductTable"
    );

  const countEl =
    document.getElementById(
      "totalProductCount"
    );

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="6"
          style="text-align:center;"
        >
          Loading products...
        </td>
      </tr>
    `;
  }

  try {
    const response =
      await fetch(
        `${API_BASE_URL}?page=${page}&limit=${PRODUCTS_PER_PAGE}`,
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status}`
      );
    }

    const data =
      await response.json();

    if (!data.success) {
      throw new Error(
        data.message ||
        "Failed to load products"
      );
    }

    products =
      Array.isArray(
        data.products
      )
        ? data.products
        : [];

    currentPage =
      data.page || page;

    totalPages =
      data.totalPages || 1;

    totalProducts =
      data.total ??
      data.totalProducts ??
      0;

    if (countEl) {
      countEl.textContent =
        Number(
          totalProducts
        ).toLocaleString();
    }

    renderAdminTable();

    renderPagination();

  } catch (error) {
    console.error(
      "Admin products loading error:",
      error
    );

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td
            colspan="6"
            style="
              text-align:center;
              color:#dc2626;
              padding:30px;
            "
          >
            Failed to load products.
            <br>
            <small>
              ${escapeHtml(
                error.message
              )}
            </small>
          </td>
        </tr>
      `;
    }
  }
}

// ============================================================
// RENDER PRODUCT TABLE
// ============================================================

function renderAdminTable() {
  const tbody =
    document.getElementById(
      "adminProductTable"
    );

  if (!tbody) {
    return;
  }

  if (
    products.length === 0
  ) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="6"
          style="
            text-align:center;
            color:#6b7280;
            padding:30px;
          "
        >
          No products found.
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML =
    products
      .map((product) => {
        const productId =
          product._id ||
          product.id ||
          "";

        const name =
          product.name ||
          "Unnamed Product";

        const category =
          product.category ||
          "General";

        const price =
          Number(
            product.pricePKR ??
            product.price
          ) || 0;

        const stock =
          typeof product.stock !==
          "undefined"
            ? product.stock
            : 0;

        const image =
          product.image ||
          "https://via.placeholder.com/60";

        return `
          <tr>

            <td>

              <img
                src="${escapeHtml(
                  image
                )}"
                alt="${escapeHtml(
                  name
                )}"
                style="
                  width:50px;
                  height:50px;
                  object-fit:cover;
                  border-radius:6px;
                "
                loading="lazy"
                onerror="
                  this.src='https://via.placeholder.com/60';
                "
              >

            </td>

            <td
              style="
                font-weight:500;
              "
            >
              ${escapeHtml(
                name
              )}
            </td>

            <td>

              <span
                style="
                  background:#f3f4f6;
                  padding:4px 8px;
                  border-radius:4px;
                  font-size:12px;
                "
              >
                ${escapeHtml(
                  category
                )}
              </span>

            </td>

            <td>
              PKR ${price.toLocaleString(
                "en-PK",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }
              )}
            </td>

            <td>
              ${escapeHtml(
                String(stock)
              )}
            </td>

            <td>

              <button
                type="button"
                class="action-btn btn-edit"
                onclick="openEditModal('${escapeHtml(
                  String(productId)
                )}')"
              >
                Edit
              </button>

              <button
                type="button"
                class="action-btn btn-delete"
                onclick="deleteProduct('${escapeHtml(
                  String(productId)
                )}')"
              >
                Delete
              </button>

            </td>

          </tr>
        `;
      })
      .join("");
}

// ============================================================
// PAGINATION
// ============================================================

function renderPagination() {
  let pagination =
    document.getElementById(
      "adminPagination"
    );

  if (!pagination) {
    pagination =
      document.createElement(
        "div"
      );

    pagination.id =
      "adminPagination";

    pagination.style.display =
      "flex";

    pagination.style.justifyContent =
      "center";

    pagination.style.alignItems =
      "center";

    pagination.style.gap =
      "10px";

    pagination.style.marginTop =
      "20px";

    const tableContainer =
      document.querySelector(
        ".admin-table-container"
      );

    if (tableContainer) {
      tableContainer.appendChild(
        pagination
      );
    }
  }

  pagination.innerHTML = `
    <button
      type="button"
      class="action-btn"
      onclick="changePage(${currentPage - 1})"
      ${
        currentPage <= 1
          ? "disabled"
          : ""
      }
    >
      Previous
    </button>

    <span
      style="
        font-size:14px;
        font-weight:600;
      "
    >
      Page
      ${currentPage.toLocaleString()}
      of
      ${totalPages.toLocaleString()}
    </span>

    <button
      type="button"
      class="action-btn"
      onclick="changePage(${currentPage + 1})"
      ${
        currentPage >= totalPages
          ? "disabled"
          : ""
      }
    >
      Next
    </button>
  `;
}

function changePage(page) {
  if (page < 1) {
    return;
  }

  if (page > totalPages) {
    return;
  }

  loadProducts(page);
}

// ============================================================
// MODAL CONTROLS
// ============================================================

function openAddModal() {
  if (!getAuthToken()) {
    handleAuthenticationFailure(
      "Please log in to add products."
    );

    return;
  }

  const modalTitle =
    document.getElementById(
      "modalTitle"
    );

  const productForm =
    document.getElementById(
      "productForm"
    );

  const productId =
    document.getElementById(
      "productId"
    );

  const productModal =
    document.getElementById(
      "productModal"
    );

  if (modalTitle) {
    modalTitle.textContent =
      "Add New Product";
  }

  if (productForm) {
    productForm.reset();
  }

  if (productId) {
    productId.value = "";
  }

  if (productModal) {
    productModal.classList.remove(
      "hidden"
    );
  }
}

function openEditModal(id) {
  if (!getAuthToken()) {
    handleAuthenticationFailure(
      "Please log in to edit products."
    );

    return;
  }

  const product =
    products.find(
      (item) =>
        String(
          item._id ||
          item.id
        ) ===
        String(id)
    );

  if (!product) {
    alert(
      "Product not found."
    );

    return;
  }

  const modalTitle =
    document.getElementById(
      "modalTitle"
    );

  const productId =
    document.getElementById(
      "productId"
    );

  const productName =
    document.getElementById(
      "productName"
    );

  const productCategory =
    document.getElementById(
      "productCategory"
    );

  const productPrice =
    document.getElementById(
      "productPrice"
    );

  const productStock =
    document.getElementById(
      "productStock"
    );

  const productImage =
    document.getElementById(
      "productImage"
    );

  const productDescription =
    document.getElementById(
      "productDescription"
    );

  const productModal =
    document.getElementById(
      "productModal"
    );

  if (modalTitle) {
    modalTitle.textContent =
      "Edit Product";
  }

  if (productId) {
    productId.value =
      product._id ||
      product.id ||
      "";
  }

  if (productName) {
    productName.value =
      product.name ||
      "";
  }

  if (productCategory) {
    productCategory.value =
      product.category ||
      "General";
  }

  if (productPrice) {
    productPrice.value =
      product.pricePKR ??
      product.price ??
      0;
  }

  if (productStock) {
    productStock.value =
      product.stock ??
      0;
  }

  if (productImage) {
    productImage.value =
      product.image ||
      "";
  }

  if (productDescription) {
    productDescription.value =
      product.description ||
      "";
  }

  if (productModal) {
    productModal.classList.remove(
      "hidden"
    );
  }
}

function closeModal() {
  const productModal =
    document.getElementById(
      "productModal"
    );

  if (productModal) {
    productModal.classList.add(
      "hidden"
    );
  }
}

// ============================================================
// ADD / UPDATE PRODUCT
// ============================================================

async function handleProductSubmit(
  event
) {
  event.preventDefault();

  const token =
    getAuthToken();

  if (!token) {
    handleAuthenticationFailure(
      "Please log in to manage products."
    );

    return;
  }

  const productIdElement =
    document.getElementById(
      "productId"
    );

  const productNameElement =
    document.getElementById(
      "productName"
    );

  const productCategoryElement =
    document.getElementById(
      "productCategory"
    );

  const productPriceElement =
    document.getElementById(
      "productPrice"
    );

  const productStockElement =
    document.getElementById(
      "productStock"
    );

  const productImageElement =
    document.getElementById(
      "productImage"
    );

  const productDescriptionElement =
    document.getElementById(
      "productDescription"
    );

  const id =
    productIdElement
      ? productIdElement.value.trim()
      : "";

  const name =
    productNameElement
      ? productNameElement.value.trim()
      : "";

  const category =
    productCategoryElement
      ? productCategoryElement.value
      : "General";

  const price =
    productPriceElement
      ? parseFloat(
          productPriceElement.value
        )
      : NaN;

  const stock =
    productStockElement
      ? parseInt(
          productStockElement.value,
          10
        ) || 0
      : 0;

  const image =
    productImageElement
      ? productImageElement.value.trim()
      : "";

  const description =
    productDescriptionElement
      ? productDescriptionElement.value.trim()
      : "";

  if (!name) {
    alert(
      "Product name is required."
    );

    return;
  }

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    alert(
      "Please enter a valid price."
    );

    return;
  }

  if (stock < 0) {
    alert(
      "Stock cannot be negative."
    );

    return;
  }

  const productData = {
    name,
    category,
    price,
    pricePKR: price,
    stock,
    image,
    description
  };

  try {
    const url = id
      ? `${API_BASE_URL}/${encodeURIComponent(
          id
        )}`
      : API_BASE_URL;

    const method = id
      ? "PUT"
      : "POST";

    const response =
      await fetch(
        url,
        {
          method,

          headers:
            getAuthHeaders(),

          body:
            JSON.stringify(
              productData
            )
        }
      );

    let data;

    try {
      data =
        await response.json();
    } catch (error) {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (
      response.status === 401
    ) {
      handleAuthenticationFailure(
        data.message ||
        "Your login session has expired."
      );

      return;
    }

    if (
      response.status === 403
    ) {
      handleAuthenticationFailure(
        data.message ||
        "Admin access is required."
      );

      return;
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Failed to save product."
      );
    }

    closeModal();

    await loadProducts(
      currentPage
    );

    alert(
      id
        ? "Product updated successfully."
        : "Product created successfully."
    );

  } catch (error) {
    console.error(
      "Save product error:",
      error
    );

    alert(
      `Failed to save product:\n${error.message}`
    );
  }
}

// ============================================================
// DELETE PRODUCT
// ============================================================

async function deleteProduct(
  id
) {
  if (!getAuthToken()) {
    handleAuthenticationFailure(
      "Please log in to delete products."
    );

    return;
  }

  if (
    !confirm(
      "Are you sure you want to delete this product?"
    )
  ) {
    return;
  }

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",

          headers:
            getAuthHeaders()
        }
      );

    let data;

    try {
      data =
        await response.json();
    } catch (error) {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (
      response.status === 401
    ) {
      handleAuthenticationFailure(
        data.message ||
        "Your login session has expired."
      );

      return;
    }

    if (
      response.status === 403
    ) {
      handleAuthenticationFailure(
        data.message ||
        "Admin access is required."
      );

      return;
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Failed to delete product."
      );
    }

    if (
      products.length === 1 &&
      currentPage > 1
    ) {
      currentPage--;
    }

    await loadProducts(
      currentPage
    );

    alert(
      "Product deleted successfully."
    );

  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    alert(
      `Failed to delete product:\n${error.message}`
    );
  }
}

// ============================================================
// SECURITY HELPER
// ============================================================

function escapeHtml(value) {
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

// ============================================================
// INITIALIZE ADMIN
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const loginForm =
      document.getElementById(
        "loginForm"
      );

    if (loginForm) {
      loginForm.addEventListener(
        "submit",
        handleLogin
      );
    }

    /*
      Always verify an existing token
      against the LIVE Vercel backend.
    */

    const token =
      getAuthToken();

    if (!token) {
      showLoginScreen();

      return;
    }

    /*
      Temporarily keep the dashboard hidden
      until the token has been checked.
    */

    showLoginScreen();

    const authenticated =
      await verifyAuthentication();

    if (!authenticated) {
      clearAuthentication();

      showLoginScreen();

      return;
    }

    /*
      Valid token → enter dashboard.
    */

    showDashboard();

    await loadProducts(1);
  }
);

