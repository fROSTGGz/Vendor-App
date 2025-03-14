import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { getProducts } from '../utils/api';
import { useCart } from '../utils/CartContext';

function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});
  const [marketplace, setMarketplace] = useState('Dr. Babasaheb Ambedkar Open University Campus(');
  
  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [user]);

  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, Number(value))
    }));
  };

  const handleAddToCart = (product) => {
    console.log('Adding product:', product);
    console.log('Selected quantity:', quantities[product._id]);

    addToCart({
      ...product,
      quantity: quantities[product._id] || 1,
      price: parseFloat(product.price),
      marketplace // Include selected marketplace
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Confirmed Products</h2>

      <select
        value={marketplace}
        onChange={(e) => setMarketplace(e.target.value)}
        className="border p-2 mb-4"
      >
        <option value="Dr. Babasaheb Ambedkar Open University Campus">Dr. Babasaheb Ambedkar Open University Chharodi AHM</option>
        <option value="Shri Bhagwat Vidyapeeth Temple">Shri Bhagwat Vidyapeeth Sola AHM</option>
        <option value="Atma vikasa parisara">Atma vikasa parisara Palodia AHM</option>
        <option value="Navjeevan Trust Campus">Navjeevan Trust AHM</option>
        <option value="Gayatri Temple Trust Campus">Gayatri Temple Trust Sector-1 Gandhinagar</option>
        <option value="SRISTI: Sristi Campus">SRISTI: Sristi Campus AHM</option>
        <option value="Vallabh Vidyanagar, Anand">Vallabh Vidyanagar, Anand</option>
        <option value="Sardar Vallabhbhai Patel University (SPU) Bhaikaka Library Campus">Sardar Vallabhbhai Patel University (SPU) Vallabh Vidyanagar</option>
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product._id} className="border p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">Price: ₹{product.price}</p>
            <p className="text-gray-600">Stock: {product.stock}</p>
            <img
              src={`/uploads/${product.image}`}
              alt={product.name}
              className="mt-2 h-40 w-full object-cover"
            />

            {/* Add Quantity Input and Cart Button */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={quantities[product._id] || ''}
                onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                className="w-20 px-2 py-1 border rounded"
                placeholder="Qty"
              />
              <button
                onClick={() => handleAddToCart(product)}
                className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded
                  ${(quantities[product._id] || 0) > product.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={(quantities[product._id] || 0) > product.stock}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;