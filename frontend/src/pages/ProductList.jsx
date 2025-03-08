// ProductList.jsx (vendor view)
import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { getProducts } from '../utils/api';

function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get only confirmed products for this vendor
        const data = await getProducts();
        const vendorProducts = data.filter(p => 
          p.vendor?._id === user?._id && p.confirmed
        );
        setProducts(vendorProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Confirmed Products</h2>
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;