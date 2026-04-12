/**
 * Tests for js/cart.js
 *
 * cart.js depends on getProductById from products.js, so we load products.js
 * first. Scripts are loaded once at module scope via global.eval (indirect eval
 * places function declarations in the global scope). Between tests we clear
 * jsdom's built-in localStorage and reset the DOM.
 */

const fs = require('fs');
const path = require('path');

const productsSource = fs.readFileSync(
  path.resolve(__dirname, '../js/products.js'),
  'utf8'
);
const cartSource = fs.readFileSync(
  path.resolve(__dirname, '../js/cart.js'),
  'utf8'
);

// Load once — function declarations go into the jsdom global scope.
// Using global.eval (indirect eval) so they are accessible as globals.
global.eval(productsSource);
global.eval(cartSource);

// Minimal cart-page DOM used by most tests
const CART_PAGE_HTML = `
  <div id="cart-items"></div>
  <div id="cart-empty"></div>
  <div id="checkout-section"></div>
  <span id="summary-subtotal"></span>
  <span id="summary-shipping"></span>
  <span id="summary-tax"></span>
  <span id="summary-total"></span>
  <span id="summary-items"></span>
  <span class="cart-badge"></span>
`;

beforeEach(() => {
  // Reset jsdom's built-in localStorage
  localStorage.clear();
  // Reset DOM
  document.body.innerHTML = CART_PAGE_HTML;
});

// ─── loadCart / saveCart ───────────────────────────────────────────────────────

describe('loadCart', () => {
  test('returns empty array when localStorage is empty', () => {
    expect(loadCart()).toEqual([]);
  });

  test('returns parsed cart from localStorage', () => {
    const cart = [{ id: 'pc-001', qty: 1, price: 100, name: 'X', icon: '🖥️', type: 'pc' }];
    localStorage.setItem('cyberforge_cart', JSON.stringify(cart));
    expect(loadCart()).toEqual(cart);
  });

  test('returns empty array on malformed JSON', () => {
    localStorage.setItem('cyberforge_cart', 'not-json');
    expect(loadCart()).toEqual([]);
  });
});

describe('saveCart', () => {
  test('persists cart to localStorage', () => {
    const cart = [{ id: 'pc-001', qty: 2, price: 200, name: 'X', icon: '🖥️', type: 'pc' }];
    saveCart(cart);
    expect(JSON.parse(localStorage.getItem('cyberforge_cart'))).toEqual(cart);
  });

  test('updates cart badge after save', () => {
    const cart = [{ id: 'pc-001', qty: 3, price: 200, name: 'X', icon: '🖥️', type: 'pc' }];
    saveCart(cart);
    expect(document.querySelector('.cart-badge').textContent).toBe('3');
  });
});

// ─── addToCart ─────────────────────────────────────────────────────────────────

describe('addToCart', () => {
  test('adds a new product to an empty cart', () => {
    addToCart('pc-001', null);
    const cart = loadCart();
    expect(cart.length).toBe(1);
    expect(cart[0].id).toBe('pc-001');
    expect(cart[0].qty).toBe(1);
  });

  test('increments qty when product already in cart', () => {
    addToCart('pc-001', null);
    addToCart('pc-001', null);
    const cart = loadCart();
    expect(cart.length).toBe(1);
    expect(cart[0].qty).toBe(2);
  });

  test('adds distinct products as separate entries', () => {
    addToCart('pc-001', null);
    addToCart('pc-002', null);
    expect(loadCart().length).toBe(2);
  });

  test('stores correct price from product data', () => {
    addToCart('pc-001', null);
    expect(loadCart()[0].price).toBe(2499);
  });

  test('stores product name', () => {
    addToCart('pc-001', null);
    expect(loadCart()[0].name).toBe('Titan Pro X');
  });

  test('does nothing for unknown product id', () => {
    addToCart('pc-999', null);
    expect(loadCart().length).toBe(0);
  });

  test('calls event.preventDefault when event is provided', () => {
    const event = { preventDefault: jest.fn() };
    addToCart('pc-001', event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  test('works without an event argument', () => {
    expect(() => addToCart('pc-001', null)).not.toThrow();
  });
});

// ─── removeFromCart ────────────────────────────────────────────────────────────

describe('removeFromCart', () => {
  test('removes item with matching id', () => {
    addToCart('pc-001', null);
    addToCart('pc-002', null);
    removeFromCart('pc-001');
    const cart = loadCart();
    expect(cart.find(i => i.id === 'pc-001')).toBeUndefined();
    expect(cart.length).toBe(1);
  });

  test('does nothing when id not in cart', () => {
    addToCart('pc-001', null);
    removeFromCart('pc-999');
    expect(loadCart().length).toBe(1);
  });

  test('leaves cart empty when last item removed', () => {
    addToCart('pc-001', null);
    removeFromCart('pc-001');
    expect(loadCart()).toEqual([]);
  });
});

// ─── updateCartQty ─────────────────────────────────────────────────────────────

describe('updateCartQty', () => {
  beforeEach(() => {
    addToCart('pc-001', null);
  });

  test('updates qty to specified value', () => {
    updateCartQty('pc-001', 5);
    expect(loadCart()[0].qty).toBe(5);
  });

  test('removes item when qty is set to 0', () => {
    updateCartQty('pc-001', 0);
    expect(loadCart().length).toBe(0);
  });

  test('removes item when qty is negative', () => {
    updateCartQty('pc-001', -1);
    expect(loadCart().length).toBe(0);
  });

  test('handles string qty input (converts to int)', () => {
    updateCartQty('pc-001', '3');
    expect(loadCart()[0].qty).toBe(3);
  });

  test('does nothing when product id not found', () => {
    updateCartQty('pc-999', 5);
    expect(loadCart()[0].qty).toBe(1); // original qty unchanged
  });
});

// ─── getCartTotals ─────────────────────────────────────────────────────────────

describe('getCartTotals', () => {
  test('returns all-zero totals for empty cart', () => {
    const t = getCartTotals();
    expect(t.subtotal).toBe(0);
    expect(t.shipping).toBe(0);
    expect(t.tax).toBe(0);
    expect(t.total).toBe(0);
    expect(t.itemCount).toBe(0);
  });

  test('calculates subtotal correctly', () => {
    addToCart('pc-003', null); // price 799, qty 1
    const { subtotal } = getCartTotals();
    expect(subtotal).toBe(799);
  });

  test('applies $29.99 shipping for orders under $1500', () => {
    addToCart('pc-003', null); // $799
    expect(getCartTotals().shipping).toBe(29.99);
  });

  test('applies free shipping for orders over $1500', () => {
    addToCart('pc-001', null); // $2499
    expect(getCartTotals().shipping).toBe(0);
  });

  test('applies free shipping for subtotal above $1500', () => {
    localStorage.setItem('cyberforge_cart', JSON.stringify([
      { id: 'x', qty: 1, price: 1501, name: 'X', icon: '🖥️', type: 'pc' }
    ]));
    expect(getCartTotals().shipping).toBe(0);
  });

  test('charges shipping for subtotal exactly $1500', () => {
    localStorage.setItem('cyberforge_cart', JSON.stringify([
      { id: 'x', qty: 1, price: 1500, name: 'X', icon: '🖥️', type: 'pc' }
    ]));
    expect(getCartTotals().shipping).toBe(29.99);
  });

  test('calculates tax at 8%', () => {
    addToCart('pc-003', null); // $799
    const { tax, subtotal } = getCartTotals();
    expect(tax).toBeCloseTo(subtotal * 0.08, 5);
  });

  test('total equals subtotal + shipping + tax', () => {
    addToCart('pc-003', null);
    const { subtotal, shipping, tax, total } = getCartTotals();
    expect(total).toBeCloseTo(subtotal + shipping + tax, 5);
  });

  test('itemCount is sum of all item quantities', () => {
    addToCart('pc-001', null);
    addToCart('pc-001', null); // qty 2
    addToCart('pc-002', null); // qty 1
    expect(getCartTotals().itemCount).toBe(3);
  });
});

// ─── updateCartBadge ───────────────────────────────────────────────────────────

describe('updateCartBadge', () => {
  test('hides badge when cart is empty', () => {
    updateCartBadge();
    expect(document.querySelector('.cart-badge').style.display).toBe('none');
  });

  test('shows badge when cart has items', () => {
    addToCart('pc-001', null);
    updateCartBadge();
    expect(document.querySelector('.cart-badge').style.display).toBe('inline-flex');
  });

  test('shows correct item count on badge', () => {
    addToCart('pc-001', null);
    addToCart('pc-001', null); // qty 2
    updateCartBadge();
    expect(document.querySelector('.cart-badge').textContent).toBe('2');
  });
});

// ─── showToast ─────────────────────────────────────────────────────────────────

describe('showToast', () => {
  test('creates a toast element if none exists', () => {
    showToast('Title', 'Subtitle');
    expect(document.getElementById('toast')).not.toBeNull();
  });

  test('sets toast title text', () => {
    showToast('Hello', 'World');
    const toast = document.getElementById('toast');
    expect(toast.querySelector('strong').textContent).toBe('Hello');
  });

  test('sets toast subtitle text', () => {
    showToast('Hello', 'World');
    const toast = document.getElementById('toast');
    expect(toast.querySelector('span').textContent).toBe('World');
  });

  test('adds "show" class to toast', () => {
    showToast('Hello', 'World');
    expect(document.getElementById('toast').classList.contains('show')).toBe(true);
  });

  test('reuses existing toast element on second call', () => {
    showToast('First', 'A');
    showToast('Second', 'B');
    expect(document.querySelectorAll('#toast').length).toBe(1);
    expect(document.getElementById('toast').querySelector('strong').textContent).toBe('Second');
  });
});

// ─── renderCartPage ────────────────────────────────────────────────────────────

describe('renderCartPage', () => {
  test('shows empty container when cart is empty', () => {
    renderCartPage();
    expect(document.getElementById('cart-empty').style.display).toBe('flex');
  });

  test('hides items container when cart is empty', () => {
    renderCartPage();
    expect(document.getElementById('cart-items').style.display).toBe('none');
  });

  test('dims checkout section when cart is empty', () => {
    renderCartPage();
    expect(document.getElementById('checkout-section').style.opacity).toBe('0.5');
  });

  test('shows items container when cart has items', () => {
    addToCart('pc-001', null);
    renderCartPage();
    expect(document.getElementById('cart-items').style.display).toBe('flex');
  });

  test('hides empty container when cart has items', () => {
    addToCart('pc-001', null);
    renderCartPage();
    expect(document.getElementById('cart-empty').style.display).toBe('none');
  });

  test('enables checkout section when cart has items', () => {
    addToCart('pc-001', null);
    renderCartPage();
    expect(document.getElementById('checkout-section').style.opacity).toBe('1');
  });

  test('renders product name in cart HTML', () => {
    addToCart('pc-001', null);
    renderCartPage();
    expect(document.getElementById('cart-items').innerHTML).toContain('Titan Pro X');
  });

  test('updates summary subtotal element', () => {
    addToCart('pc-003', null); // $799
    renderCartPage();
    expect(document.getElementById('summary-subtotal').textContent).toContain('799');
  });

  test('shows FREE shipping for large orders', () => {
    addToCart('pc-001', null); // $2499
    renderCartPage();
    expect(document.getElementById('summary-shipping').textContent).toBe('FREE');
  });

  test('shows numeric shipping for small orders', () => {
    addToCart('pc-003', null); // $799
    renderCartPage();
    expect(document.getElementById('summary-shipping').textContent).toContain('29.99');
  });

  test('updates summary item count (singular)', () => {
    addToCart('pc-001', null);
    renderCartPage();
    expect(document.getElementById('summary-items').textContent).toBe('1 item');
  });

  test('updates summary item count (plural)', () => {
    addToCart('pc-001', null);
    addToCart('pc-001', null); // qty 2
    renderCartPage();
    expect(document.getElementById('summary-items').textContent).toBe('2 items');
  });

  test('does nothing when cart-items element does not exist', () => {
    document.body.innerHTML = '';
    expect(() => renderCartPage()).not.toThrow();
  });
});
