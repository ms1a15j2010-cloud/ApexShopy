/* =====================================
   STORE CONFIGURATION
===================================== */
// ⚠️ Replace these with your actual usernames/links
const SOCIAL_LINKS = {
    facebook: "https://www.facebook.com/share/p/19WQNXqUhe/",             // Your Facebook Messenger Link
    instagram: "https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=10s3kk6s",         // Your Instagram Direct Link
    reddit: "https://www.reddit.com/user/apexshopy" // Your Reddit Profile Link
};

/* =====================================
   PROFESSIONAL PRODUCT DATABASE (30 ITEMS)
===================================== */
const products = [
    // --- Electronics ---
    {
        id: 1,
        name: "Pro Wireless Earbuds",
        category: "Electronics",
        price: 45.99,
        originalPrice: 79.99,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Noise Cancelling Headphones",
        category: "Electronics",
        price: 120.00,
        originalPrice: 150.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Portable Bluetooth Speaker",
        category: "Electronics",
        price: 39.99,
        originalPrice: 59.99,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "4K Action Camera",
        category: "Electronics",
        price: 199.99,
        originalPrice: 249.99,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "10000mAh Power Bank",
        category: "Electronics",
        price: 29.50,
        originalPrice: 45.00,
        rating: "⭐⭐⭐⭐",
        image: "https://www.space.ae/web/image/product.image/10318/image_1920/IP155D-8.jpg?unique=aec467e"
    },
    {
        id: 6,
        name: "Ultra-Wide Gaming Monitor",
        category: "Electronics",
        price: 349.00,
        originalPrice: 450.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://homeandliving.net.au/cdn/shop/products/V360-EPFM5003-BK-34-MP10-00.jpg?v=1674265691"
    },

    // --- Wearables ---
    {
        id: 7,
        name: "Minimalist Smartwatch",
        category: "Wearables",
        price: 89.00,
        originalPrice: 120.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 8,
        name: "Fitness Tracker Band",
        category: "Wearables",
        price: 35.00,
        originalPrice: 50.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 9,
        name: "Advanced GPS Running Watch",
        category: "Wearables",
        price: 210.00,
        originalPrice: 250.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 10,
        name: "Smart Ring Heart Monitor",
        category: "Wearables",
        price: 150.00,
        originalPrice: 180.00,
        rating: "⭐⭐⭐⭐",
        image: "https://image.made-in-china.com/2f0j00qOcbHNpRhzoT/Wearable-Fitness-Ring-Smart-Health-Heart-Rate-Tracker-Sport-Tracker-Smartring-Ultrahuman-Sleep-Monitor-Oura-Ring.webp"
    },
    {
        id: 11,
        name: "VR Headset Standard Edition",
        category: "Wearables",
        price: 299.00,
        originalPrice: 350.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 12,
        name: "Blue Light Blocking Glasses",
        category: "Wearables",
        price: 24.99,
        originalPrice: 35.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
    },

    // --- Accessories ---
    {
        id: 13,
        name: "Mechanical Keyboard",
        category: "Accessories",
        price: 65.50,
        originalPrice: 90.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 14,
        name: "Ergonomic Mouse",
        category: "Accessories",
        price: 25.00,
        originalPrice: 40.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 15,
        name: "Adjustable Laptop Stand",
        category: "Accessories",
        price: 32.00,
        originalPrice: 45.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1629317480826-910f729d1709?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 16,
        name: "7-in-1 USB-C Hub",
        category: "Accessories",
        price: 28.99,
        originalPrice: 40.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1616578273461-3a99ce422de6?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 17,
        name: "Extra Large Mouse Pad",
        category: "Accessories",
        price: 15.99,
        originalPrice: 25.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 18,
        name: "Cable Management Kit",
        category: "Accessories",
        price: 18.50,
        originalPrice: 22.00,
        rating: "⭐⭐⭐⭐",
        image: "https://www.alternate.de/p/600x600/0/4/Sharkoon_OfficePal_Cable_Organizer__Kabelmanagement%40%40100105240.jpg"
    },

    // --- Sports & Outdoors ---
    {
        id: 19,
        name: "Pro Yoga Mat",
        category: "Sports & Outdoors",
        price: 29.00,
        originalPrice: 40.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 20,
        name: "Adjustable Dumbbell Set",
        category: "Sports & Outdoors",
        price: 110.00,
        originalPrice: 160.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 21,
        name: "Resistance Bands Set",
        category: "Sports & Outdoors",
        price: 19.99,
        originalPrice: 30.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 22,
        name: "Smart Jump Rope",
        category: "Sports & Outdoors",
        price: 24.50,
        originalPrice: 35.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 23,
        name: "Hydration Running Belt",
        category: "Sports & Outdoors",
        price: 22.00,
        originalPrice: 28.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 24,
        name: "Compression Sleeves",
        category: "Sports & Outdoors",
        price: 14.99,
        originalPrice: 20.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=600&q=80"
    },

    // --- Smart Home ---
    {
        id: 25,
        name: "Wi-Fi Smart Bulb (2-Pack)",
        category: "Smart Home",
        price: 25.99,
        originalPrice: 35.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 26,
        name: "Indoor Security Camera",
        category: "Smart Home",
        price: 45.00,
        originalPrice: 60.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 27,
        name: "Smart Plug (4-Pack)",
        category: "Smart Home",
        price: 30.00,
        originalPrice: 45.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 28,
        name: "Video Doorbell Pro",
        category: "Smart Home",
        price: 129.99,
        originalPrice: 180.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 29,
        name: "Smart Thermostat",
        category: "Smart Home",
        price: 199.00,
        originalPrice: 249.00,
        rating: "⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1565608087341-404b25492fee?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 30,
        name: "Robot Vacuum Cleaner",
        category: "Smart Home",
        price: 220.00,
        originalPrice: 300.00,
        rating: "⭐⭐⭐⭐⭐",
        image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80"
    }
];

let cart = [];
let currentCategory = 'All';

/* =====================================
   INITIALIZATION & RENDERING
===================================== */
function init() {
    renderProducts();
    renderFooter();
}

function renderProducts(searchTerm = "") {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = "";

    const filteredProducts = products.filter(product => {
        const matchesCategory = currentCategory === 'All' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if(filteredProducts.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 20px;'>No products found.</p>";
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="card-info">
                <h3 class="card-title">${product.name}</h3>
                <div class="rating">${product.rating}</div>
                <div class="price-container">
                    <span class="sale-price">$${product.price.toFixed(2)}</span>
                    <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                </div>
                <button class="add-btn" onclick="addToCart(${product.id}, event)">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* =====================================
   DYNAMIC FOOTER RENDERER
===================================== */
function renderFooter() {
    let footer = document.querySelector('footer');
    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
    
    footer.className = 'store-footer';
    footer.innerHTML = `
        <div style="background: #101f4d; color: white; text-align: center; padding: 25px 15px; margin-top: 50px;">
            <p style="margin: 0 0 10px 0; font-weight: 500;">© 2026 ApexShopy. All rights reserved.</p>
            <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                ${SOCIAL_LINKS.facebook ? `<a href="${SOCIAL_LINKS.facebook}" target="_blank" rel="noopener noreferrer" style="color: #4267B2; background: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Facebook</a>` : ''}
                ${SOCIAL_LINKS.instagram ? `<a href="${SOCIAL_LINKS.instagram}" target="_blank" rel="noopener noreferrer" style="color: #E1306C; background: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Instagram</a>` : ''}
                ${SOCIAL_LINKS.reddit ? `<a href="${SOCIAL_LINKS.reddit}" target="_blank" rel="noopener noreferrer" style="color: #FF4500; background: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Reddit</a>` : ''}
            </div>
        </div>
    `;
}

/* =====================================
   FILTERING & SEARCH
===================================== */
function filterCategory(category, evt) {
    currentCategory = category;
    
    // Update active button styling
    const buttons = document.querySelectorAll('.categories button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (evt && evt.target) {
        evt.target.classList.add('active');
    }

    const searchInput = document.getElementById('searchInput');
    const searchVal = searchInput ? searchInput.value : "";
    renderProducts(searchVal);
}

function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchVal = searchInput ? searchInput.value : "";
    renderProducts(searchVal);
}

/* =====================================
   CART FUNCTIONALITY
===================================== */
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (!sidebar || !overlay) return;
    
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
    } else {
        sidebar.classList.add('open');
        overlay.style.display = 'block';
    }
}

function addToCart(id, evt) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    
    // Quick visual feedback
    if (evt && evt.target) {
        const btn = evt.target;
        btn.innerText = "Added ✓";
        btn.style.background = "#25D366";
        setTimeout(() => {
            btn.innerText = "Add to Cart";
            btn.style.background = "#101f4d";
        }, 1000);
    }
}

function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    updateCartUI();
}

function updateCartUI() {
    const badge = document.getElementById('cartCount');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    if (badge) badge.innerText = count;

    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = "";
    let totalAmount = 0;

    cart.forEach(item => {
        totalAmount += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            <div class="cart-item-details" style="flex-grow: 1; padding-left: 10px;">
                <div style="font-weight:bold;">${item.name}</div>
                <div>$${item.price.toFixed(2)} x ${item.quantity}</div>
                <div class="cart-controls" style="margin-top: 5px;">
                    <button onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span style="margin: 0 8px;">${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p style='padding: 10px;'>Your cart is empty.</p>";
    }

    const totalDisplay = document.getElementById('cartTotalAmount');
    if (totalDisplay) totalDisplay.innerText = "$" + totalAmount.toFixed(2);
}

/* =====================================
   MULTI-PLATFORM CHECKOUT GENERATOR
===================================== */
function checkoutMultiPlatform() {
    if (cart.length === 0) {
        alert("Your cart is empty! Please add products before checking out.");
        return;
    }

    let message = "🛍️ *New Order from ApexShopy* 🛍️\n\n";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `▪️ ${item.quantity}x ${item.name} - $${itemTotal.toFixed(2)}\n`;
    });

    message += `\n*Total Amount:* $${total.toFixed(2)}\n\n`;
    message += "Please confirm my order and let me know the payment/delivery details.";

    navigator.clipboard.writeText(message).catch(err => console.log("Clipboard fallback needed", err));

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';
    overlay.id = 'socialCheckoutOverlay';

    overlay.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; max-width: 350px; width: 90%; font-family: sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
            <h2 style="margin-top: 0; color: #333;">Complete Your Order</h2>
            <div style="background: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">
                ✅ Order details copied to clipboard!
            </div>
            <p style="color: #555; font-size: 14px; margin-bottom: 20px;">
                Choose where you want to send us your order. Once the app opens, simply <strong>paste</strong> the message into the chat.
            </p>
            
            ${SOCIAL_LINKS.facebook ? `
            <a href="${SOCIAL_LINKS.facebook}" target="_blank" onclick="closeSocialMenu()" style="display: block; background: #1877F2; color: white; padding: 14px; margin: 10px 0; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Send via Facebook
            </a>` : ''}
            
            ${SOCIAL_LINKS.instagram ? `
            <a href="${SOCIAL_LINKS.instagram}" target="_blank" onclick="closeSocialMenu()" style="display: block; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white; padding: 14px; margin: 10px 0; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Send via Instagram
            </a>` : ''}

            ${SOCIAL_LINKS.reddit ? `
            <a href="${SOCIAL_LINKS.reddit}" target="_blank" onclick="closeSocialMenu()" style="display: block; background: #FF4500; color: white; padding: 14px; margin: 10px 0; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Send via Reddit
            </a>` : ''}

            <button onclick="closeSocialMenu()" style="margin-top: 15px; padding: 10px 20px; border: none; background: #f1f1f1; color: #333; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">
                Cancel
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
}

function closeSocialMenu() {
    const overlay = document.getElementById('socialCheckoutOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Start the application
window.onload = init;