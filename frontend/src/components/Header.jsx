import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

// Import images from the Images folder
import logo1 from './Images/pic3.jpeg';
import logo2 from './Images/pic2.png';
import logo3 from './Images/pic1.gif';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo section */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="block">
            <img src={logo1} alt="Logo 1" className="h-10 w-auto" />
          </Link>
          <Link to="/" className="block">
            <img src={logo2} alt="Logo 2" className="h-10 w-auto" />
          </Link>
          <Link to="/" className="block">
            <img src={logo3} alt="Logo 3" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Navigation links */}
        <div className="flex items-center space-x-4">
          {/* Home button for non-admin users */}
          {user && user.role !== 'admin' && (
            <Link to="/" className="text-gray-600 hover:text-gray-800 mr-4">
              Home
            </Link>
          )}

          {user ? (
            <>
              {user.role === 'vendor' && (
                <Link to="/vendor" className="text-gray-600 hover:text-gray-800">
                  Sristi Kheduthaat
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-gray-800">
                  Sristi Kheduthaat's Admin Dashboard
                </Link>
              )}
              {/* Cart button for non-admin users */}
              {user.role !== 'admin' && (
                <Link to="/cart" className="text-gray-600 hover:text-gray-800 mr-4">
                  Cart
                </Link>
              )}
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-gray-800 mr-4">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;