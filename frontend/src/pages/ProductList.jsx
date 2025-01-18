import React, { useState, useEffect } from 'react'
import { getProducts } from '../utils/api'
import { useAuth } from '../utils/AuthContext'
import { useCart } from '../utils/CartContext'
import { toast } from 'react-toastify'

function ProductList() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [quantities, setQuantities] = useState({}) // Track quantities for each product
  
  const { user } = useAuth()
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
      
      // Initialize quantities with 0 for each product
      const initialQuantities = data.reduce((acc, product) => {
        acc[product._id] = 0
        return acc
      }, {})
      setQuantities(initialQuantities)
      
      setError('')
    } catch (err) {
      setError('Failed to fetch products: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (productId, newQuantity) => {
    // Ensure quantity is not negative and is a number
    const sanitizedQuantity = Math.max(0, Number(newQuantity))
    
    setQuantities(prev => ({
      ...prev,
      [productId]: sanitizedQuantity
    }))
  }

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Please log in to add items to cart')
      return
    }

    const quantity = quantities[product._id]

    if (quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    // Create a new product object with the specified quantity
    const productToAdd = {
      ...product,
      quantity: quantity
    }

    addToCart(productToAdd)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p>Loading...</p>}
      
      {products.length === 0 ? (
        <p>No products available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product._id} 
              className="bg-white shadow-md rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              {product.image && (
                <img 
                  src={`https://vendor-app-8wrx.onrender.com/uploads/${product.image}`} 
                  alt={product.name} 
                  className="w-full h-48 object-cover" 
                />
              )}
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                <p className="text-gray-700 text-base mb-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-green-600 font-semibold">₹{product.price}</span>
                  <span className="text-gray-500">Stock: {product.stock}</span>
                </div>
                
                {user && user.role === 'vendor' && (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="number"
                      value={quantities[product._id] || 0}
                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                      min="0"
                      max={product.stock}
                      className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-grow bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
                      disabled={quantities[product._id] === 0 || quantities[product._id] > product.stock}
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductList