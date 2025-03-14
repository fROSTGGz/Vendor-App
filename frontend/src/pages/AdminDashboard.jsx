import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { getAllUsers, getAllOrders, createProduct, updateUserRole, getAllVendors } from '../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null,
    vendorId: ''
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'admin') return;

      try {
        setLoading(true);
        setError(null);

        const [usersResponse, ordersResponse, vendorsResponse] = await Promise.all([
          getAllUsers(),
          getAllOrders(),
          getAllVendors()
        ]);

        setUsers(usersResponse);
        setOrders(ordersResponse);
        setVendors(vendorsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <div className="p-4 text-red-500">Unauthorized access</div>;
  }

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setProductForm(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

      if (!productForm.name || !productForm.description || !productForm.price || 
        !productForm.category || !productForm.stock) {
      setFormError('All fields are required.');
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });

      await createProduct(formData);
      setSuccessMessage('Product created successfully!');
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null,
        vendorId: ''
      });
    } catch (error) {
      console.error('Error creating product:', error);
      setFormError(error.message || 'Failed to create product');
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      <button 
        onClick={() => setShowProductForm(!showProductForm)}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {showProductForm ? 'Hide Product Form' : 'Create New Product'}
      </button>

      {showProductForm && (
        <form onSubmit={handleProductSubmit} className="mb-8 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create Product</h2>
          
          {formError && <div className="text-red-500 mb-4">{formError}</div>}
          {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Description</label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleProductFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={productForm.price}
                onChange={handleProductFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={productForm.category}
                onChange={handleProductFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={productForm.stock}
                onChange={handleProductFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Product Image</label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
                accept="image/*"
              />
            </div>

            <div>
              <label className="block mb-2">Select Vendor</label>
              <select 
                required
                value={productForm.vendorId}
                onChange={(e) => setProductForm({ ...productForm, vendorId: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Product
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <ul>
            {users.map(user => (
              <li key={user._id} className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>
                    {user.name} - {user.email} ({user.role})
                  </span>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <ul>
            {orders.map(order => (
              <li key={order._id} className="mb-2 flex items-center justify-between">
                <span>
                  Order #{order._id} - ₹{order.totalPrice}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
