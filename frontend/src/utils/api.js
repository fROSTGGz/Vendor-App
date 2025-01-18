const API_URL = 'https://vendor-app-8wrx.onrender.com/api'

async function fetchWithAuth(url, options = {}) {
  console.log(options);
  const user = JSON.parse(localStorage.getItem('user'));
  console.log(options.headers);
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
    options.body = JSON.stringify(options.body); // Stringify JSON body
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

export async function loginUser(email, password) {
  return fetchWithAuth(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export async function registerUser(name, email, password) {
  return fetchWithAuth(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
}

export async function getProducts() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const headers = {};
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }

  return fetchWithAuth(`${API_URL}/products`, {
    method: 'GET',
    headers: headers
  });
}



export async function createProduct(productData) {
  return fetchWithAuth(`${API_URL}/products`, {
    method: 'POST',
    body: productData,
  })
}

  // const formData = new FormData();
  // for (const [key, value] of Object.entries(productData)) {
  //   formData.append(key, value);
  // }
  // console.log(formData);
  

  export async function updateProduct(id, productData) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(productData)) {
      if (key === "image" && value instanceof File) {
        formData.append(key, value); // Append image if it's a File
      } else {
        formData.append(key, value); // Append other fields as is
      }
    }
  
    return fetchWithAuth(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: formData,
    });
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
}

export async function getAllOrders() {
  return fetchWithAuth(`${API_URL}/admin/orders`)
}

export async function createOrder(orderData) {
  return fetchWithAuth(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  })
}

export async function requestVendorStatus() {
  return fetchWithAuth(`${API_URL}/vendors/request`, {
    method: 'POST',
  })
}

export async function getAllVendorsWithProducts() {
  return fetchWithAuth(`${API_URL}/admin/vendors`);
}

export async function deleteVendorProduct(productId) {
  return fetchWithAuth(`${API_URL}/admin/products/${productId}`, {
    method: 'DELETE',
  });
}

export async function updateVendorProductStatus(productId, updates) {
  return fetchWithAuth(`${API_URL}/admin/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function downloadVendorsPDF() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  try {
    const response = await fetch(`${API_URL}/admin/vendors/download/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor_report.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error('PDF Download Error:', error);
    throw error;
  }
}
export async function downloadVendorsCSV() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const response = await fetch(`${API_URL}/admin/vendors/download/csv`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to download CSV');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vendors_report.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
export async function getVendorDetails(vendorId) {
  return fetchWithAuth(`${API_URL}/admin/vendors/${vendorId}`);
}

