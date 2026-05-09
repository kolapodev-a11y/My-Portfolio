const CONFIG = {
  whatsappNumber: '2348012345678',
  flutterwaveLink: '',
  currency: 'NGN'
};

const products = [
  { id: 1, name: 'Noir Velvet Extrait', category: 'perfume', price: 28500, badge: 'Best Seller', description: 'A rich evening fragrance with warm amber, spice and smooth woody depth.', visual: 'bottle' },
  { id: 2, name: 'Golden Aura Mist', category: 'body spray', price: 9500, badge: 'Fresh Pick', description: 'An easy daily body spray with airy citrus brightness and soft musk.', visual: 'bottle' },
  { id: 3, name: 'Silk Oud Roll On', category: 'roll ons', price: 6500, badge: 'Pocket Size', description: 'A compact roll on blend for quick scent touch-ups through the day.', visual: 'bottle' },
  { id: 4, name: 'Velvet Reed Diffuser', category: 'diffusers', price: 18000, badge: 'Home Luxe', description: 'A premium reed diffuser designed to scent your room with soft sophistication.', visual: 'diffuser' },
  { id: 5, name: 'Mist Halo Humidifier', category: 'humidifiers', price: 24000, badge: 'Modern Tech', description: 'A compact humidifier for ambience, moisture balance and fragrance diffusion.', visual: 'humidifier' },
  { id: 6, name: 'Rose Ember Perfume', category: 'perfume', price: 22000, badge: 'New', description: 'A floral-spice blend with rose, saffron warmth and an addictive dry down.', visual: 'bottle' }
];

const state = {
  filter: 'all',
  query: '',
  cart: JSON.parse(localStorage.getItem('hovaluxe_cart') || '[]')
};

const currency = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: CONFIG.currency,
  maximumFractionDigits: 0
});

const productsGrid = document.getElementById('productsGrid');
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const searchInput = document.getElementById('searchInput');
const cartButton = document.getElementById('cartButton');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItems = document.getElementById('cartItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const goToCheckoutBtn = document.getElementById('goToCheckoutBtn');
const checkoutItemsCount = document.getElementById('checkoutItemsCount');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutForm = document.getElementById('checkoutForm');
const customerName = document.getElementById('customerName');
const customerPhone = document.getElementById('customerPhone');
const customerNote = document.getElementById('customerNote');
const whatsappCheckoutBtn = document.getElementById('whatsappCheckoutBtn');
const flutterwaveBtn = document.getElementById('flutterwaveBtn');
const toast = document.getElementById('toast');

function formatPrice(amount) {
  return currency.format(amount || 0);
}

function saveCart() {
  localStorage.setItem('hovaluxe_cart', JSON.stringify(state.cart));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function getCartCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function syncTotals() {
  const count = getCartCount();
  const total = getCartTotal();

  cartCount.textContent = count;
  checkoutItemsCount.textContent = count;
  cartSubtotal.textContent = formatPrice(total);
  cartTotal.textContent = formatPrice(total);
  checkoutTotal.textContent = formatPrice(total);
}

function productVisualMarkup(type) {
  if (type === 'diffuser') {
    return '<div class="product-art"><div class="art-diffuser"></div></div>';
  }
  if (type === 'humidifier') {
    return '<div class="product-art"><div class="art-humidifier"></div></div>';
  }
  return '<div class="product-art"><div class="art-bottle"></div></div>';
}

function getFilteredProducts() {
  return products.filter((product) => {
    const matchesFilter = state.filter === 'all' || product.category === state.filter;
    const query = state.query.trim().toLowerCase();
    const matchesQuery = !query || [product.name, product.category, product.description].join(' ').toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });
}

function renderProducts() {
  const filtered = getFilteredProducts();

  if (!filtered.length) {
    productsGrid.innerHTML = '<div class="empty-state">No products match your search right now.</div>';
    return;
  }

  productsGrid.innerHTML = filtered.map((product) => `
    <article class="product-card luxe-panel">
      <div class="product-visual">
        <span class="product-badge">${product.badge}</span>
        ${productVisualMarkup(product.visual)}
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-category">${product.category}</span>
          <span class="product-price">${formatPrice(product.price)}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-actions">
          <button class="btn btn-outline add-to-cart" data-id="${product.id}" type="button">Add to cart</button>
          <button class="btn btn-whatsapp buy-whatsapp" data-id="${product.id}" type="button">WhatsApp</button>
        </div>
      </div>
    </article>
  `).join('');
}

function addToCart(productId) {
  const product = products.find((item) => item.id === Number(productId));
  if (!product) return;

  const existing = state.cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }

  saveCart();
  syncTotals();
  renderCart();
  showToast(`${product.name} added to cart`);
}

function updateQty(productId, delta) {
  const item = state.cart.find((entry) => entry.id === Number(productId));
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== Number(productId));
  }

  saveCart();
  syncTotals();
  renderCart();
}

function removeItem(productId) {
  state.cart = state.cart.filter((entry) => entry.id !== Number(productId));
  saveCart();
  syncTotals();
  renderCart();
}

function renderCart() {
  if (!state.cart.length) {
    cartItems.innerHTML = '<div class="empty-state">Your cart is empty. Add a few Hovaluxe items to continue.</div>';
    return;
  }

  cartItems.innerHTML = state.cart.map((item) => `
    <article class="cart-item">
      <div class="cart-row">
        <div>
          <strong>${item.name}</strong>
          <p class="cart-muted">${item.category}</p>
        </div>
        <strong>${formatPrice(item.price * item.qty)}</strong>
      </div>
      <div class="cart-row">
        <div class="qty-controls">
          <button type="button" data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.qty}</span>
          <button type="button" data-action="increase" data-id="${item.id}">+</button>
        </div>
        <button class="remove-btn" type="button" data-action="remove" data-id="${item.id}">Remove</button>
      </div>
    </article>
  `).join('');
}

function openCart() {
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

function buildWhatsAppMessage(singleProduct = null) {
  const cartItemsSource = singleProduct ? [{ ...singleProduct, qty: 1 }] : state.cart;
  const name = customerName.value.trim();
  const phone = customerPhone.value.trim();
  const note = customerNote.value.trim();
  const total = cartItemsSource.reduce((sum, item) => sum + item.price * item.qty, 0);

  const lines = [
    'Hello Hovaluxe, I want to place an order.',
    '',
    'Items:'
  ];

  cartItemsSource.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} x${item.qty} — ${formatPrice(item.price * item.qty)}`);
  });

  lines.push('');
  lines.push(`Total: ${formatPrice(total)}`);

  if (name) lines.push(`Customer Name: ${name}`);
  if (phone) lines.push(`Phone: ${phone}`);
  if (note) lines.push(`Note: ${note}`);

  return encodeURIComponent(lines.join('\n'));
}

function sendWhatsAppOrder(singleProduct = null) {
  const source = singleProduct ? [singleProduct] : state.cart;
  if (!source.length) {
    showToast('Add at least one item before checkout');
    return;
  }

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${buildWhatsAppMessage(singleProduct)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function startFlutterwaveCheckout() {
  if (!state.cart.length) {
    showToast('Your cart is empty');
    return;
  }

  if (CONFIG.flutterwaveLink) {
    window.open(CONFIG.flutterwaveLink, '_blank', 'noopener,noreferrer');
    return;
  }

  showToast('Add your Flutterwave payment link in script.js');
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    renderProducts();
  });
});

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderProducts();
});

productsGrid.addEventListener('click', (event) => {
  const addToCartButton = event.target.closest('.add-to-cart');
  const whatsappButton = event.target.closest('.buy-whatsapp');

  if (addToCartButton) {
    addToCart(addToCartButton.dataset.id);
  }

  if (whatsappButton) {
    const product = products.find((item) => item.id === Number(whatsappButton.dataset.id));
    if (product) sendWhatsAppOrder(product);
  }
});

cartItems.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;

  const { action, id } = trigger.dataset;
  if (action === 'increase') updateQty(id, 1);
  if (action === 'decrease') updateQty(id, -1);
  if (action === 'remove') removeItem(id);
});

cartButton.addEventListener('click', openCart);
cartOverlay.addEventListener('click', closeCart);
closeCartBtn.addEventListener('click', closeCart);
goToCheckoutBtn.addEventListener('click', closeCart);

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  sendWhatsAppOrder();
});

flutterwaveBtn.addEventListener('click', startFlutterwaveCheckout);
whatsappCheckoutBtn.addEventListener('click', () => {
  if (!state.cart.length) {
    showToast('Add at least one item before checkout');
  }
});

renderProducts();
renderCart();
syncTotals();
