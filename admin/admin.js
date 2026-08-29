const API_BASE_URL =
  "https://backend-kappa-orcin-35.vercel.app/api/products";

const PRODUCTS_PER_PAGE = 40;

let currentPage = 1;
let totalPages = 1;
let totalProducts = 0;
let products = [];

// ==========================================
// LOAD PRODUCTS FROM BACKEND
// ==========================================

async function loadProducts(page = 1) {
  const tbody = document.getElementById("adminProductTable");
  const countEl = document.getElementById("totalProductCount");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">
          Loading products...
        </td>
      </tr>
    `;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}?page=${page}&limit=${PRODUCTS_PER_PAGE}`
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.message || "Failed to load products"
      );
    }

    products = Array.isArray(data.products)
      ? data.products
      : [];

    currentPage = data.page || page;
    totalPages = data.totalPages || 1;
    totalProducts = data.total || 0;

    if (countEl) {
      countEl.textContent = totalProducts.toLocaleString();
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
          <td colspan="6"
              style="text-align:center; color:#dc2626; padding:30px;">
            Failed to load products.
            <br>
            <small>${escapeHtml(error.message)}</small>
          </td>
        </tr>
      `;
    }
  }
}

// ==========================================
// RENDER PRODUCT TABLE
// ==========================================

function renderAdminTable() {
  const tbody =
    document.getElementById(
      "adminProductTable"
    );

  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="6"
          style="text-align:center; color:#6b7280; padding:30px;"
        >
          No products found.
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML = products
    .map((product) => {
      const productId =
        product._id || product.id || "";

      const name =
        product.name || "Unnamed Product";

      const category =
        product.category || "General";

      const price =
        Number(product.price) || 0;

      const stock =
        typeof product.stock !== "undefined"
          ? product.stock
          : 0;

      const image =
        product.image ||
        "https://via.placeholder.com/60";

      return `
        <tr>
          <td>
            <img
              src="${escapeHtml(image)}"
              alt="${escapeHtml(name)}"
              style="
                width:50px;
                height:50px;
                object-fit:cover;
                border-radius:6px;
              "
              loading="lazy"
              onerror="this.src='https://via.placeholder.com/60';"
            >
          </td>

          <td style="font-weight:500;">
            ${escapeHtml(name)}
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
              ${escapeHtml(category)}
            </span>
          </td>

          <td>
            $${price.toFixed(2)}
          </td>

          <td>
            ${escapeHtml(String(stock))}
          </td>

          <td>
            <button
              class="action-btn btn-edit"
              onclick="openEditModal('${escapeHtml(
                String(productId)
              )}')"
            >
              Edit
            </button>

            <button
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

// ==========================================
// PAGINATION
// ==========================================

function renderPagination() {
  let pagination =
    document.getElementById(
      "adminPagination"
    );

  if (!pagination) {
    pagination =
      document.createElement("div");

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
      class="action-btn"
      onclick="changePage(${currentPage - 1})"
      ${currentPage <= 1 ? "disabled" : ""}
    >
      Previous
    </button>

    <span style="font-size:14px; font-weight:600;">
      Page ${currentPage.toLocaleString()}
      of ${totalPages.toLocaleString()}
    </span>

    <button
      class="action-btn"
      onclick="changePage(${currentPage + 1})"
      ${currentPage >= totalPages ? "disabled" : ""}
    >
      Next
    </button>
  `;
}

function changePage(page) {
  if (page < 1) return;

  if (page > totalPages) return;

  loadProducts(page);
}

// ==========================================
// MODAL CONTROLS
// ==========================================

function openAddModal() {
  document.getElementById(
    "modalTitle"
  ).textContent = "Add New Product";

  document.getElementById(
    "productForm"
  ).reset();

  document.getElementById(
    "productId"
  ).value = "";

  document.getElementById(
    "productModal"
  ).classList.remove("hidden");
}

async function openEditModal(id) {
  const product = products.find(
    (item) =>
      String(
        item._id || item.id
      ) === String(id)
  );

  if (!product) {
    alert("Product not found.");
    return;
  }

  document.getElementById(
    "modalTitle"
  ).textContent = "Edit Product";

  document.getElementById(
    "productId"
  ).value =
    product._id || product.id;

  document.getElementById(
    "productName"
  ).value =
    product.name || "";

  document.getElementById(
    "productCategory"
  ).value =
    product.category || "Electronics";

  document.getElementById(
    "productPrice"
  ).value =
    product.price || 0;

  document.getElementById(
    "productStock"
  ).value =
    product.stock || 0;

  document.getElementById(
    "productImage"
  ).value =
    product.image || "";

  document.getElementById(
    "productDescription"
  ).value =
    product.description || "";

  document.getElementById(
    "productModal"
  ).classList.remove("hidden");
}

function closeModal() {
  document.getElementById(
    "productModal"
  ).classList.add("hidden");
}

// ==========================================
// ADD / UPDATE PRODUCT
// ==========================================

async function handleProductSubmit(event) {
  event.preventDefault();

  const id =
    document.getElementById(
      "productId"
    ).value.trim();

  const name =
    document.getElementById(
      "productName"
    ).value.trim();

  const category =
    document.getElementById(
      "productCategory"
    ).value;

  const price =
    parseFloat(
      document.getElementById(
        "productPrice"
      ).value
    );

  const stock =
    parseInt(
      document.getElementById(
        "productStock"
      ).value
    ) || 0;

  const image =
    document.getElementById(
      "productImage"
    ).value.trim();

  const description =
    document.getElementById(
      "productDescription"
    ).value.trim();

  const productData = {
    name,
    category,
    price,
    stock,
    image,
    description
  };

  try {
    const url = id
      ? `${API_BASE_URL}/${encodeURIComponent(id)}`
      : API_BASE_URL;

    const method = id
      ? "PUT"
      : "POST";

    const response =
      await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify(
          productData
        )
      });

    const data =
      await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Failed to save product"
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

// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(id) {
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
        `${API_BASE_URL}/${encodeURIComponent(id)}`,
        {
          method: "DELETE"
        }
      );

    const data =
      await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Failed to delete product"
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

// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHtml(str) {
  return String(str)
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

// ==========================================
// INITIALIZE ADMIN
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {
    loadProducts(1);
  }
);