import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.jsx';
import ProductList from './ProductList';

function Home() {
  const { user } = useAuth();

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Vendor App</h1>
        {!user && (
          <div className="space-x-4">
            <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Login
            </Link>
            <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Register
            </Link>
          </div>
        )}
        {user && user.role === 'user' && (
          <Link to="/vendor" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
            Request to be a Vendor
          </Link>
        )}
      </div>

      {/* Only show ProductList for vendors */}
      {user && user.role === 'vendor' && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-4">Your Products</h2>
          <ProductList />
        </div>
      )}
    </div>
  );
}

export default Home;
