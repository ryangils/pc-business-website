/* ============================================================
   cart.js — CyberForge PC
   Shopping cart stored in localStorage
   ============================================================ */

const CART_KEY = 'cyberforge_cart';

/* ---- Load / Save ---- */
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/* ---- Add to cart ---- */
function addToCart(productId, event) {
  if (event) event.preventDefault();
  const product = getProductById(productId);
  if (!product) return;

  const cart = loadCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      icon: product.icon,
      price: product.price,
      type: product.type,
      qty: 1
    });
  }
  saveCart(cart);
  showToast('Added to cart', `${product.name} — $${product.price.toLocaleString()}`);
}

/* ---- Remove from cart ---- */
function removeFromCart(productId) {
  let cart = loadCart().filter(item => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}

/* ---- Update quantity ---- */
function updateCartQty(productId, newQty) {
  const qty = parseInt(newQty, 10);
  let cart = loadCart();
  if (qty < 1) {
    cart = cart.filter(item => item.id !== productId);
  } else {
    const item = cart.find(i => i.id === productId);
    if (item) item.qty = qty;
  }
  saveCart(cart);
  renderCartPage();
}

/* ---- Cart totals ---- */
function getCartTotals() {
  const cart = loadCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal === 0 ? 0 : subtotal > 1500 ? 0 : 29.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total, itemCount: cart.reduce((s, i) => s + i.qty, 0) };
}

/* ---- Cart badge in navbar ---- */
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const { itemCount } = getCartTotals();
  badges.forEach(b => {
    b.textContent = itemCount;
    b.style.display = itemCount === 0 ? 'none' : 'inline-flex';
  });
}

/* ---- Toast notification ---- */
function showToast(title, subtitle) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✅</span><div class="toast-text"><strong></strong><span></span></div>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('strong').textContent = title;
  toast.querySelector('span').textContent = subtitle;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---- Render cart page ---- */
function renderCartPage() {
  const itemsContainer = document.getElementById('cart-items');
  const emptyContainer = document.getElementById('cart-empty');
  const checkoutForm   = document.getElementById('checkout-section');
  if (!itemsContainer) return;

  const cart = loadCart();
  const totals = getCartTotals();

  if (cart.length === 0) {
    itemsContainer.style.display = 'none';
    if (emptyContainer) emptyContainer.style.display = 'flex';
    if (checkoutForm) checkoutForm.style.opacity = '0.5';
  } else {
    itemsContainer.style.display = 'flex';
    if (emptyContainer) emptyContainer.style.display = 'none';
    if (checkoutForm) checkoutForm.style.opacity = '1';

    itemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.icon}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-detail">${item.type === 'pc' ? 'Custom PC' : 'PC Case'} · $${item.price.toLocaleString()} each</div>
        </div>
        <div class="cart-item-controls">
          <div class="cart-item-price">$${(item.price * item.qty).toLocaleString()}</div>
          <div class="qty-control">
            <button class="qty-btn" onclick="updateCartQty('${item.id}', ${item.qty - 1})">−</button>
            <input class="qty-input" type="number" value="${item.qty}" min="0"
              onchange="updateCartQty('${item.id}', this.value)" />
            <button class="qty-btn" onclick="updateCartQty('${item.id}', ${item.qty + 1})">+</button>
          </div>
          <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');
  }

  // Update summary
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('summary-subtotal', '$' + totals.subtotal.toLocaleString('en', {minimumFractionDigits: 2}));
  setEl('summary-shipping', totals.shipping === 0 ? 'FREE' : '$' + totals.shipping.toFixed(2));
  setEl('summary-tax',      '$' + totals.tax.toFixed(2));
  setEl('summary-total',    '$' + totals.total.toFixed(2));
  setEl('summary-items',    totals.itemCount + ' item' + (totals.itemCount !== 1 ? 's' : ''));
}
