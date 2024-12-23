// In frontend/src/pages/VendorDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVendorDetails } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function VendorDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        const data = await getVendorDetails(id);
        setVendor(data.vendor);
        setProducts(data.products);
        setSalesData(data.salesData);
      } catch (err) {
        setError('Failed to fetch vendor details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchVendorDetails();
    }
  }, [id, user]);

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Access Denied</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">{vendor.name}'s Vendor Profile</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Vendor Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Vendor Information</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Name:</strong> {vendor.name}</p>
              <p><strong>Email:</strong> {vendor.email}</p>
              <p><strong>Registered On:</strong> {new Date(vendor.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Product Summary */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Product Summary</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Total Products:</strong> {products.length}</p>
              <p><strong>Total Stock:</strong> {products.reduce((sum, product) => sum + product.stock, 0)}</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Product Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">Product Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Initial Stock</th>
                  <th className="p-3 text-right">Sold Quantity</th>
                  <th className="p-3 text-right">Remaining Stock</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map(({ product, soldQuantity, remainingStock }) => (
                  <tr key={product._id} className="border-b hover:bg-gray-100">
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3 text-right">₹{product.price}</td>
                    <td className="p-3 text-right">{product.stock + soldQuantity}</td>
                    <td className="p-3 text-right">{soldQuantity}</td>
                    <td className="p-3 text-right">{remainingStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorDetails;