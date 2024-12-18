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
      const existingProduct = prevCart.find((item) => item._id === product._id)
  
      if (existingProduct) {
        // Update existing product's quantity
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: parseFloat(item.quantity) + 0.1 }
            : item
        )
      }
  
      // Add new product with initial quantity 0.1
      return [
        ...prevCart,
        { ...product, quantity: 0.1 }
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
      )
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
