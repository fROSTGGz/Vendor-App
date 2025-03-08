const API_URL = 'http://localhost:4000/api';

async function fetchWithAuth(url, options = {}) {
  console.log(options);
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = {
    ...options.headers,
  };

  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  if (
    options.body &&
    typeof options.body === 'object' &&
    !(options.body instanceof FormData)
  ) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || response.statusText);
  }

  return response.json();
}

export const getUnconfirmedProducts = () => {
  return fetchWithAuth(`${API_URL}/products/unconfirmed`);
};

export const confirmProduct = (productId) => 
  fetchWithAuth(`${API_URL}/products/confirm/${productId}`, { method: 'PUT' });

export const saveVendorProducts = (products) => 
  fetchWithAuth(`${API_URL}/vendors/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { products },
  });

export const loginUser = (email, password) => 
  fetchWithAuth(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email, password },
  });

export const registerUser = (name, email, password) => 
  fetchWithAuth(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { name, email, password },
  });

export const getProducts = () => 
  fetchWithAuth(`${API_URL}/products`);

export const createProduct = (productData) => 
  fetchWithAuth(`${API_URL}/products`, {
    method: 'POST',
    body: productData,
  });

export const updateProduct = (id, productData) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(productData)) {
    if (key === 'image' && value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, value);
    }
  }

  return fetchWithAuth(`${API_URL}/products/${id}`, {
    method: 'PUT',
    body: formData,
  });
};

export const deleteProduct = (id) => 
  fetchWithAuth(`${API_URL}/products/${id}`, { method: 'DELETE' });

export const getAllUsers = () => 
  fetchWithAuth(`${API_URL}/admin/users`);

export const updateUserRole = (userId, role) => 
  fetchWithAuth(`${API_URL}/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: { role },
  });

export const getAllOrders = () => 
  fetchWithAuth(`${API_URL}/admin/orders`);

export const createOrder = (orderData) => 
  fetchWithAuth(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: orderData,
  });

export const requestVendorStatus = () => 
  fetchWithAuth(`${API_URL}/vendors/request`, { method: 'POST' });

export const getAllVendorsWithProducts = () => 
  fetchWithAuth(`${API_URL}/admin/vendors`);

export const deleteVendorProduct = (productId) => 
  fetchWithAuth(`${API_URL}/admin/products/${productId}`, { method: 'DELETE' });

export const updateVendorProductStatus = (productId, updates) => 
  fetchWithAuth(`${API_URL}/admin/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: updates,
  });
  // Add new API endpoint
export const getVendorConfirmedProducts = () => {
  return fetchWithAuth(`${API_URL}/products/vendor/confirmed`);
};

export const downloadFile = async (endpoint, filename) => {
  const user = JSON.parse(localStorage.getItem('user'));
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${user.token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to download ${filename}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error('Download Error:', error);
    throw error;
  }
};

export const downloadVendorsPDF = () => downloadFile('/admin/vendors/download/pdf', 'vendor_report.pdf');
export const downloadVendorsCSV = () => downloadFile('/admin/vendors/download/csv', 'vendors_report.csv');

export const getVendorDetails = (vendorId) => 
  fetchWithAuth(`${API_URL}/admin/vendors/${vendorId}`);
