import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { getUnconfirmedProducts, getVendorConfirmedProducts, confirmProduct } from '../utils/api';
import { useProducts } from '../utils/ProductContext'; // Added import

function VendorDashboard() {
  const { user } = useAuth();
  const { refreshProducts } = useProducts(); // Added line
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let data = [];
        if (user?.role === 'vendor') {
          data = await getVendorConfirmedProducts();
        } else {
          data = await getUnconfirmedProducts();
        }
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [user]);

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleConfirmProducts = async () => {
    try {
      await Promise.all(selectedProducts.map(id => confirmProduct(id)));
      
      // Refresh global product list
      refreshProducts();
      
      // Update local state
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p._id)));
      setSelectedProducts([]);
      
      alert('Products confirmed successfully!');
    } catch (error) {
      console.error('Error confirming products:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Available Products for Confirmation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product._id} className="border p-4 rounded-lg shadow-sm">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product._id)}
                onChange={() => handleSelectProduct(product._id)}
                className="form-checkbox h-5 w-5"
              />
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">Price: ₹{product.price}</p>
                <p className="text-gray-600">Category: {product.category}</p>
              </div>
            </label>
          </div>
        ))}
      </div>
      {selectedProducts.length > 0 && (
        <button
          onClick={handleConfirmProducts}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Confirm Selected Products ({selectedProducts.length})
        </button>
      )}
    </div>
  );
}

export default VendorDashboard;
