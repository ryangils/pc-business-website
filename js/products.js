/* ============================================================
   products.js — CyberForge PC
   Product data, rendering, and filtering logic
   ============================================================ */

const PRODUCTS = {
  pcs: [
    {
      id: 'pc-001',
      type: 'pc',
      name: 'Titan Pro X',
      badge: 'HOT',
      badgeClass: 'badge-hot',
      icon: '🖥️',
      image: 'https://images.unsplash.com/photo-1593640408182-31c228b38f44?auto=format&fit=crop&w=600&q=80',
      price: 2499,
      oldPrice: 2899,
      desc: 'The ultimate gaming powerhouse built for 4K dominance. Zero compromise.',
      brand: 'CyberForge',
      performance: 'ultra',
      specs: {
        cpu: 'Intel Core i9-14900K',
        gpu: 'NVIDIA RTX 4090 24GB',
        ram: '64GB DDR5 6000MHz',
        storage: '2TB NVMe Gen5',
        cooling: '360mm AIO Liquid',
        psu: '1000W 80+ Platinum',
        os: 'Windows 11 Pro',
        case: 'CyberForge Titan Tower'
      },
      availability: 'In Stock',
      rating: 4.9,
      reviews: 142
    },
    {
      id: 'pc-002',
      type: 'pc',
      name: 'Vortex Builder',
      badge: 'NEW',
      badgeClass: 'badge-new',
      icon: '💻',
      image: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=600&q=80',
      price: 1299,
      oldPrice: null,
      desc: 'Mid-range powerhouse delivering exceptional value for gamers and creators.',
      brand: 'CyberForge',
      performance: 'high',
      specs: {
        cpu: 'AMD Ryzen 7 7800X3D',
        gpu: 'NVIDIA RTX 4070 Ti 12GB',
        ram: '32GB DDR5 5600MHz',
        storage: '1TB NVMe Gen4',
        cooling: '240mm AIO Liquid',
        psu: '750W 80+ Gold',
        os: 'Windows 11 Home',
        case: 'Corsair 4000D Airflow'
      },
      availability: 'In Stock',
      rating: 4.7,
      reviews: 89
    },
    {
      id: 'pc-003',
      type: 'pc',
      name: 'Nexus Core',
      badge: 'SALE',
      badgeClass: 'badge-sale',
      icon: '🖥️',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      price: 799,
      oldPrice: 999,
      desc: 'Entry-level gaming PC that punches well above its price tag.',
      brand: 'CyberForge',
      performance: 'mid',
      specs: {
        cpu: 'AMD Ryzen 5 7600',
        gpu: 'NVIDIA RTX 4060 8GB',
        ram: '16GB DDR5 5200MHz',
        storage: '512GB NVMe Gen4',
        cooling: 'Tower Air Cooler',
        psu: '650W 80+ Gold',
        os: 'Windows 11 Home',
        case: 'NZXT H5 Flow'
      },
      availability: 'In Stock',
      rating: 4.5,
      reviews: 213
    },
    {
      id: 'pc-004',
      type: 'pc',
      name: 'Phantom Elite',
      badge: 'CUSTOM',
      badgeClass: 'badge-custom',
      icon: '🖥️',
      image: 'https://images.unsplash.com/photo-1555617981-dac3772e4783?auto=format&fit=crop&w=600&q=80',
      price: 3499,
      oldPrice: null,
      desc: 'Professional workstation for 3D rendering, video production, and AI workloads.',
      brand: 'CyberForge',
      performance: 'ultra',
      specs: {
        cpu: 'AMD Threadripper PRO 7975WX',
        gpu: 'NVIDIA RTX 4090 24GB × 2',
        ram: '256GB ECC DDR5',
        storage: '8TB NVMe RAID + 2TB HDD',
        cooling: '420mm AIO Liquid',
        psu: '1600W 80+ Titanium',
        os: 'Windows 11 Pro for Workstations',
        case: 'Phanteks Enthoo Pro II'
      },
      availability: 'Made to Order',
      rating: 5.0,
      reviews: 28
    },
    {
      id: 'pc-005',
      type: 'pc',
      name: 'Surge X Stream',
      badge: null,
      badgeClass: '',
      icon: '🖥️',
      image: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&w=600&q=80',
      price: 999,
      oldPrice: null,
      desc: 'The dedicated streaming and content creation rig. Go live in style.',
      brand: 'CyberForge',
      performance: 'high',
      specs: {
        cpu: 'Intel Core i7-14700K',
        gpu: 'AMD Radeon RX 7800 XT 16GB',
        ram: '32GB DDR5 5600MHz',
        storage: '1TB NVMe + 2TB HDD',
        cooling: '280mm AIO Liquid',
        psu: '750W 80+ Gold',
        os: 'Windows 11 Home',
        case: 'Lian Li Lancool 216'
      },
      availability: 'In Stock',
      rating: 4.6,
      reviews: 55
    },
    {
      id: 'pc-006',
      type: 'pc',
      name: 'Aurora RGB Max',
      badge: 'NEW',
      badgeClass: 'badge-new',
      icon: '🖥️',
      image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80',
      price: 1799,
      oldPrice: null,
      desc: 'Maximum RGB spectacle meets maximum gaming performance. Light up any room.',
      brand: 'CyberForge',
      performance: 'ultra',
      specs: {
        cpu: 'Intel Core i9-14900KF',
        gpu: 'NVIDIA RTX 4080 Super 16GB',
        ram: '64GB DDR5 ARGB 6400MHz',
        storage: '2TB NVMe Gen5',
        cooling: '360mm ARGB AIO',
        psu: '850W 80+ Gold',
        os: 'Windows 11 Home',
        case: 'Corsair 7000D Airflow ARGB'
      },
      availability: 'In Stock',
      rating: 4.8,
      reviews: 76
    }
  ],
  cases: [
    {
      id: 'case-001',
      type: 'case',
      name: 'Obsidian Tower',
      badge: 'HOT',
      badgeClass: 'badge-hot',
      icon: '📦',
      image: 'https://images.unsplash.com/photo-1526657782461-9fe13402a841?auto=format&fit=crop&w=600&q=80',
      price: 149,
      oldPrice: 179,
      desc: 'Full tower with tempered glass side panel and excellent cable management.',
      brand: 'Fractal Design',
      formFactor: 'Full Tower',
      specs: {
        formFactor: 'Full Tower',
        motherboard: 'E-ATX / ATX / mATX',
        maxGPU: '420mm',
        maxCooler: '185mm',
        driveBays: '4× 3.5" + 6× 2.5"',
        fans: '8× 140mm included',
        sidePanels: 'Tempered Glass',
        pciSlots: '8 horizontal + 3 vertical'
      },
      availability: 'In Stock',
      rating: 4.8,
      reviews: 94
    },
    {
      id: 'case-002',
      type: 'case',
      name: 'Neon Cube RGB',
      badge: 'NEW',
      badgeClass: 'badge-new',
      icon: '📦',
      image: 'https://images.unsplash.com/photo-1616509091215-57bbece36b14?auto=format&fit=crop&w=600&q=80',
      price: 89,
      oldPrice: null,
      desc: 'Mid-tower with 4 pre-installed ARGB fans and stunning panoramic glass.',
      brand: 'CyberForge',
      formFactor: 'Mid Tower',
      specs: {
        formFactor: 'Mid Tower',
        motherboard: 'ATX / mATX',
        maxGPU: '380mm',
        maxCooler: '165mm',
        driveBays: '2× 3.5" + 4× 2.5"',
        fans: '4× 120mm ARGB included',
        sidePanels: 'Tempered Glass',
        pciSlots: '7 + 2 vertical'
      },
      availability: 'In Stock',
      rating: 4.6,
      reviews: 132
    },
    {
      id: 'case-003',
      type: 'case',
      name: 'Vortex Mini ITX',
      badge: null,
      badgeClass: '',
      icon: '📦',
      image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
      price: 79,
      oldPrice: null,
      desc: 'Compact mini-ITX case with surprising cooling performance and clean looks.',
      brand: 'Cooler Master',
      formFactor: 'Mini ITX',
      specs: {
        formFactor: 'Mini-ITX',
        motherboard: 'Mini-ITX',
        maxGPU: '330mm',
        maxCooler: '155mm',
        driveBays: '1× 3.5" + 2× 2.5"',
        fans: '2× 120mm included',
        sidePanels: 'Tempered Glass',
        pciSlots: '2 + vertical riser'
      },
      availability: 'In Stock',
      rating: 4.4,
      reviews: 67
    },
    {
      id: 'case-004',
      type: 'case',
      name: 'CrystalArc 360',
      badge: 'SALE',
      badgeClass: 'badge-sale',
      icon: '📦',
      image: 'https://images.unsplash.com/photo-1604752468578-c5c9c39ebaaa?auto=format&fit=crop&w=600&q=80',
      price: 119,
      oldPrice: 149,
      desc: 'Panoramic tempered glass on three sides — show off every component.',
      brand: 'CyberForge',
      formFactor: 'Mid Tower',
      specs: {
        formFactor: 'Mid Tower',
        motherboard: 'ATX / mATX / Mini-ITX',
        maxGPU: '400mm',
        maxCooler: '170mm',
        driveBays: '3× 3.5" + 4× 2.5"',
        fans: '3× 140mm ARGB included',
        sidePanels: '3-side Tempered Glass',
        pciSlots: '7 + 3 vertical'
      },
      availability: 'In Stock',
      rating: 4.7,
      reviews: 48
    },
    {
      id: 'case-005',
      type: 'case',
      name: 'Phantom Shell Mesh',
      badge: null,
      badgeClass: '',
      icon: '📦',
      image: 'https://images.unsplash.com/photo-1598954804534-a09f1dc0aaf6?auto=format&fit=crop&w=600&q=80',
      price: 99,
      oldPrice: null,
      desc: 'Perforated steel mesh front panel for optimal airflow in demanding builds.',
      brand: 'NZXT',
      formFactor: 'Mid Tower',
      specs: {
        formFactor: 'Mid Tower',
        motherboard: 'ATX / mATX',
        maxGPU: '365mm',
        maxCooler: '165mm',
        driveBays: '2× 3.5" + 4× 2.5"',
        fans: '2× 140mm included',
        sidePanels: 'Tempered Glass',
        pciSlots: '7'
      },
      availability: 'In Stock',
      rating: 4.5,
      reviews: 81
    },
    {
      id: 'case-006',
      type: 'case',
      name: 'Eclipse Pro ARGB',
      badge: 'CUSTOM',
      badgeClass: 'badge-custom',
      icon: '📦',
      image: 'https://images.unsplash.com/photo-1641572088060-3d66a9a13e35?auto=format&fit=crop&w=600&q=80',
      price: 179,
      oldPrice: null,
      desc: 'Premium full tower with integrated ARGB controller and tool-free drive bays.',
      brand: 'CyberForge',
      formFactor: 'Full Tower',
      specs: {
        formFactor: 'Full Tower',
        motherboard: 'EATX / ATX',
        maxGPU: '450mm',
        maxCooler: '190mm',
        driveBays: '6× 3.5" + 8× 2.5"',
        fans: '6× 140mm ARGB included',
        sidePanels: 'Tempered Glass',
        pciSlots: '8 + 4 vertical'
      },
      availability: 'In Stock',
      rating: 4.9,
      reviews: 33
    }
  ]
};

/* ---- Get product by id ---- */
function getProductById(id) {
  return [...PRODUCTS.pcs, ...PRODUCTS.cases].find(p => p.id === id) || null;
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
    ? `<small class="price-old">$${product.oldPrice.toLocaleString()}</small>`
    : '';

  // Pick 3 notable spec tags
  let specTags = '';
  const specKeys = Object.keys(product.specs);
  const tagCount = Math.min(3, specKeys.length);
  for (let i = 0; i < tagCount; i++) {
    const key = specKeys[i];
    const val = product.specs[key];
    specTags += `<span class="spec-tag">${val}</span>`;
  }

  const imageContent = product.image
    ? `<img src="${product.image}" alt="${product.name}" loading="lazy" class="product-img-photo" onerror="this.closest('.product-image').classList.remove('has-photo')">`
    : '';

  return `
    <div class="product-card fade-in" data-product-id="${product.id}" data-type="${product.type}" data-price="${product.price}" data-perf="${product.performance || ''}" data-brand="${product.brand.toLowerCase()}" data-form="${product.formFactor || ''}">
      <div class="product-image${product.image ? ' has-photo' : ''}">
        ${badgeHTML}
        ${imageContent}
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
          $${product.price.toLocaleString()}
        </div>
        <div style="display:flex;gap:0.5rem;">
          <a href="product-detail.html?id=${product.id}" class="btn btn-secondary btn-sm">Details</a>
          <button class="btn btn-primary btn-sm" onclick="addToCart('${product.id}', event)">Add</button>
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
  // trigger fade-in
  requestAnimationFrame(() => {
    container.querySelectorAll('.fade-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 80);
    });
  });
}

/* ---- Filter PCs ---- */
function filterPCs(priceMax, performances, brands) {
  return PRODUCTS.pcs.filter(p => {
    if (p.price > priceMax) return false;
    if (performances.length && !performances.includes(p.performance)) return false;
    if (brands.length && !brands.includes(p.brand.toLowerCase())) return false;
    return true;
  });
}

/* ---- Filter Cases ---- */
function filterCases(priceMax, formFactors, brands) {
  return PRODUCTS.cases.filter(p => {
    if (p.price > priceMax) return false;
    if (formFactors.length && !formFactors.includes(p.formFactor)) return false;
    if (brands.length && !brands.includes(p.brand.toLowerCase())) return false;
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
  if (el) el.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
}
