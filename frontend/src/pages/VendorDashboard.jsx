import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api';

function VendorDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
        return;
      }

      if (file.size > maxSize) {
        setError('File is too large. Maximum size is 5MB.');
        return;
      }

      setNewProduct(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate required fields
      if (!newProduct.name || !newProduct.price || !newProduct.category) {
        setError('Please fill in all required fields');
        return;
      }

      // Create a new object with the product details
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        category: newProduct.category,
        stock: newProduct.stock || 0,
      };

      // If an image is present, use FormData
      if (newProduct.image) {
        const formData = new FormData();

        // Append text fields
        Object.keys(productData).forEach(key => {
          formData.append(key, productData[key]);
        });

        // Append image file
        formData.append('image', newProduct.image);

        // Send the product data with image
        await createProduct(formData);
      } else {
        // Send product data without image
        await createProduct(productData);
      }

      // Reset form and state
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null,
      });

      // Refresh products list
      fetchProducts();
      setError('');
    } catch (err) {
      console.error('Product creation error:', err);
      setError(`Failed to create product: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (id, updatedProduct) => {
    try {
      setLoading(true);
      await updateProduct(id, updatedProduct);
      fetchProducts();
      setError('');
    } catch (err) {
      setError('Failed to update product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      setLoading(true);
      await deleteProduct(id);
      fetchProducts();
      setError('');
    } catch (err) {
      setError('Failed to delete product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== 'vendor') {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Vendor Dashboard</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
        </div>
      )}

      <form onSubmit={handleCreateProduct} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
            <input
              type="text"
              id="name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price</label>
            <input
              type="number"
              id="price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              id="description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <input
              type="text"
              id="category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-gray-700 text-sm font-bold mb-2">Stock</label>
            <input
              type="number"
              id="stock"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow- outline"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">Image</label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {newProduct.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Selected file: {newProduct.image.name}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white shadow-md rounded-lg overflow-hidden transform transition duration-300 hover:scale-105"
          >
            {product.image && (
              <img
                src={`http://localhost:4000/uploads/${product.image}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-xl mb-2">{product.name}</h3>
              <p className="text-gray-700 text-base mb-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-semibold">₹{product.price}</span>
                <span className="text-gray-500">Stock: {product.stock}</span>
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => handleUpdateProduct(product._id, {
                    ...product,
                    stock: product.stock + 1
                  })}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition duration-300"
                  disabled={loading}
                >
                  Add Stock
                </button>
                <button
                  onClick={() => handleUpdateProduct(product._id, {
                    ...product,
                    stock: Math.max(0, product.stock - 1) // Ensure stock doesn't go below 0
                  })}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-300"
                  disabled={loading || product.stock <= 0} // Disable when stock is 0
                >
                  Decrease Stock
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-300"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VendorDashboard;