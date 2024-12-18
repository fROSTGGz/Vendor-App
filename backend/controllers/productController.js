import Product from '../models/productModel.js';

export const createProduct = async (req, res, next) => {
  try {
    console.log('Received product data:', req.body);

    const { name, description, price, category, stock } = req.body;
    let image_filename = req.file ? req.file.filename : null;
    let image = req.file ? req.file.path : null;

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: image_filename, // Storing the filename
      vendor: req.user._id, // Assign the current user as vendor
    });

    console.log('Creating product:', product);
    const createdProduct = await product.save();
    console.log('Product created:', createdProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      // If no authentication, return all products
      const products = await Product.find({});
      return res.json(products);
    }

    // Check user role; vendors see only their products
    const query = req.user.role === 'vendor' 
      ? { vendor: req.user._id } 
      : {};

    console.log('Fetching products with query:', query);
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
};
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Ensure the product belongs to the current vendor or user is an admin
    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this product');
    }

    // Update product fields
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock || product.stock;

    if (req.file) {
      product.image = req.file.path; // Update image if a new one is uploaded
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Ensure the product belongs to the current vendor or user is an admin
    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this product');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    next(error);
  }
};
