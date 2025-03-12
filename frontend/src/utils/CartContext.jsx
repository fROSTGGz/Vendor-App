import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    try {
      // Validate product object
      if (!product || !product._id || !product.name || isNaN(product.price)) {
        console.error('Invalid product object:', product);
        return;
      }

      // Validate and parse quantity
      const quantity = Math.max(0, parseFloat(product.quantity) || 1);
      if (isNaN(quantity)) {
        console.error('Invalid quantity:', product.quantity);
        return;
      }

      setCart((prevCart) => {
        const existingProductIndex = prevCart.findIndex(
          (item) => item._id === product._id
        );

        if (existingProductIndex > -1) {
          // If product exists, update quantity
          const updatedCart = [...prevCart];
          updatedCart[existingProductIndex] = {
            ...updatedCart[existingProductIndex],
            quantity: parseFloat(updatedCart[existingProductIndex].quantity) + quantity
          };
          return updatedCart;
        }

        // If product doesn't exist, add it to the cart
        return [
          ...prevCart,
          {
            ...product,
            quantity: quantity,
            price: parseFloat(product.price) // Ensure price is a number
          }
        ];
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId
          ? { ...item, quantity: Math.max(0, parseFloat(quantity)) }
          : item
      ).filter(item => item.quantity > 0) // Remove items with 0 quantity
    );
  };

  const clearCart = () => {
    setCart([]);
  };

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
  );
};