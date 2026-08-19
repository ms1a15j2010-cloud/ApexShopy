/* =====================================
   1. STORE CONFIGURATION & STATE
===================================== */
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/p/19WQNXqUhe/",
  instagram: "https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=10s3kk6s",
  reddit: "https://www.reddit.com/user/apexshopy"
};

let products = [];
let cart = loadCartFromStorage();
let activeCategory = 'All';
let searchQuery = '';

// ==========================================
// 2. FETCH PRODUCTS
// ==========================================
async function fetchProducts() {
  const container = document.getElementById('productGrid');
  try {
    const response = await fetch('products.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    products = await response.json();
    renderProducts();
  } catch (err) {
    console.error('Failed to load products.json:', err);
    if (container) {
      container.innerHTML = `<div class="error-msg"><p>Unable to load products right now.</p></div>`;
    }
    showToast('Failed to connect to store server.', 'error', 4000);
  }
}

// ==========================================
// 3. UTILITIES & STORAGE
// ==========================================
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCurrency(amount) {
  const num = Number(amount);
  return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
}

function loadCartFromStorage() {
  try {
    const savedCart = localStorage.getItem('apex_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (err) {
    console.error('Error loading cart:', err);
    return [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem('apex_cart', JSON.stringify(cart));
  } catch (err) {
    console.error('Error saving cart:', err);
  }
}

function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.setProperty('--delay', `${duration / 1000}s`);
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration + 300);
}

// ==========================================
// 4. THEME MANAGEMENT
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('apex_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', theme);
  updateThemeButton(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('apex_theme', newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}

// ==========================================
// 5. UI & FILTER HANDLERS
// ==========================================
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

function filterProducts() {
  const input = document.getElementById('searchInput');
  if (input) {
    searchQuery = input.value.trim();
    renderProducts();
  }
}

function filterCategory(category, event) {
  activeCategory = category;
  
  const buttons = document.querySelectorAll('.categories button');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }

  renderProducts();
}

// ==========================================
// 6. RENDERING & MODALS
// ==========================================
function renderProducts() {
  const container = document.getElementById('productGrid');
  if (!container) return;

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    container.innerHTML = `<div class="no-results"><p>No products found.</p></div>`;
    return;
  }

  container.innerHTML = filteredProducts.map(product => {
    const safeName = escapeHTML(product.name || 'Product');
    const safeImage = escapeHTML(product.image || '');
    const ratingDisplay = escapeHTML(product.rating || '★ 5.0');
    
    const activePrice = product.price || 0;
    const originalPrice = product.originalPrice;
    const hasDiscount = originalPrice && originalPrice > activePrice;

    return `
      <div class="card" data-id="${product.id}" onclick="openProductModal(${product.id})">
        <img src="${safeImage}" alt="${safeName}" loading="lazy">
        <div class="card-info">
          <h3 class="card-title">${safeName}</h3>
          <div class="rating">${ratingDisplay}</div>
          <div class="price-container">
            <span class="sale-price">${formatCurrency(activePrice)}</span>
            ${hasDiscount ? `<span class="original-price">${formatCurrency(originalPrice)}</span>` : ''}
          </div>
          <button class="add-btn" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
        </div>
      </div>
    `;
  }).join('');
}

function openProductModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingModal = document.getElementById('productDetailModal');
  if (existingModal) existingModal.remove();

  const safeName = escapeHTML(product.name || 'Product');
  const safeImage = escapeHTML(product.image || '');
  const safeDesc = escapeHTML(product.description || 'High quality product designed for durability and performance.');
  const ratingDisplay = escapeHTML(product.rating || '★ 5.0');
  const activePrice = product.price || 0;
  const originalPrice = product.originalPrice;
  const hasDiscount = originalPrice && originalPrice > activePrice;

  const modal = document.createElement('div');
  modal.id = 'productDetailModal';
  modal.className = 'modal-overlay';
  modal.onclick = (e) => {
    if (e.target === modal) closeProductModal();
  };

  modal.innerHTML = `
    <div class="modal-content product-modal-content">
      <button class="close-modal-x" onclick="closeProductModal()">&times;</button>
      <div class="product-modal-body">
        <img src="${safeImage}" alt="${safeName}" class="product-modal-img">
        <div class="product-modal-details">
          <h2>${safeName}</h2>
          <div class="rating">${ratingDisplay}</div>
          <p class="product-description">${safeDesc}</p>
          <div class="price-container">
            <span class="sale-price">${formatCurrency(activePrice)}</span>
            ${hasDiscount ? `<span class="original-price">${formatCurrency(originalPrice)}</span>` : ''}
          </div>
          <button class="add-btn" onclick="addToCart(${product.id}); closeProductModal();">Add to Cart</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeProductModal() {
  const modal = document.getElementById('productDetailModal');
  if (modal) modal.remove();
}

function updateCartUI() {
  saveCartToStorage();

  const cartCountEl = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalAmountEl = document.getElementById('cartTotalAmount');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  if (cartCountEl) cartCountEl.textContent = totalItems;
  if (cartTotalAmountEl) cartTotalAmountEl.textContent = formatCurrency(totalPrice);

  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty-cart-msg">Your cart is currently empty.</p>`;
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => {
    const safeName = escapeHTML(item.name || 'Product');
    const safeImage = escapeHTML(item.image || '');
    const itemTotal = (item.price || 0) * item.quantity;

    return `
      <div class="cart-item" data-id="${item.id}">
        <img src="${safeImage}" alt="${safeName}" class="cart-item-img" loading="lazy">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${safeName}</h4>
          <p class="cart-item-price">${formatCurrency(item.price)} x ${item.quantity} = ${formatCurrency(itemTotal)}</p>
        </div>
        <div class="cart-controls">
          <button onclick="updateQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">&times;</button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 7. CART MUTATIONS
// ==========================================
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartUI();
  showToast(`${product.name || 'Item'} added to cart!`, 'success', 2500);
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    updateCartUI();
  }
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}

function clearCart() {
  cart = [];
  updateCartUI();
}

// ==========================================
// 8. CHECKOUT & ORDER MODAL
// ==========================================
function buildOrderSummaryText() {
  const dateStr = new Date().toLocaleDateString();
  let text = `🛒 *ApexShopy Order Details* (${dateStr})\n`;
  text += `-----------------------------------\n`;

  let total = 0;
  cart.forEach((item, index) => {
    const itemSubtotal = (item.price || 0) * item.quantity;
    total += itemSubtotal;
    text += `${index + 1}. ${item.name} x${item.quantity} - $${itemSubtotal.toFixed(2)}\n`;
  });

  text += `-----------------------------------\n`;
  text += `*Total Order Value:* $${total.toFixed(2)}\n`;
  text += `Please process my order!`;

  return text;
}

async function checkoutMultiPlatform() {
  if (cart.length === 0) {
    showToast('Your cart is empty. Add items first!', 'error', 3000);
    return;
  }

  const orderSummary = buildOrderSummaryText();
  let copySuccess = false;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(orderSummary);
      copySuccess = true;
      showToast('Order summary copied to clipboard!', 'info', 3000);
    }
  } catch (err) {
    console.warn('Clipboard permission failed:', err);
    copySuccess = false;
  }

  showCheckoutModal(orderSummary, copySuccess);
}

function showCheckoutModal(orderSummary, isCopied) {
  const existingModal = document.getElementById('checkoutModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'checkoutModal';
  modal.className = 'modal-overlay';
  modal.onclick = (e) => {
    if (e.target === modal) closeCheckoutModal();
  };

  modal.innerHTML = `
    <div class="modal-content">
      <h2>${isCopied ? '✅ Order Copied to Clipboard!' : '📋 Order Summary Ready'}</h2>
      <p>
        ${isCopied
          ? 'Your order summary has been automatically copied. Send it directly via DM on your preferred platform:'
          : 'Please copy the text box below manually and paste it into our message box:'}
      </p>
      
      <textarea readonly class="order-summary-box"></textarea>
      
      <div class="social-links">
        <a href="${SOCIAL_LINKS.facebook}" target="_blank" rel="noopener" class="social-btn fb">Facebook Messenger</a>
        <a href="${SOCIAL_LINKS.instagram}" target="_blank" rel="noopener" class="social-btn ig">Instagram DM</a>
        <a href="${SOCIAL_LINKS.reddit}" target="_blank" rel="noopener" class="social-btn rd">Reddit Chat</a>
      </div>

      <button class="close-modal-btn" onclick="closeCheckoutModal()">Close & Clear Cart</button>
    </div>
  `;

  document.body.appendChild(modal);
  
  const textarea = modal.querySelector('.order-summary-box');
  if (textarea) {
    textarea.value = orderSummary;
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.remove();
  clearCart();
}

// ==========================================
// 9. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchProducts();
  updateCartUI();
});