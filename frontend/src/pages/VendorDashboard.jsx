import React, { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext.jsx'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api'

function VendorDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: null })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      setError('Failed to fetch products')
    }
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', newProduct.name)
      formData.append('price', newProduct.price)
      formData.append('image', newProduct.image)
      await createProduct(formData)
      setNewProduct({ name: '', price: '', image: null })
      fetchProducts()
    } catch (err) {
      setError('Failed to create product')
    }
  }

  const handleUpdateProduct = async (id, updatedProduct) => {
    try {
      await updateProduct(id, updatedProduct)
      fetchProducts()
    } catch (err) {
      setError('Failed to update product')
    }
  }

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id)
      fetchProducts()
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  if (user.role !== 'vendor') {
    return <div>You do not have permission to access this page.</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vendor Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleCreateProduct} className="mb-8 space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">Product Name</label>
          <input
            type="text"
            id="name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="price" className="block mb-1">Price</label>
          <input
            type="number"
            id="price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="image" className="block mb-1">Image</label>
          <input
            type="file"
            id="image"
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Create Product
        </button>
      </form>
      <h3 className="text-xl font-bold mb-4">Your Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2" />
            <h4 className="font-bold">{product.name}</h4>
            <p>Price: ${product.price}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleUpdateProduct(product._id, { ...product, price: product.price + 1 })}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
              >
                Update Price
              </button>
              <button
                onClick={() => handleDeleteProduct(product._id)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VendorDashboard

