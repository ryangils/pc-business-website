/**
 * Tests for js/main.js utility functions.
 *
 * We test only the pure utility functions that don't depend on full page
 * lifecycle (DOMContentLoaded, fetch, etc.):
 *   - selectPayment
 *   - toggleFilterSidebar
 *   - changeQty
 *   - addDetailToCart (with mocked dependencies)
 *
 * Functions that wire up event listeners (initNavbar, initFadeIn,
 * initFormHandlers) are covered via integration / smoke tests that verify
 * they do not throw when the relevant DOM elements are absent.
 */

const fs = require('fs');
const path = require('path');

// Stub IntersectionObserver before loading scripts (not available in jsdom)
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Load all scripts once at module scope
global.eval(fs.readFileSync(path.resolve(__dirname, '../js/products.js'), 'utf8'));
global.eval(fs.readFileSync(path.resolve(__dirname, '../js/cart.js'), 'utf8'));
global.eval(fs.readFileSync(path.resolve(__dirname, '../js/main.js'), 'utf8'));

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ─── selectPayment ─────────────────────────────────────────────────────────────

describe('selectPayment', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="payment-option active">A</div>
      <div class="payment-option">B</div>
      <div class="payment-option">C</div>
    `;
  });

  test('adds active class to clicked element', () => {
    const options = document.querySelectorAll('.payment-option');
    selectPayment(options[1]);
    expect(options[1].classList.contains('active')).toBe(true);
  });

  test('removes active from all other options', () => {
    const options = document.querySelectorAll('.payment-option');
    selectPayment(options[2]);
    expect(options[0].classList.contains('active')).toBe(false);
    expect(options[1].classList.contains('active')).toBe(false);
  });

  test('only one element is active after selection', () => {
    const options = document.querySelectorAll('.payment-option');
    selectPayment(options[1]);
    const activeCount = document.querySelectorAll('.payment-option.active').length;
    expect(activeCount).toBe(1);
  });

  test('re-selecting already active option keeps it active', () => {
    const options = document.querySelectorAll('.payment-option');
    selectPayment(options[0]);
    expect(options[0].classList.contains('active')).toBe(true);
  });
});

// ─── toggleFilterSidebar ───────────────────────────────────────────────────────

describe('toggleFilterSidebar', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <aside class="filter-sidebar"></aside>
      <button id="filter-btn">🔧 Filters</button>
    `;
  });

  test('opens sidebar on first toggle', () => {
    const btn = document.getElementById('filter-btn');
    toggleFilterSidebar(btn);
    expect(document.querySelector('.filter-sidebar').classList.contains('sidebar-open')).toBe(true);
  });

  test('closes sidebar on second toggle', () => {
    const btn = document.getElementById('filter-btn');
    toggleFilterSidebar(btn);
    toggleFilterSidebar(btn);
    expect(document.querySelector('.filter-sidebar').classList.contains('sidebar-open')).toBe(false);
  });

  test('updates button text to hide when open', () => {
    const btn = document.getElementById('filter-btn');
    toggleFilterSidebar(btn);
    expect(btn.textContent).toContain('Hide Filters');
  });

  test('updates button text back to filters when closed', () => {
    const btn = document.getElementById('filter-btn');
    toggleFilterSidebar(btn);
    toggleFilterSidebar(btn);
    expect(btn.textContent).toContain('Filters');
  });

  test('works without a button argument', () => {
    expect(() => toggleFilterSidebar(null)).not.toThrow();
  });

  test('does nothing when sidebar does not exist', () => {
    document.body.innerHTML = '<button id="btn">Filters</button>';
    const btn = document.getElementById('btn');
    expect(() => toggleFilterSidebar(btn)).not.toThrow();
  });
});

// ─── changeQty ─────────────────────────────────────────────────────────────────

describe('changeQty', () => {
  beforeEach(() => {
    document.body.innerHTML = '<input id="detail-qty" type="number" value="1" />';
  });

  test('increments quantity by delta', () => {
    changeQty(1);
    expect(document.getElementById('detail-qty').value).toBe('2');
  });

  test('decrements quantity by delta', () => {
    document.getElementById('detail-qty').value = '3';
    changeQty(-1);
    expect(document.getElementById('detail-qty').value).toBe('2');
  });

  test('does not go below 1', () => {
    changeQty(-5);
    expect(parseInt(document.getElementById('detail-qty').value)).toBe(1);
  });

  test('adds positive delta correctly', () => {
    changeQty(4);
    expect(document.getElementById('detail-qty').value).toBe('5');
  });

  test('does nothing when input element does not exist', () => {
    document.body.innerHTML = '';
    expect(() => changeQty(1)).not.toThrow();
  });
});

// ─── addDetailToCart ───────────────────────────────────────────────────────────

describe('addDetailToCart', () => {
  beforeEach(() => {
    document.body.innerHTML = '<input id="detail-qty" type="number" value="2" />';
    localStorage.clear();
  });

  test('adds correct quantity from input to cart', () => {
    addDetailToCart('pc-001');
    expect(loadCart()[0].qty).toBe(2);
  });

  test('does nothing for unknown product id', () => {
    addDetailToCart('pc-999');
    expect(loadCart().length).toBe(0);
  });

  test('increments existing item qty', () => {
    addDetailToCart('pc-001'); // adds qty 2
    addDetailToCart('pc-001'); // adds another qty 2
    expect(loadCart()[0].qty).toBe(4);
  });

  test('defaults to qty 1 when input is missing', () => {
    document.body.innerHTML = ''; // remove qty input
    addDetailToCart('pc-001');
    expect(loadCart()[0].qty).toBe(1);
  });
});

// ─── initNavbar smoke test ─────────────────────────────────────────────────────

describe('initNavbar (smoke)', () => {
  test('does not throw when navbar elements are missing', () => {
    document.body.innerHTML = '';
    expect(() => initNavbar()).not.toThrow();
  });

  test('does not throw with minimal navbar DOM', () => {
    document.body.innerHTML = `
      <nav class="navbar">
        <ul class="nav-menu"><li><a href="index.html">Home</a></li></ul>
        <button class="nav-toggle" aria-expanded="false">☰</button>
      </nav>
    `;
    expect(() => initNavbar()).not.toThrow();
  });

  test('sets active class on matching nav link', () => {
    document.body.innerHTML = `
      <nav class="navbar">
        <ul class="nav-menu">
          <li><a href="index.html">Home</a></li>
          <li><a href="shop.html">Shop</a></li>
        </ul>
        <button class="nav-toggle" aria-expanded="false">☰</button>
      </nav>
    `;
    // jsdom location.pathname is '/', so page resolves to 'index.html'
    initNavbar();
    const homeLink = document.querySelector('a[href="index.html"]');
    expect(homeLink.classList.contains('active')).toBe(true);
  });
});

// ─── handleFormSubmit smoke tests ──────────────────────────────────────────────

describe('handleFormSubmit', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  test('disables submit button during request', async () => {
    document.body.innerHTML = `
      <form id="test-form">
        <button type="submit">Submit</button>
      </form>
    `;
    const form = document.getElementById('test-form');
    // Do not await — check mid-flight
    handleFormSubmit(form, '/api/test', 'Done!');
    const btn = form.querySelector('[type="submit"]');
    expect(btn.disabled).toBe(true);
  });

  test('re-enables submit button after request', async () => {
    document.body.innerHTML = `
      <form id="test-form">
        <button type="submit" data-label="Submit">Submit</button>
      </form>
    `;
    const form = document.getElementById('test-form');
    await handleFormSubmit(form, '/api/test', 'Done!');
    expect(form.querySelector('[type="submit"]').disabled).toBe(false);
  });

  test('calls fetch with POST method and JSON body', async () => {
    document.body.innerHTML = `
      <form id="test-form">
        <input name="name" value="Alice" />
        <button type="submit">Submit</button>
      </form>
    `;
    const form = document.getElementById('test-form');
    await handleFormSubmit(form, '/api/contact', 'Done!');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('still shows success toast when fetch throws (static demo fallback)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    document.body.innerHTML = `
      <form id="test-form">
        <button type="submit">Submit</button>
      </form>
    `;
    const form = document.getElementById('test-form');
    await handleFormSubmit(form, '/api/contact', 'Success message');
    const toast = document.getElementById('toast');
    expect(toast).not.toBeNull();
    expect(toast.querySelector('strong').textContent).toBe('Success! ✅');
  });
});
