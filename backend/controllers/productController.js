import Product from '../models/productModel.js';
import User from '../models/userModel.js';

// Create a product
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, vendorId } = req.body;
    const image_filename = req.file ? req.file.filename : null;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate at least one vendor is provided
    if (!vendorId) {
      res.status(400);
      throw new Error('At least one vendor must be specified');
    }

    const product = new Product({
      vendor: vendorId,
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: image_filename,
    });

    const createdProduct = await product.save();

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { products: createdProduct._id } },
      { new: true }
    );

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};


// Get all products
// Update getProducts to include all confirmed products
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ confirmed: true })
      .populate('vendor', 'name email')
      .populate('confirmedByVendors.vendor', 'name');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Get unconfirmed products
export const getUnconfirmedProducts = async (req, res) => {
  try {
    const products = await Product.find({ confirmed: false })
      .populate('vendor', 'name email')
      .populate('confirmedByVendors.vendor', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get confirmed products for logged-in vendor
export const getVendorConfirmedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      vendor: req.user._id,
      confirmed: true,
    }).populate('vendor', 'name email');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor products', error: error.message });
  }
};

// Get vendor products
export const getVendorProducts = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id).populate('products', 'name price category stock');
    console.log(vendor);
    res.json(vendor.products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor products' });
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

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock || product.stock;

    if (req.file) {
      product.image = req.file.path;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};

// Confirm a product
export const confirmProduct = async (req, res) => {
  try {
    console.log("Hello");
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Initialize array if undefined
    if (!product.confirmedByVendors) {
      product.confirmedByVendors = [];
    }
    console.log(product,"hello");
    
    // Existing confirmation logic
    const vendorConfirmation = product.confirmedByVendors.find(
      conf => conf.vendor.toString() === req.user._id.toString()
    );
    console.log(vendorConfirmation,"hello");
    
    if (vendorConfirmation) {
      vendorConfirmation.confirmed = true;
    } else {
      product.confirmedByVendors.push({
        vendor: req.user._id,
        confirmed: true
      });
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error confirming product:', error);
    res.status(500).json({ message: 'Error confirming product', error: error.message });
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

    if (product.vendor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this product');
    }

    await Product.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { products: req.params.id } },
      { new: true }
    );

    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
};
