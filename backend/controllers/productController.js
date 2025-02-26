import Product from '../models/productModel.js';

// Create a product
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const image_filename = req.file ? req.file.filename : null;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: image_filename,
      vendor: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

// Get all products
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
};

// Get a product by ID
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

// Update a product
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Ensure the product belongs to the current vendor
    if (product.vendor.toString() !== req.user._id.toString()) {
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

// Delete a product
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Ensure the product belongs to the current vendor
    if (product.vendor.toString() !== req.user._id.toString()) {
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
