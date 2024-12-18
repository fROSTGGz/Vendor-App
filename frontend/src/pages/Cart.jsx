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

  // Effect to filter cart items for the current vendor
  useEffect(() => {
    if (user && user.role === 'vendor') {
      const vendorCartItems = cart.filter(item => 
        item.vendor && item.vendor.toString() === user._id.toString()
      )
      setVendorCart(vendorCartItems)
    }
  }, [cart, user])

  const calculateTotal = () => {
    return vendorCart.reduce((total, item) => 
      total + (parseFloat(item.price) * parseFloat(item.quantity)), 0
    ).toFixed(2)
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    // Allow decimal input, but convert to a reasonable quantity
    const sanitizedQuantity = Math.max(0, parseFloat(newQuantity) || 0)
    updateQuantity(itemId, sanitizedQuantity)
  }

  const handleCheckout = async () => {
    try {
      // Ensure there are items in the cart
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
        totalPrice: parseFloat(calculateTotal())
      }

      // Create the order
      await createOrder(order)
      
      // Clear the cart after successful order
      clearCart()
      
      // Show success message
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error('Checkout failed', error)
      toast.error('Failed to place order')
    }
  }

  // If user is not a vendor, show access denied message
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
      //console.log(newProduct);

      // const formData = new FormData()
      // formData.append('name', newProduct.name)
      // formData.append('description', newProduct.description)
      // formData.append('price', newProduct.price)
      // formData.append('category', newProduct.category)
      // formData.append('stock', newProduct.stock)
      // if (newProduct.image) {
      //   formData.append('image', newProduct.image)
      // }
      //console.log(formData);
      // const formData = new FormData();
      // Object.entries(newProduct).forEach(([key, value]) => {
      //   if (key === "image" && value instanceof File) {
      //     formData.append(key, value); // Append image if it's a File
      //   } else {
      //     formData.append(key, value); // Append other fields as is
      //   }
      // });

      // Check the contents of FormData
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }