const API_BASE = '/api';

const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginFeedback = document.getElementById('adminLoginFeedback');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminToast = document.getElementById('adminToast');
const adminToastMessage = document.getElementById('adminToastMessage');

const productForm = document.getElementById('productForm');
const toggleProductFormBtn = document.getElementById('toggleProductForm');
const cancelProductEditBtn = document.getElementById('cancelProductEdit');
const productFormFeedback = document.getElementById('productFormFeedback');
const productsTableBody = document.querySelector('#productsTable tbody');

const deliveryForm = document.getElementById('deliveryForm');
const toggleDeliveryFormBtn = document.getElementById('toggleDeliveryForm');
const deliveryFormFeedback = document.getElementById('deliveryFormFeedback');
const deliveriesTableBody = document.querySelector('#deliveriesTable tbody');

const customersTableBody = document.querySelector('#customersTable tbody');
const enquiriesTableBody = document.querySelector('#enquiriesTable tbody');

const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const productDescriptionInput = document.getElementById('productDescription');
const productCategoryInput = document.getElementById('productCategory');
const productPriceInput = document.getElementById('productPrice');
const productStockInput = document.getElementById('productStock');
const productImageInput = document.getElementById('productImage');

const deliveryOrderRef = document.getElementById('deliveryOrderRef');
const deliveryStatus = document.getElementById('deliveryStatus');
const deliveryExpected = document.getElementById('deliveryExpected');
const deliveryNotes = document.getElementById('deliveryNotes');

const adminLoginIdentifier = document.getElementById('adminLoginIdentifier');
const adminLoginPassword = document.getElementById('adminLoginPassword');

let adminToken = localStorage.getItem('pp_admin_token');
let adminUser = JSON.parse(localStorage.getItem('pp_admin_user') || 'null');

const showAdminToast = (message, duration = 2200) => {
  if (!adminToast) return;
  adminToastMessage.textContent = message;
  adminToast.setAttribute('aria-hidden', 'false');
  setTimeout(() => adminToast.setAttribute('aria-hidden', 'true'), duration);
};

const authorizedFetch = (path, options = {}) => {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${adminToken}`
  };
  return fetch(path, { ...options, headers });
};

const requireAdminSession = () => {
  if (!adminToken) {
    showAdminToast('Login to continue');
    return false;
  }
  return true;
};

const renderProductsTable = (rows) => {
  productsTableBody.innerHTML = '';
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.category || 'General'}</td>
      <td>₹ ${Number(row.price).toFixed(2)}</td>
      <td>${row.stock}</td>
      <td class="table-actions">
        <button class="btn ghost" data-edit="${row.id}">Edit</button>
        <button class="btn ghost" data-delete="${row.id}">Delete</button>
      </td>
    `;
    tr.querySelector('[data-edit]').addEventListener('click', () => populateProductForm(row));
    tr.querySelector('[data-delete]').addEventListener('click', () => deleteProduct(row.id));
    productsTableBody.appendChild(tr);
  });
};

const loadProducts = async () => {
  if (!requireAdminSession()) return;
  const res = await authorizedFetch(`${API_BASE}/products`);
  const data = await res.json();
  renderProductsTable(data);
};

const populateProductForm = (product) => {
  productIdInput.value = product.id;
  productNameInput.value = product.name;
  productDescriptionInput.value = product.description || '';
  productCategoryInput.value = product.category || '';
  productPriceInput.value = product.price;
  productStockInput.value = product.stock;
  productImageInput.value = product.image_url || '';
  productForm.hidden = false;
};

const resetProductForm = () => {
  productForm.reset();
  productIdInput.value = '';
  productForm.hidden = true;
  productFormFeedback.textContent = '';
};

const deleteProduct = async (productId) => {
  if (!confirm('Delete this product?')) return;
  const res = await authorizedFetch(`${API_BASE}/products/${productId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) {
    showAdminToast(data.message || 'Unable to delete');
    return;
  }
  showAdminToast('Product deleted');
  loadProducts();
};

productForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if (!requireAdminSession()) return;
  const payload = {
    name: productNameInput.value,
    description: productDescriptionInput.value,
    category: productCategoryInput.value,
    price: Number(productPriceInput.value),
    stock: Number(productStockInput.value),
    imageUrl: productImageInput.value
  };
  const method = productIdInput.value ? 'PUT' : 'POST';
  const url =
    method === 'PUT'
      ? `${API_BASE}/products/${productIdInput.value}`
      : `${API_BASE}/products`;
  const res = await authorizedFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    productFormFeedback.textContent = data.message || 'Unable to save product';
    productFormFeedback.className = 'form-feedback error';
    return;
  }
  productFormFeedback.textContent = 'Product saved';
  productFormFeedback.className = 'form-feedback success';
  loadProducts();
  setTimeout(resetProductForm, 1200);
});

toggleProductFormBtn?.addEventListener('click', () => {
  productForm.hidden = !productForm.hidden;
  if (productForm.hidden) resetProductForm();
});
cancelProductEditBtn?.addEventListener('click', resetProductForm);

const renderCustomers = (rows) => {
  customersTableBody.innerHTML = '';
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.full_name}</td>
      <td>${row.email}</td>
      <td>${row.phone}</td>
      <td>${row.role}</td>
      <td>${new Date(row.created_at).toLocaleDateString()}</td>
      <td>
        ${
          row.role === 'admin'
            ? ''
            : `<button class="btn ghost" data-remove="${row.id}">Remove</button>`
        }
      </td>
    `;
    const removeBtn = tr.querySelector('[data-remove]');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => removeCustomer(row.id));
    }
    customersTableBody.appendChild(tr);
  });
};

const loadCustomers = async () => {
  if (!requireAdminSession()) return;
  const res = await authorizedFetch(`${API_BASE}/admin/customers`);
  const data = await res.json();
  renderCustomers(data);
};

const removeCustomer = async (customerId) => {
  if (!confirm('Remove this customer?')) return;
  const res = await authorizedFetch(`${API_BASE}/admin/customers/${customerId}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) {
    showAdminToast(data.message || 'Unable to remove customer');
    return;
  }
  showAdminToast('Customer removed');
  loadCustomers();
};

const renderEnquiries = (rows) => {
  enquiriesTableBody.innerHTML = '';
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.customer_name || 'Guest'}</td>
      <td>${row.product_name || 'Any'}</td>
      <td>${row.message}</td>
      <td>${row.preferred_contact}</td>
      <td>
        <select data-status="${row.id}">
          <option value="New" ${row.status === 'New' ? 'selected' : ''}>New</option>
          <option value="In Progress" ${row.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Closed" ${row.status === 'Closed' ? 'selected' : ''}>Closed</option>
        </select>
      </td>
      <td>${new Date(row.created_at).toLocaleDateString()}</td>
    `;
    tr.querySelector('select').addEventListener('change', (evt) =>
      updateEnquiryStatus(row.id, evt.target.value)
    );
    enquiriesTableBody.appendChild(tr);
  });
};

const loadEnquiries = async () => {
  if (!requireAdminSession()) return;
  const res = await authorizedFetch(`${API_BASE}/enquiries`);
  const data = await res.json();
  renderEnquiries(data);
};

const updateEnquiryStatus = async (id, status) => {
  const res = await authorizedFetch(`${API_BASE}/enquiries/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) {
    showAdminToast(data.message || 'Unable to update status');
    return;
  }
  showAdminToast('Status updated');
};

const renderDeliveries = (rows) => {
  deliveriesTableBody.innerHTML = '';
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.order_ref}</td>
      <td>${row.customer_name || 'TBD'}</td>
      <td>${row.status}</td>
      <td>${row.expected_date ? new Date(row.expected_date).toLocaleDateString() : '—'}</td>
      <td>${row.notes || ''}</td>
      <td>
        <button class="btn ghost" data-update="${row.id}">Update</button>
      </td>
    `;
    tr.querySelector('button').addEventListener('click', () => populateDeliveryForm(row));
    deliveriesTableBody.appendChild(tr);
  });
};

const loadDeliveries = async () => {
  if (!requireAdminSession()) return;
  const res = await authorizedFetch(`${API_BASE}/deliveries`);
  const data = await res.json();
  renderDeliveries(data);
};

const populateDeliveryForm = (delivery) => {
  deliveryForm.hidden = false;
  deliveryForm.dataset.id = delivery.id;
  deliveryOrderRef.value = delivery.order_ref;
  deliveryStatus.value = delivery.status;
  deliveryExpected.value = delivery.expected_date
    ? delivery.expected_date.split('T')[0]
    : '';
  deliveryNotes.value = delivery.notes || '';
};

toggleDeliveryFormBtn?.addEventListener('click', () => {
  if (deliveryForm.hidden) {
    deliveryForm.hidden = false;
    delete deliveryForm.dataset.id;
    deliveryForm.reset();
  } else {
    deliveryForm.hidden = true;
    deliveryForm.reset();
    delete deliveryForm.dataset.id;
  }
});

deliveryForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if (!requireAdminSession()) return;
  const payload = {
    orderRef: deliveryOrderRef.value,
    status: deliveryStatus.value,
    expectedDate: deliveryExpected.value || null,
    notes: deliveryNotes.value
  };
  const method = deliveryForm.dataset.id ? 'PATCH' : 'POST';
  const url =
    method === 'PATCH'
      ? `${API_BASE}/deliveries/${deliveryForm.dataset.id}`
      : `${API_BASE}/deliveries`;
  const res = await authorizedFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    deliveryFormFeedback.textContent = data.message || 'Unable to save delivery';
    deliveryFormFeedback.className = 'form-feedback error';
    return;
  }
  deliveryFormFeedback.textContent = 'Delivery saved';
  deliveryFormFeedback.className = 'form-feedback success';
  loadDeliveries();
  setTimeout(() => {
    deliveryForm.hidden = true;
    deliveryForm.reset();
    delete deliveryForm.dataset.id;
    deliveryFormFeedback.textContent = '';
  }, 1200);
});

const handleAdminSession = () => {
  if (adminToken && adminUser) {
    showAdminToast(`Welcome ${adminUser.name}`);
    loadProducts();
    loadCustomers();
    loadEnquiries();
    loadDeliveries();
  }
};

adminLoginForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  adminLoginFeedback.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: adminLoginIdentifier.value,
        password: adminLoginPassword.value
      })
    });
    const data = await res.json();
    if (!res.ok) {
      adminLoginFeedback.textContent = data.message || 'Unable to login';
      adminLoginFeedback.className = 'form-feedback error';
      return;
    }
    if (data.user.role !== 'admin') {
      adminLoginFeedback.textContent = 'Admin access only';
      adminLoginFeedback.className = 'form-feedback error';
      return;
    }
    adminToken = data.token;
    adminUser = data.user;
    localStorage.setItem('pp_admin_token', adminToken);
    localStorage.setItem('pp_admin_user', JSON.stringify(adminUser));
    adminLoginFeedback.textContent = 'Login successful';
    adminLoginFeedback.className = 'form-feedback success';
    handleAdminSession();
  } catch (error) {
    adminLoginFeedback.textContent = 'Network error';
    adminLoginFeedback.className = 'form-feedback error';
  }
});

adminLogoutBtn?.addEventListener('click', () => {
  adminToken = null;
  adminUser = null;
  localStorage.removeItem('pp_admin_token');
  localStorage.removeItem('pp_admin_user');
  showAdminToast('Logged out');
});

handleAdminSession();

