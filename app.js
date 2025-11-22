const API_BASE = '/api';

const productGrid = document.getElementById('productGrid');
const productEmptyState = document.getElementById('productEmptyState');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const cartList = document.getElementById('cartList');
const cartTotalEl = document.getElementById('cartTotal');
const enquiryProductSelect = document.getElementById('enquiryProduct');
const enquiryForm = document.getElementById('enquiryForm');
const enquiryFeedback = document.getElementById('enquiryFeedback');
const enquiryContact = document.getElementById('enquiryContact');
const enquiryMessage = document.getElementById('enquiryMessage');
const customerDashboard = document.getElementById('customerDashboard');
const customerNameEl = document.getElementById('customerName');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const loginFeedback = document.getElementById('loginFeedback');
const loginIdentifier = document.getElementById('loginIdentifier');
const loginPassword = document.getElementById('loginPassword');
const registerForm = document.getElementById('registerForm');
const registerFeedback = document.getElementById('registerFeedback');
const regFullName = document.getElementById('regFullName');
const regUsername = document.getElementById('regUsername');
const regEmail = document.getElementById('regEmail');
const regPhone = document.getElementById('regPhone');
const regPassword = document.getElementById('regPassword');
const regCaptchaInput = document.getElementById('regCaptchaInput');
const captchaVisual = document.getElementById('captchaVisual');
const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const checkoutBtn = document.getElementById('checkoutBtn');
const heroStatProducts = document.getElementById('statProducts');

let products = [];
let filteredProducts = [];
let cart = [];
let captchaToken = null;
let authToken = localStorage.getItem('pp_auth_token');
let currentUser = JSON.parse(localStorage.getItem('pp_user') || 'null');

const modalMap = new Map();
document.querySelectorAll('.modal').forEach((modal) => {
  modalMap.set(modal.id, modal);
});

const openModal = (id) => {
  const modal = modalMap.get(id);
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
  }
};

const closeModal = (id) => {
  const modal = modalMap.get(id);
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
};

document.querySelectorAll('[data-modal]').forEach((trigger) => {
  trigger.addEventListener('click', (evt) => {
    const target = evt.currentTarget.getAttribute('data-modal');
    if (target) {
      openModal(target);
    }
  });
});

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', (evt) => {
    const target = evt.currentTarget.getAttribute('data-close');
    closeModal(target);
  });
});

document.querySelectorAll('.modal').forEach((modal) => {
  modal.addEventListener('click', (evt) => {
    if (evt.target === modal) {
      modal.setAttribute('aria-hidden', 'true');
    }
  });
});

const scrollButtons = document.querySelectorAll('[data-scroll]');
scrollButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    const selector = btn.getAttribute('data-scroll');
    const target = document.querySelector(selector);
    target?.scrollIntoView({ behavior: 'smooth' });
  })
);

const showToast = (message, duration = 2500) => {
  if (!toast) return;
  toastMessage.textContent = message;
  toast.setAttribute('aria-hidden', 'false');
  setTimeout(() => toast.setAttribute('aria-hidden', 'true'), duration);
};

const fetchCaptcha = async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/captcha`);
    if (!res.ok) throw new Error('Unable to load captcha');
    const data = await res.json();
    captchaToken = data.token;
    captchaVisual.textContent = data.text;
  } catch (error) {
    captchaVisual.textContent = 'ERROR';
    console.error(error);
  }
};

const fetchProducts = async () => {
  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    products = data;
    filteredProducts = data;
    heroStatProducts.textContent = `${data.length}+`;
    populateCategoryFilter();
    renderProducts();
    populateEnquiryProducts();
  } catch (error) {
    console.error(error);
  }
};

const populateCategoryFilter = () => {
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  categoryFilter.innerHTML = '<option value="">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
};

const renderProducts = () => {
  productGrid.innerHTML = '';
  if (!filteredProducts.length) {
    productEmptyState.hidden = false;
    return;
  }
  productEmptyState.hidden = true;
  filteredProducts.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <p class="eyebrow">${product.category || 'General'}</p>
      <h3>${product.name}</h3>
      <p>${product.description || ''}</p>
      <p class="price">₹ ${Number(product.price).toFixed(2)}</p>
      <button class="btn secondary" data-product="${product.id}">Add to cart</button>
    `;
    card.querySelector('button').addEventListener('click', () => addToCart(product.id));
    productGrid.appendChild(card);
  });
};

const populateEnquiryProducts = () => {
  enquiryProductSelect.innerHTML = '<option value="">Choose product</option>';
  products.forEach((product) => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = product.name;
    enquiryProductSelect.appendChild(option);
  });
};

const filterProducts = () => {
  const term = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  filteredProducts = products.filter((product) => {
    const matchesTerm =
      !term ||
      product.name.toLowerCase().includes(term) ||
      (product.description || '').toLowerCase().includes(term);
    const matchesCategory = !category || product.category === category;
    return matchesTerm && matchesCategory;
  });
  renderProducts();
};

searchInput?.addEventListener('input', filterProducts);
categoryFilter?.addEventListener('change', filterProducts);

const addToCart = (productId) => {
  if (!currentUser) {
    showToast('Login to add items to your cart');
    openModal('loginModal');
    return;
  }
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ productId, qty: 1 });
  }
  renderCart();
};

const renderCart = () => {
  cartList.innerHTML = '';
  let total = 0;
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;
    const cost = Number(product.price) * item.qty;
    total += cost;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div>
        <strong>${product.name}</strong>
        <p>Qty: ${item.qty}</p>
      </div>
      <div>
        ₹ ${cost.toFixed(2)}
        <button class="btn ghost" data-remove="${product.id}">−</button>
      </div>
    `;
    li.querySelector('button').addEventListener('click', () => removeFromCart(product.id));
    cartList.appendChild(li);
  });
  cartTotalEl.textContent = total.toFixed(2);
};

const removeFromCart = (productId) => {
  cart = cart.filter((item) => item.productId !== productId);
  renderCart();
};

checkoutBtn?.addEventListener('click', () => {
  if (!cart.length) {
    showToast('Add items to cart first');
    return;
  }
  showToast('Checkout simulation complete. Delivery team notified.');
  cart = [];
  renderCart();
});

const syncAuthState = () => {
  if (authToken && currentUser) {
    customerDashboard.hidden = currentUser.role !== 'customer';
    if (!customerDashboard.hidden) {
      customerNameEl.textContent = currentUser.name;
    }
  } else {
    customerDashboard.hidden = true;
  }
};

logoutBtn?.addEventListener('click', () => {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('pp_auth_token');
  localStorage.removeItem('pp_user');
  syncAuthState();
  showToast('Logged out');
});

loginForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  loginFeedback.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: loginIdentifier.value,
        password: loginPassword.value
      })
    });
    const data = await res.json();
    if (!res.ok) {
      loginFeedback.textContent = data.message || 'Unable to login';
      loginFeedback.className = 'form-feedback error';
      return;
    }
    if (data.user.role !== 'customer') {
      loginFeedback.textContent = 'Use admin console for master access.';
      loginFeedback.className = 'form-feedback error';
      return;
    }
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('pp_auth_token', authToken);
    localStorage.setItem('pp_user', JSON.stringify(currentUser));
    loginFeedback.textContent = 'Login successful';
    loginFeedback.className = 'form-feedback success';
    syncAuthState();
    closeModal('loginModal');
    showToast('Welcome back!');
  } catch (error) {
    loginFeedback.textContent = 'Network error';
    loginFeedback.className = 'form-feedback error';
  }
});

registerForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  registerFeedback.textContent = '';
  try {
    const payload = {
      fullName: regFullName.value.trim(),
      username: regUsername.value.trim(),
      email: regEmail.value.trim(),
      phone: regPhone.value.trim(),
      password: regPassword.value,
      captchaToken,
      captchaText: regCaptchaInput.value.trim()
    };
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      registerFeedback.textContent = data.message || 'Registration failed';
      registerFeedback.className = 'form-feedback error';
      await fetchCaptcha();
      return;
    }
    registerFeedback.textContent = 'Account created. Please login.';
    registerFeedback.className = 'form-feedback success';
    registerForm.reset();
    await fetchCaptcha();
    closeModal('registerModal');
    openModal('loginModal');
  } catch (error) {
    registerFeedback.textContent = 'Network error';
    registerFeedback.className = 'form-feedback error';
  }
});

refreshCaptchaBtn?.addEventListener('click', fetchCaptcha);

enquiryForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if (!authToken) {
    openModal('loginModal');
    showToast('Login to send enquiry');
    return;
  }
  enquiryFeedback.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        productId: enquiryProductSelect.value || null,
        preferredContact: enquiryContact.value,
        message: enquiryMessage.value
      })
    });
    const data = await res.json();
    if (!res.ok) {
      enquiryFeedback.textContent = data.message || 'Unable to submit enquiry';
      enquiryFeedback.className = 'form-feedback error';
      return;
    }
    enquiryFeedback.textContent = 'Enquiry submitted. Team will reach out soon.';
    enquiryFeedback.className = 'form-feedback success';
    enquiryForm.reset();
  } catch (error) {
    enquiryFeedback.textContent = 'Network error';
    enquiryFeedback.className = 'form-feedback error';
  }
});

const init = () => {
  fetchProducts();
  fetchCaptcha();
  syncAuthState();
  if (currentUser) {
    showToast(`Welcome back, ${currentUser.name}`);
  }
};

init();

