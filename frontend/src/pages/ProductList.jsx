import React, { useState, useEffect } from 'react'
import { getProducts } from '../utils/api'
import { useAuth } from '../utils/AuthContext'

function ProductList() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
      setError('')
    } catch (err) {
      setError('Failed to fetch products: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    // Implement cart functionality
    console.log('Added to cart:', product)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2" />
            <h3 className="font-bold">{product.name}</h3>
            <p>Price: ${product.price}</p>
            {user && user.role !== 'vendor' && (
              <button
                onClick={() => addToCart(product)}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList

