import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext.jsx'

function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-blue-600 text-white">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Vendor App</Link>
        <ul className="flex space-x-4">
          <li><Link to="/" className="hover:text-blue-200">Home</Link></li>
          <li><Link to="/products" className="hover:text-blue-200">Products</Link></li>
          {user ? (
            <>
              {user.role === 'vendor' && (
                <li><Link to="/vendor" className="hover:text-blue-200">Vendor Dashboard</Link></li>
              )}
              {user.role === 'admin' && (
                <li><Link to="/admin" className="hover:text-blue-200">Admin Dashboard</Link></li>
              )}
              <li><Link to="/cart" className="hover:text-blue-200">Cart</Link></li>
              <li><button onClick={logout} className="hover:text-blue-200">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="hover:text-blue-200">Login</Link></li>
              <li><Link to="/register" className="hover:text-blue-200">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Header

