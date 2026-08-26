// Sample initial products if none exist in localStorage
const defaultAdminProducts = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 99.99, stock: 15, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80", description: "High-quality noise-canceling wireless headphones." },
  { id: 2, name: "Smart Fitness Watch", category: "Wearables", price: 149.99, stock: 8, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80", description: "Track your health, fitness, and daily notifications." },
  { id: 3, name: "Minimalist Backpack", category: "Accessories", price: 59.99, stock: 20, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&q=80", description: "Durable and sleek backpack for daily use." }
];

// Load products from localStorage or initialize defaults
function getProducts() {
  const stored = localStorage.getItem("apex_products");
  if (!stored) {
    localStorage.setItem("apex_products", JSON.stringify(defaultAdminProducts));
    return defaultAdminProducts;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultAdminProducts;
  }
}

function saveProducts(products) {
  localStorage.setItem("apex_products", JSON.stringify(products));
}

// Render Table and Stats on Page Load
document.addEventListener("DOMContentLoaded", () => {
  renderAdminTable();
});

function renderAdminTable() {
  const products = getProducts();
  const tbody = document.getElementById("adminProductTable");
  const countEl = document.getElementById("totalProductCount");
  
  if (countEl) {
    countEl.textContent = products.length;
  }

  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #6b7280;">No products found. Click "+ Add New Product" to begin.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image || 'https://via.placeholder.com/40'}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
      <td style="font-weight: 500;">${escapeHtml(p.name)}</td>
      <td><span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${escapeHtml(p.category || 'General')}</span></td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button class="action-btn btn-edit" onclick="openEditModal(${p.id})">Edit</button>
        <button class="action-btn btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

// Modal Controls
function openAddModal() {
  document.getElementById("modalTitle").textContent = "Add New Product";
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("productModal").classList.remove("hidden");
}

function openEditModal(id) {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById("modalTitle").textContent = "Edit Product";
  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name || "";
  document.getElementById("productCategory").value = product.category || "Electronics";
  document.getElementById("productPrice").value = product.price || 0;
  document.getElementById("productStock").value = product.stock || 0;
  document.getElementById("productImage").value = product.image || "";
  document.getElementById("productDescription").value = product.description || "";

  document.getElementById("productModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("productModal").classList.add("hidden");
}

// Handle Form Submission (Add / Update)
function handleProductSubmit(event) {
  event.preventDefault();
  
  const idField = document.getElementById("productId").value;
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const stock = parseInt(document.getElementById("productStock").value) || 0;
  const image = document.getElementById("productImage").value.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80";
  const description = document.getElementById("productDescription").value.trim();

  let products = getProducts();

  if (idField) {
    // Edit existing product
    products = products.map(p => p.id == idField ? { ...p, name, category, price, stock, image, description } : p);
  } else {
    // Add new product
    const newProduct = {
      id: Date.now(),
      name,
      category,
      price,
      stock,
      image,
      description
    };
    products.push(newProduct);
  }

  saveProducts(products);
  closeModal();
  renderAdminTable();
}

// Delete Product
function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    let products = getProducts();
    products = products.filter(p => p.id !== id);
    saveProducts(products);
    renderAdminTable();
  }
}

// Security helper to prevent HTML injection
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}