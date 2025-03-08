import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProducts } from './api';

const ProductContext = createContext();

export function useProducts() {
  return useContext(ProductContext);
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [needsRefresh, setNeedsRefresh] = useState(true);

  const refreshProducts = () => setNeedsRefresh(true);

  useEffect(() => {
    if (needsRefresh) {
      const fetchProducts = async () => {
        try {
          const data = await getProducts();
          setProducts(data);
          setNeedsRefresh(false);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };
      fetchProducts();
    }
  }, [needsRefresh]);

  return (
    <ProductContext.Provider value={{ products, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
}