import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext.jsx';
import {
  getAllUsers,
  updateUserRole,
  getAllOrders,
  downloadVendorsPDF,
  downloadVendorsCSV,
  createProduct,
  getAllVendorsWithProducts,
  getProducts, // Use the existing getProducts function
} from '../utils/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const { user } = useAuth(); // Ensure user is defined
  if (!user) {
    return <div>You do not have permission to access this page.</div>;
  }
  
  if (user.role !== 'admin') {
    return <div>You do not have permission to access this page.</div>;
  }

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    vendorId: '',
    image: null,
  });

  // Filters state
  const [userFilter, setUserFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchOrders();
    fetchVendors();
    fetchProducts(); // Fetch products for the vendor dashboard
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const fetchVendors = async () => {
    try {
      const data = await getAllVendorsWithProducts();
      setVendors(data);
    } catch (error) {
      setError('Failed to fetch vendors');
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts(); // Use the existing getProducts function
      setProducts(data);
    } catch (error) {
      setError('Failed to fetch products');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadVendorsPDF();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      await downloadVendorsCSV();
      toast.success('CSV downloaded successfully');
    } catch (error) {
      toast.error('Failed to download CSV');
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    setProductData((prevData) => ({ ...prevData, image: e.target.files[0] }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      await createProduct(formData);
      toast.success('Product created successfully');
      setProductData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        vendorId: '',
        image: null,
      });
      fetchProducts(); // Refresh the product list after adding a new product
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(userFilter.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (order) =>
      order._id.includes(orderFilter) ||
      (order.vendor && order.vendor.name.toLowerCase().includes(orderFilter.toLowerCase()))
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add Product Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold">Add Product</h3>
        <form onSubmit={handleProductSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={productData.name}
            onChange={handleProductChange}
            className="border p-2 mb-2 w-full rounded"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={productData.description}
            onChange={handleProductChange}
            className="border p-2 mb-2 w-full rounded"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={productData.price}
            onChange={handleProductChange}
            className="border p-2 mb-2 w-full rounded"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={productData.category}
            onChange={handleProductChange}
            className="border p-2 mb-2 w-full rounded"
            required
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={productData.stock}
            onChange={handleProductChange}
            className="border p-2 mb-2 w-full rounded"
            required
          />
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="border p-2 mb-2 w-full rounded"
            required
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Add Product
          </button>
        </form>
      </div>

      {/* Users Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Users</h3>
          <div>
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
            >
              Download PDF
            </button>
            <button
              onClick={handleDownloadCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Download CSV
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Filter by name or email"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id}>
                <td className="border p-2">{u.name}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.role}</td>
                <td className="border p-2">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                  {u.role === 'vendor' && (
                    <Link
                      to={`/vendors/${u._id}`}
                      className="text-blue-500 hover:underline ml-2"
                    >
                      View Details
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Orders Section */}
      <div>
        <h3 className="text-xl font-bold mb-2">Orders</h3>
        <input
          type="text"
          placeholder="Filter by order ID or vendor"
          value={orderFilter}
          onChange={(e) => setOrderFilter(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Vendor</th>
              <th className="border p-2">Total Price</th>
              <th className="border p-2">Product Details</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="border p-2">{order._id}</td>
                <td className="border p-2">{order.user.name}</td>
                <td className="border p-2">{order.vendor ? order.vendor.name : 'N/A'}</td>
                <td className="border p-2">₹{order.totalPrice.toFixed(2)}</td>
                <td className="border p-2">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="border p-1">Product</th>
                        <th className="border p-1">Initial Stock</th>
                        <th className="border p-1">Checked Out</th>
                        <th className="border p-1">Remaining Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.productDetails.map((product, index) => (
                        <tr key={index}>
                          <td className="border p-1">{product.productName}</td>
                          <td className="border p-1">{product.initialStock}</td>
                          <td className="border p-1">{product.quantityCheckedOut}</td>
                          <td className="border p-1">{product.remainingStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td className="border p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;