import React, { useState, useEffect } from 'react'
import { useCart } from '../utils/CartContext'
import { useAuth } from '../utils/AuthContext'
import { createOrder } from '../utils/api'
import { toast } from 'react-toastify'

function Cart() {
  const { user } = useAuth()
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart()

  // State to track vendor-specific cart items
  const [vendorCart, setVendorCart] = useState([])
  const [checkoutMarketplace, setCheckoutMarketplace] = useState('thursday haat')

  // Use all cart items instead of filtering by vendor
  useEffect(() => {
    setVendorCart(cart);
  }, [cart]);

  const calculateTotal = () => {
    return vendorCart.reduce((total, item) => 
      total + (parseFloat(item.price) * parseFloat(item.quantity)), 0
    ).toFixed(2)
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    const sanitizedQuantity = Math.max(0, parseFloat(newQuantity) || 0)
    updateQuantity(itemId, sanitizedQuantity)
  }

  const handleCheckout = async () => {
    try {
      if (vendorCart.length === 0) {
        toast.error('Your cart is empty')
        return
      }
  
      const order = {
        orderItems: vendorCart.map(item => ({
          product: item._id,
          name: item.name,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price)
        })),
        totalPrice: parseFloat(calculateTotal()),
        marketplace: checkoutMarketplace
      }
  
      await createOrder(order)
      clearCart()
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error('Checkout failed', error)
      toast.error('Failed to place order')
    }
  }

  if (!user || user.role !== 'vendor') {
    return (
      <div className="text-center text-red-500 mt-8">
        <p>You do not have permission to access the cart.</p>
        <p>Only vendors can view and manage cart items.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      
      <select
        value={checkoutMarketplace}
        onChange={(e) => setCheckoutMarketplace(e.target.value)}
        className="border p-2 mb-4"
      >
        <option value="thursday haat">Thursday Haat</option>
        <option value="sunday haat">Sunday Haat</option>
        <option value="navjeevan haat">Navjeevan Haat</option>
      </select>

      {vendorCart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty</p>
      ) : (
        <>
          {vendorCart.map((item) => (
            <div 
              key={item._id} 
              className="flex justify-between items-center border-b py-4"
            >
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-gray-600">Price: ₹{parseFloat(item.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                    step="0.1"
                    min="0"
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div>
                <p className="font-bold">Subtotal: ₹{(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2)}</p>
              </div>
            </div>
          ))}
          
          <div className="mt-6 flex justify-between items-center">
            <h3 className="text-xl font-bold">
              Total: ₹{calculateTotal()}
            </h3>
            <button 
              onClick={handleCheckout}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart