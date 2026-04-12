/**
 * Tests for js/products.js
 *
 * The source file uses plain browser globals (no module exports), so we load it
 * once at module scope via global.eval (indirect eval), which places function
 * declarations into the jsdom global scope.
 */

const fs = require('fs');
const path = require('path');

// Load once — function declarations go into the jsdom global scope.
global.eval(
  fs.readFileSync(path.resolve(__dirname, '../js/products.js'), 'utf8')
);

// ─── getProductById ────────────────────────────────────────────────────────────

describe('getProductById', () => {
  test('returns a PC by valid id', () => {
    const p = getProductById('pc-001');
    expect(p).not.toBeNull();
    expect(p.id).toBe('pc-001');
    expect(p.name).toBe('Titan Pro X');
  });

  test('returns a case by valid id', () => {
    const p = getProductById('case-001');
    expect(p).not.toBeNull();
    expect(p.id).toBe('case-001');
    expect(p.name).toBe('Obsidian Tower');
  });

  test('returns null for unknown id', () => {
    expect(getProductById('pc-999')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(getProductById('')).toBeNull();
  });

  test('returns all 6 PCs by id', () => {
    for (let i = 1; i <= 6; i++) {
      expect(getProductById(`pc-00${i}`)).not.toBeNull();
    }
  });

  test('returns all 6 cases by id', () => {
    for (let i = 1; i <= 6; i++) {
      expect(getProductById(`case-00${i}`)).not.toBeNull();
    }
  });
});

// ─── starsHTML ─────────────────────────────────────────────────────────────────

describe('starsHTML', () => {
  test('returns 5 full stars for rating 5', () => {
    expect(starsHTML(5)).toBe('★★★★★');
  });

  test('returns 4 full stars for rating 4', () => {
    expect(starsHTML(4)).toBe('★★★★☆');
  });

  test('includes a half-star for .5 ratings', () => {
    const html = starsHTML(4.5);
    expect(html).toContain('⭐');
  });

  test('4.5 rating: 4 full + 1 half', () => {
    const html = starsHTML(4.5);
    // 4 full stars + half star emoji
    expect(html.match(/★/g).length).toBe(4);
    expect(html).toContain('⭐');
  });

  test('rating 4.9 has no half star (< 0.5 remainder from floor)', () => {
    // floor(4.9)=4, remainder=0.9 >= 0.5 → half star
    const html = starsHTML(4.9);
    expect(html).toContain('⭐');
  });

  test('rating 4.4 has no half star (remainder < 0.5)', () => {
    const html = starsHTML(4.4);
    expect(html).not.toContain('⭐');
  });

  test('returns correct empty stars for rating 3', () => {
    const html = starsHTML(3);
    expect(html.match(/☆/g).length).toBe(2);
  });

  test('rating 0 returns 5 empty stars', () => {
    expect(starsHTML(0)).toBe('☆☆☆☆☆');
  });
});

// ─── filterPCs ─────────────────────────────────────────────────────────────────

describe('filterPCs', () => {
  test('returns all PCs when priceMax is very high and no filters', () => {
    const result = filterPCs(99999, [], []);
    expect(result.length).toBe(6);
  });

  test('filters out PCs above priceMax', () => {
    // Only pc-003 ($799) and pc-002 ($1299) are <= 1300
    const result = filterPCs(1300, [], []);
    expect(result.every(p => p.price <= 1300)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('returns empty array when priceMax is 0', () => {
    expect(filterPCs(0, [], []).length).toBe(0);
  });

  test('filters by single performance tier', () => {
    const result = filterPCs(99999, ['mid'], []);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('pc-003');
  });

  test('filters by multiple performance tiers', () => {
    const result = filterPCs(99999, ['mid', 'high'], []);
    expect(result.every(p => ['mid', 'high'].includes(p.performance))).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('filters by brand', () => {
    const result = filterPCs(99999, [], ['cyberforge']);
    expect(result.every(p => p.brand.toLowerCase() === 'cyberforge')).toBe(true);
  });

  test('returns empty array for non-existent brand', () => {
    expect(filterPCs(99999, [], ['nonexistent']).length).toBe(0);
  });

  test('combines price and performance filters', () => {
    // ultra PCs: pc-001 ($2499), pc-004 ($3499), pc-006 ($1799)
    const result = filterPCs(2500, ['ultra'], []);
    expect(result.every(p => p.price <= 2500 && p.performance === 'ultra')).toBe(true);
  });
});

// ─── filterCases ───────────────────────────────────────────────────────────────

describe('filterCases', () => {
  test('returns all cases when priceMax is very high and no filters', () => {
    expect(filterCases(99999, [], []).length).toBe(6);
  });

  test('filters out cases above priceMax', () => {
    const result = filterCases(100, [], []);
    expect(result.every(c => c.price <= 100)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('filters by form factor', () => {
    const result = filterCases(99999, ['Full Tower'], []);
    expect(result.every(c => c.formFactor === 'Full Tower')).toBe(true);
    expect(result.length).toBe(2); // case-001 and case-006
  });

  test('filters by multiple form factors', () => {
    const result = filterCases(99999, ['Full Tower', 'Mini ITX'], []);
    expect(result.every(c => ['Full Tower', 'Mini ITX'].includes(c.formFactor))).toBe(true);
  });

  test('filters by brand', () => {
    const result = filterCases(99999, [], ['nzxt']);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('case-005');
  });

  test('returns empty array for non-existent form factor', () => {
    expect(filterCases(99999, ['Nano ITX'], []).length).toBe(0);
  });

  test('combines price and form factor filters', () => {
    const result = filterCases(120, ['Mid Tower'], []);
    expect(result.every(c => c.price <= 120 && c.formFactor === 'Mid Tower')).toBe(true);
  });
});

// ─── sortProducts ──────────────────────────────────────────────────────────────

describe('sortProducts', () => {
  const sampleProducts = [
    { id: 'a', name: 'Zebra', price: 300, rating: 4.0 },
    { id: 'b', name: 'Alpha', price: 100, rating: 4.9 },
    { id: 'c', name: 'Mango', price: 200, rating: 3.5 },
  ];

  test('sorts by price ascending', () => {
    const sorted = sortProducts(sampleProducts, 'price-asc');
    expect(sorted.map(p => p.price)).toEqual([100, 200, 300]);
  });

  test('sorts by price descending', () => {
    const sorted = sortProducts(sampleProducts, 'price-desc');
    expect(sorted.map(p => p.price)).toEqual([300, 200, 100]);
  });

  test('sorts by rating descending', () => {
    const sorted = sortProducts(sampleProducts, 'rating');
    expect(sorted[0].rating).toBe(4.9);
    expect(sorted[sorted.length - 1].rating).toBe(3.5);
  });

  test('sorts by name alphabetically', () => {
    const sorted = sortProducts(sampleProducts, 'name');
    expect(sorted.map(p => p.name)).toEqual(['Alpha', 'Mango', 'Zebra']);
  });

  test('returns original order for unknown sort key', () => {
    const sorted = sortProducts(sampleProducts, 'unknown');
    expect(sorted.map(p => p.id)).toEqual(['a', 'b', 'c']);
  });

  test('does not mutate the original array', () => {
    const original = [...sampleProducts];
    sortProducts(sampleProducts, 'price-asc');
    expect(sampleProducts.map(p => p.id)).toEqual(original.map(p => p.id));
  });

  test('handles empty array', () => {
    expect(sortProducts([], 'price-asc')).toEqual([]);
  });

  test('handles single-element array', () => {
    const result = sortProducts([sampleProducts[0]], 'price-asc');
    expect(result.length).toBe(1);
  });
});

// ─── renderProductCard ─────────────────────────────────────────────────────────

describe('renderProductCard', () => {
  test('includes product name', () => {
    const html = renderProductCard(getProductById('pc-001'));
    expect(html).toContain('Titan Pro X');
  });

  test('includes product price', () => {
    const html = renderProductCard(getProductById('pc-001'));
    expect(html).toContain('2,499');
  });

  test('includes badge when product has one', () => {
    const html = renderProductCard(getProductById('pc-001'));
    expect(html).toContain('HOT');
  });

  test('does not include badge element when badge is null', () => {
    const html = renderProductCard(getProductById('pc-005')); // pc-005 has no badge
    expect(html).not.toContain('product-badge');
  });

  test('includes old price when set', () => {
    const html = renderProductCard(getProductById('pc-001')); // pc-001 has oldPrice 2899
    expect(html).toContain('2,899');
  });

  test('does not include old price when null', () => {
    const html = renderProductCard(getProductById('pc-002')); // pc-002 has no oldPrice
    expect(html).not.toContain('price-old');
  });

  test('includes product id as data attribute', () => {
    const html = renderProductCard(getProductById('pc-001'));
    expect(html).toContain('data-product-id="pc-001"');
  });

  test('includes add to cart button', () => {
    const html = renderProductCard(getProductById('pc-001'));
    expect(html).toContain('addToCart');
  });

  test('includes details link', () => {
    const html = renderProductCard(getProductById('pc-001'));
    expect(html).toContain('product-detail.html?id=pc-001');
  });

  test('includes icon', () => {
    const product = getProductById('pc-001');
    const html = renderProductCard(product);
    expect(html).toContain(product.icon);
  });
});

// ─── renderProductGrid ──────────────────────────────────────────────────────────

describe('renderProductGrid', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="grid"></div>';
  });

  test('renders product cards into container', () => {
    const pcs = [getProductById('pc-001'), getProductById('pc-002')];
    renderProductGrid('grid', pcs);
    expect(document.getElementById('grid').innerHTML).toContain('Titan Pro X');
    expect(document.getElementById('grid').innerHTML).toContain('Vortex Builder');
  });

  test('shows no-products message when array is empty', () => {
    renderProductGrid('grid', []);
    expect(document.getElementById('grid').innerHTML).toContain('No products match');
  });

  test('does nothing when container id does not exist', () => {
    expect(() => renderProductGrid('nonexistent', [getProductById('pc-001')])).not.toThrow();
  });
});

// ─── updateProductCount ────────────────────────────────────────────────────────

describe('updateProductCount', () => {
  beforeEach(() => {
    document.body.innerHTML = '<span id="grid-count"></span>';
  });

  test('sets count text with singular "product"', () => {
    updateProductCount('grid', 1);
    expect(document.getElementById('grid-count').textContent).toBe('1 product found');
  });

  test('sets count text with plural "products"', () => {
    updateProductCount('grid', 5);
    expect(document.getElementById('grid-count').textContent).toBe('5 products found');
  });

  test('zero uses plural', () => {
    updateProductCount('grid', 0);
    expect(document.getElementById('grid-count').textContent).toBe('0 products found');
  });

  test('does nothing when element does not exist', () => {
    expect(() => updateProductCount('missing', 3)).not.toThrow();
  });
});
