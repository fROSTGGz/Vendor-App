const API_URL = 'http://localhost:4000/api'

async function fetchWithAuth(url, options = {}) {
  const user = JSON.parse(localStorage.getItem('user'))
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`
  }

  const response = await fetch(url, { ...options, headers })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

export async function loginUser(email, password) {
  return fetchWithAuth(`${API_URL}/users/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registerUser(name, email, password) {
  return fetchWithAuth(`${API_URL}/users/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export async function getProducts() {
  return fetchWithAuth(`${API_URL}/products`)
}

export async function createProduct(productData) {
  return fetchWithAuth(`${API_URL}/products`, {
    method: 'POST',
    body: productData,
    headers: {},
  })
}

export async function updateProduct(id, productData) {
  return fetchWithAuth(`${API_URL}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  })
}

export async function deleteProduct(id) {
  return fetchWithAuth(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  })
}

export async function getAllUsers() {
  return fetchWithAuth(`${API_URL}/admin/users`)
}

export async function updateUserRole(userId, role) {
  return fetchWithAuth(`${API_URL}/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  })
}

export async function getAllOrders() {
  return fetchWithAuth(`${API_URL}/admin/orders`)
}

export async function createOrder(orderData) {
  return fetchWithAuth(`${API_URL}/orders`, {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

export async function requestVendorStatus() {
  return fetchWithAuth(`${API_URL}/vendors/request`, {
    method: 'POST',
  })
}

