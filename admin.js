const API_BASE = "https://apex-shopy.vercel.app/api/products";
let allProducts = [];

document.addEventListener("DOMContentLoaded", fetchAdminProducts);

async function fetchAdminProducts() {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();

    if (data.success) {
      allProducts = data.products;
      document.getElementById("totalProductCount").textContent = data.count;
      renderAdminTable(allProducts);
    }
  } catch (err) {
    console.error("Error loading products:", err);
    document.getElementById("adminProductTable").innerHTML = 
      `<tr><td colspan="6" style="color:red;">Failed to load products. Check backend API connection.</td></tr>`;
  }
}

function renderAdminTable(products) {
  const tableBody = document.getElementById("adminProductTable");
  
  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6">No products found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = products.map(product => `
    <tr>
      <td><img src="${product.image || 'https://via.placeholder.com/40'}" width="40" height="40" style="object-fit:cover; border-radius:4px;" onerror="this.src='https://via.placeholder.com/40'"></td>
      <td><strong>${product.name}</strong></td>
      <td>${product.category || 'N/A'}</td>
      <td>$${Number(product.price).toFixed(2)}</td>
      <td>${product.stock}</td>
      <td>
        <button class="action-btn btn-edit" onclick="openEditModal('${product._id}')">Edit</button>
        <button class="action-btn btn-delete" onclick="deleteProduct('${product._id}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

function openAddModal() {
  document.getElementById("modalTitle").textContent = "Add New Product";
  document.getElementById("productId").value = "";
  document.getElementById("productForm").reset();
  document.getElementById("productModal").classList.remove("hidden");
}

function openEditModal(id) {
  const product = allProducts.find(p => p._id === id);
  if (!product) return;

  document.getElementById("modalTitle").textContent = "Edit Product";
  document.getElementById("productId").value = product._id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productCategory").value = product.category || "Electronics";
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productStock").value = product.stock || 0;
  document.getElementById("productImage").value = product.image || "";
  document.getElementById("productDescription").value = product.description || "";
  
  document.getElementById("productModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("productModal").classList.add("hidden");
}

async function handleProductSubmit(event) {
  event.preventDefault();
  
  const id = document.getElementById("productId").value;
  const payload = {
    name: document.getElementById("productName").value,
    category: document.getElementById("productCategory").value,
    price: parseFloat(document.getElementById("productPrice").value),
    stock: parseInt(document.getElementById("productStock").value, 10),
    image: document.getElementById("productImage").value,
    description: document.getElementById("productDescription").value
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `${API_BASE}/${id}` : API_BASE;
  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      closeModal();
      fetchAdminProducts();
    } else {
      alert("Error saving product: " + data.message);
    }
  } catch (err) {
    console.error("Save product error:", err);
    alert("Failed to submit product data.");
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    const data = await res.json();
    
    if (data.success) {
      fetchAdminProducts();
    } else {
      alert("Error deleting product: " + data.message);
    }
  } catch (err) {
    console.error("Delete product error:", err);
    alert("Failed to delete product.");
  }
}