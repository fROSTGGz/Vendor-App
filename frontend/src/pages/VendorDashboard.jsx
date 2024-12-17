import React, { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api'

function VendorDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
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
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          formData.append(key, value); // Append image if it's a File
        } else {
          formData.append(key, value); // Append other fields as is
        }
      });

      // Check the contents of FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      await createProduct(formData)
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null
      })
      fetchProducts()
      setError('')
    } catch (err) {
      setError('Failed to create product: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProduct = async (id, updatedProduct) => {
    try {
      setLoading(true)
      await updateProduct(id, updatedProduct)
      fetchProducts()
      setError('')
    } catch (err) {
      setError('Failed to update product: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    try {
      setLoading(true)
      await deleteProduct(id)
      fetchProducts()
      setError('')
    } catch (err) {
      setError('Failed to delete product: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (user.role !== 'vendor') {
    return <div>You do not have permission to access this page.</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vendor Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p>Loading...</p>}
      <form onSubmit={handleCreateProduct} className="mb-8 space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">Product Name</label>
          <input
            type="text"
            id="name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-1">Description</label>
          <textarea
            id="description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="price" className="block mb-1">Price</label>
          <input
            type="number"
            id="price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block mb-1">Category</label>
          <input
            type="text"
            id="category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="stock" className="block mb-1">Stock</label>
          <input
            type="number"
            id="stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="image" className="block mb-1">Image</label>
          <input
            type="file"
            id="image"
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
          Create Product
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded">
            <h3 className="font-bold">{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Category: {product.category}</p>
            <p>Stock: {product.stock}</p>
            <button
              onClick={() => handleDeleteProduct(product._id)}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
              disabled={loading}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VendorDashboard

