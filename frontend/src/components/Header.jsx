import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-800">Vendor App</Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {user.role === 'vendor' && <Link to="/vendor" className="text-gray-600 hover:text-gray-800">Vendor Dashboard</Link>}
              {user.role === 'admin' && <Link to="/admin" className="text-gray-600 hover:text-gray-800">Admin Dashboard</Link>}
              <Link to="/cart" className="text-gray-600 hover:text-gray-800">Cart</Link>
              <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-gray-800">Login</Link>
              <Link to="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header

