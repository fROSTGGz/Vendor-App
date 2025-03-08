import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import VendorDetails from './pages/VendorDetails';
import { AuthProvider } from './utils/AuthContext.jsx';
import { CartProvider } from './utils/CartContext.jsx';
import { ProductProvider } from './utils/ProductContext';
import PrivateRoute from './components/PrivateRoute'; // Ensure PrivateRoute is correctly implemented

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="container mx-auto mt-4 p-4">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/cart" element={<Cart />} />

                {/* Protected routes */}
                <Route path="/vendor" element={<VendorDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route
                  path="/vendors/:id"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <VendorDetails />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;