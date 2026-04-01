/* ============================================================
   products.js — GarlicBread.co
   Product data, rendering, and filtering logic
   ============================================================ */

const PRODUCTS = {
  breads: [
    {
      id: 'gb-001',
      name: 'Classic Garlic Bread',
      badge: 'BESTSELLER',
      badgeClass: 'badge-hot',
      icon: '🥖',
      price: 3.99,
      oldPrice: 4.99,
      desc: 'Our signature recipe — crispy sourdough baguette slathered in hand-whipped garlic butter and fresh parsley. Perfectly golden every time.',
      style: 'classic',
      heat: 'mild',
      specs: {
        size: 'Half baguette (4 slices)',
        butter: 'Hand-whipped garlic butter',
        herbs: 'Fresh parsley & chives',
        calories: '~180 kcal / slice'
      },
      availability: 'In Stock',
      rating: 4.9,
      reviews: 312
    },
    {
      id: 'gb-002',
      name: 'Cheesy Garlic Bread',
      badge: 'HOT',
      badgeClass: 'badge-hot',
      icon: '🧀',
      price: 5.49,
      oldPrice: null,
      desc: 'Classic garlic bread loaded with a blend of mozzarella and mature cheddar, grilled until perfectly melted and bubbling.',
      style: 'cheesy',
      heat: 'mild',
      specs: {
        size: 'Half baguette (4 slices)',
        butter: 'Roasted garlic butter',
        cheese: 'Mozzarella & aged cheddar',
        calories: '~260 kcal / slice'
      },
      availability: 'In Stock',
      rating: 4.8,
      reviews: 274
    },
    {
      id: 'gb-003',
      name: 'Spicy Chilli Garlic Bread',
      badge: 'NEW',
      badgeClass: 'badge-new',
      icon: '🌶️',
      price: 4.79,
      oldPrice: null,
      desc: 'A bold twist on the classic — fiery chilli flakes and roasted jalapeño mixed into the garlic butter for a proper kick.',
      style: 'spicy',
      heat: 'hot',
      specs: {
        size: 'Half baguette (4 slices)',
        butter: 'Chilli-garlic butter',
        herbs: 'Parsley & dried chilli flakes',
        calories: '~185 kcal / slice'
      },
      availability: 'In Stock',
      rating: 4.6,
      reviews: 98
    },
    {
      id: 'gb-004',
      name: 'Pull-Apart Garlic Loaf',
      badge: 'BESTSELLER',
      badgeClass: 'badge-hot',
      icon: '🍞',
      price: 7.99,
      oldPrice: 9.49,
      desc: 'A whole sourdough cob sliced in a crosshatch pattern and filled with garlic butter and herbs. Tear off a piece and share the love.',
      style: 'pull-apart',
      heat: 'mild',
      specs: {
        size: 'Whole cob loaf (serves 4–6)',
        butter: 'Generous garlic herb butter',
        herbs: 'Rosemary, thyme & parsley',
        calories: '~210 kcal / portion'
      },
      availability: 'In Stock',
      rating: 5.0,
      reviews: 187
    },
    {
      id: 'gb-005',
      name: 'Garlic Focaccia',
      badge: null,
      badgeClass: '',
      icon: '🫓',
      price: 6.49,
      oldPrice: null,
      desc: 'Freshly baked Italian focaccia drizzled with extra-virgin olive oil, roasted garlic, sea salt, and fragrant rosemary.',
      style: 'focaccia',
      heat: 'mild',
      specs: {
        size: '8 squares (serves 3–4)',
        oil: 'Extra-virgin olive oil',
        herbs: 'Rosemary & sea salt flakes',
        calories: '~220 kcal / square'
      },
      availability: 'In Stock',
      rating: 4.7,
      reviews: 143
    },
    {
      id: 'gb-006',
      name: 'Cheesy Jalapeño Pull-Apart',
      badge: 'NEW',
      badgeClass: 'badge-new',
      icon: '🧀',
      price: 9.99,
      oldPrice: null,
      desc: 'Our pull-apart loaf meets the cheesy bread — stuffed with mozzarella, cheddar, pickled jalapeños and roasted garlic butter. Crowd favourite.',
      style: 'pull-apart',
      heat: 'medium',
      specs: {
        size: 'Whole cob loaf (serves 4–6)',
        cheese: 'Mozzarella, cheddar & parmesan',
        extras: 'Pickled jalapeños',
        calories: '~290 kcal / portion'
      },
      availability: 'In Stock',
      rating: 4.9,
      reviews: 56
    },
    {
      id: 'gb-007',
      name: 'Garlic Ciabatta',
      badge: 'SALE',
      badgeClass: 'badge-sale',
      icon: '🥖',
      price: 4.29,
      oldPrice: 5.49,
      desc: 'Airy Italian ciabatta with an open crumb — brushed with a generous garlic-herb butter and toasted until golden and crisp on the edges.',
      style: 'classic',
      heat: 'mild',
      specs: {
        size: 'Half ciabatta (6 slices)',
        butter: 'Garlic & herb butter',
        herbs: 'Basil & oregano',
        calories: '~160 kcal / slice'
      },
      availability: 'In Stock',
      rating: 4.5,
      reviews: 201
    },
    {
      id: 'gb-008',
      name: 'Mini Garlic Bread Rolls (6 pack)',
      badge: null,
      badgeClass: '',
      icon: '🫓',
      price: 5.99,
      oldPrice: null,
      desc: 'Six individually baked soft bread rolls stuffed with garlic butter and topped with sesame seeds. Great for dipping or as a side.',
      style: 'rolls',
      heat: 'mild',
      specs: {
        size: '6 rolls (serves 2–3)',
        butter: 'Soft garlic butter',
        topping: 'Sesame seeds & chives',
        calories: '~150 kcal / roll'
      },
      availability: 'In Stock',
      rating: 4.6,
      reviews: 89
    }
  ]
};

/* ---- Get product by id ---- */
function getProductById(id) {
  return PRODUCTS.breads.find(p => p.id === id) || null;
}

/* ---- Stars HTML ---- */
function starsHTML(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '⭐';
  const empty = 5 - full - half;
  for (let i = 0; i < empty; i++) s += '☆';
  return s;
}

/* ---- Render a product card ---- */
function renderProductCard(product) {
  const badgeHTML = product.badge
    ? `<span class="product-badge ${product.badgeClass}">${product.badge}</span>`
    : '';

  const oldPriceHTML = product.oldPrice
    ? `<small class="price-old">£${product.oldPrice.toFixed(2)}</small>`
    : '';

  const specKeys = Object.keys(product.specs);
  const tagCount = Math.min(3, specKeys.length);
  let specTags = '';
  for (let i = 0; i < tagCount; i++) {
    specTags += `<span class="spec-tag">${product.specs[specKeys[i]]}</span>`;
  }

  return `
    <div class="product-card fade-in" data-product-id="${product.id}" data-price="${product.price}" data-style="${product.style}" data-heat="${product.heat}">
      <div class="product-image">
        ${badgeHTML}
        <span class="product-img-icon">${product.icon}</span>
      </div>
      <div class="product-body">
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.desc}</div>
        <div class="product-specs">${specTags}</div>
      </div>
      <div class="product-footer">
        <div class="product-price">
          ${oldPriceHTML}
          £${product.price.toFixed(2)}
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button class="btn btn-primary btn-sm" onclick="addToCart('${product.id}', event)">Add to cart</button>
        </div>
      </div>
    </div>
  `;
}

/* ---- Render grid ---- */
function renderProductGrid(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!products.length) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);">No products match your filters.</div>`;
    return;
  }
  container.innerHTML = products.map(renderProductCard).join('');
  requestAnimationFrame(() => {
    container.querySelectorAll('.fade-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 80);
    });
  });
}

/* ---- Filter breads ---- */
function filterBreads(priceMax, styles, heats) {
  return PRODUCTS.breads.filter(p => {
    if (p.price > priceMax) return false;
    if (styles.length && !styles.includes(p.style)) return false;
    if (heats.length && !heats.includes(p.heat)) return false;
    return true;
  });
}

/* ---- Sort products ---- */
function sortProducts(products, sortBy) {
  const arr = [...products];
  switch (sortBy) {
    case 'price-asc':  arr.sort((a, b) => a.price - b.price); break;
    case 'price-desc': arr.sort((a, b) => b.price - a.price); break;
    case 'rating':     arr.sort((a, b) => b.rating - a.rating); break;
    case 'name':       arr.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: break;
  }
  return arr;
}

/* ---- Update count display ---- */
function updateProductCount(containerId, count) {
  const el = document.getElementById(containerId + '-count');
  if (el) el.textContent = `${count} item${count !== 1 ? 's' : ''} found`;
}
