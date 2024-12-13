import React, { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext.jsx'
import { getAllUsers, updateUserRole, getAllOrders } from '../utils/api'

function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchOrders()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (err) {
      setError('Failed to fetch users')
    }
  }

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders()
      setOrders(data)
    } catch (err) {
      setError('Failed to fetch orders')
    }
  }

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      fetchUsers()
    } catch (err) {
      setError('Failed to update user role')
    }
  }

  if (user.role !== 'admin') {
    return <div>You do not have permission to access this page.</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">Users</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="border p-2">{u.name}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.role}</td>
                <td className="border p-2">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Orders</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Vendor</th>
              <th className="border p-2">Total Price</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="border p-2">{order._id}</td>
                <td className="border p-2">{order.vendor.name}</td>
                <td className="border p-2">${order.totalPrice.toFixed(2)}</td>
                <td className="border p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard

