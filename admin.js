const API_BASE = "https://apex-shopy.vercel.app/api/products";

document.addEventListener("DOMContentLoaded", fetchAdminProducts);

async function fetchAdminProducts() {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();

    if (data.success) {
      document.getElementById("totalProductCount").textContent = data.count;
      renderAdminTable(data.products);
    }
  } catch (err) {
    console.error("Error loading products:", err);
    document.getElementById("adminProductTable").innerHTML = 
      `<tr><td colspan="6" style="color:red;">Failed to load products. Check API connection.</td></tr>`;
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
      <td><img src="${product.image || 'https://via.placeholder.com/40'}" width="40" height="40" style="object-fit:cover; border-radius:4px;"></td>
      <td><strong>${product.name}</strong></td>
      <td>${product.category || 'N/A'}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.stock}</td>
      <td>
        <button class="action-btn btn-edit" onclick="editProduct('${product._id}')">Edit</button>
        <button class="action-btn btn-delete" onclick="deleteProduct('${product._id}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

function openAddModal() {
  alert("Add Product Modal will be connected in Step 2.");
}

function editProduct(id) {
  alert("Editing product ID: " + id);
}

function deleteProduct(id) {
  alert("Delete handler for ID: " + id);
}