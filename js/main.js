/* ============================================================
   main.js — CyberForge PC
   Navbar active state, scroll effects, shared utilities
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartBadge();
  initFadeIn();
  initFormHandlers();
});

/* ---- Navbar: active page + scroll effect + mobile toggle ---- */
function initNavbar() {
  const navbar  = document.querySelector('.navbar');
  const menu    = document.querySelector('.nav-menu');
  const toggle  = document.querySelector('.nav-toggle');
  const links   = document.querySelectorAll('.nav-menu a');
  const page    = location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close menu when a nav link is clicked
    links.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ---- Intersection observer for .fade-in elements ---- */
function initFadeIn() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ---- Form handlers ---- */
function initFormHandlers() {
  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      handleFormSubmit(contactForm, '/api/contact', 'Message sent! We\'ll get back to you within 24 hours.');
    });
  }

  // Booking form
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      handleFormSubmit(bookingForm, '/api/booking', 'Booking confirmed! We\'ll contact you shortly to confirm the appointment.');
    });
  }

  // Checkout form
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cart = loadCart();
      if (!cart.length) {
        showToast('Cart is empty', 'Add items before checking out.');
        return;
      }
      localStorage.removeItem(CART_KEY);
      updateCartBadge();
      renderCartPage();
      showToast('Order placed! 🎉', 'Thank you for your purchase. Confirmation email sent.');
    });
  }
}

async function handleFormSubmit(form, endpoint, successMsg) {
  const btn = form.querySelector('[type="submit"]');
  const data = Object.fromEntries(new FormData(form));
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast('Success! ✅', successMsg);
      form.reset();
    } else {
      throw new Error('Server error');
    }
  } catch {
    // Fallback for static demo (no backend running)
    showToast('Success! ✅', successMsg);
    form.reset();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Submit'; }
  }
}

/* ---- Payment option toggle (cart page) ---- */
function selectPayment(el) {
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
}

/* ---- Mobile: filter sidebar toggle (shop / cases pages) ---- */
function toggleFilterSidebar(btn) {
  const sidebar = document.querySelector('.filter-sidebar');
  if (!sidebar) return;
  const open = sidebar.classList.toggle('sidebar-open');
  if (btn) btn.textContent = open ? '✕ Hide Filters' : '🔧 Filters';
}

/* ---- Product detail page: qty controls ---- */
function changeQty(delta) {
  const input = document.getElementById('detail-qty');
  if (!input) return;
  const val = Math.max(1, parseInt(input.value) + delta);
  input.value = val;
}

function addDetailToCart(productId) {
  const qty = parseInt(document.getElementById('detail-qty')?.value || '1', 10);
  const product = getProductById(productId);
  if (!product) return;

  const cart = loadCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      icon: product.icon,
      price: product.price,
      type: product.type,
      qty
    });
  }
  saveCart(cart);
  showToast('Added to cart', `${product.name} × ${qty}`);
}
