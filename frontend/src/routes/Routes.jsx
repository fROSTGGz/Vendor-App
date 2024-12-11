import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import VendorRequest from '../pages/Auth/VendorRequest';
import UserDashboard from '../pages/Dashboard/UserDashboard';
import VendorDashboard from '../pages/Dashboard/VendorDashboard';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';
import ProductManagement from '../pages/Products/ProductManagement';
import OrderHistory from '../pages/Orders/OrderHistory';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vendor-request" element={<VendorRequest />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        
        {/* Vendor Routes */}
        <Route element={<PrivateRoute allowedRoles={['vendor']} />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<ProductManagement />} />
          <Route path="/vendor/orders" element={<OrderHistory />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;