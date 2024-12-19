import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Initialize cart from localStorage
    const savedCart = localStorage.getItem('cart')
    return savedCart ? JSON.parse(savedCart) : []
  })

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex((item) => item._id === product._id)

      if (existingProductIndex > -1) {
        // If product exists, create a new array with updated quantity
        const updatedCart = [...prevCart]
        const existingProduct = updatedCart[existingProductIndex]
        
        // Add the new quantity to the existing quantity
        updatedCart[existingProductIndex] = {
          ...existingProduct,
          quantity: parseFloat(existingProduct.quantity) + parseFloat(product.quantity)
        }
        
        return updatedCart
      }

      // If product doesn't exist, add it to the cart
      return [
        ...prevCart,
        { 
          ...product, 
          quantity: parseFloat(product.quantity) 
        }
      ]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId
          ? { ...item, quantity: Math.max(0, parseFloat(quantity)) }
          : item
      ).filter(item => item.quantity > 0) // Remove items with 0 quantity
    )
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  )
}