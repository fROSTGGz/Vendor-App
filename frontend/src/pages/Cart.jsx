import React, { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext.jsx'
import { createOrder } from '../utils/api'

function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    // Load cart items from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart')) || []
    setCartItems(savedCart)
  }, [])

  const updateCart = (newCart) => {
    setCartItems(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item._id === product._id)
    if (existingItem) {
      const updatedCart = cartItems.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      )
      updateCart(updatedCart)
    } else {
      updateCart([...cartItems, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item._id !== productId)
    updateCart(updatedCart)
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return
    const updatedCart = cartItems.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    )
    updateCart(updatedCart)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  }

  const handleCheckout = async () => {
    try {
      const order = {
        orderItems: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price
        })),
        totalPrice: calculateTotal()
      }
      await createOrder(order)
      updateCart([])
      alert('Order placed successfully!')
    } catch (err) {
      setError('Failed to place order')
    }
  }

  if (!user) {
    return <div>Please login to view your cart.</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover mr-4" />
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p>Price: ${item.price}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="ml-4 text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xl font-bold">Total: ${calculateTotal()}</p>
            <button
              onClick={handleCheckout}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
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

