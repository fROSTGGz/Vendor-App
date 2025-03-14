import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';

// Create a product
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, vendorId } = req.body;
    
    // Validate vendor exists and has vendor role
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      res.status(400);
      throw new Error('Invalid vendor ID or vendor role');
    }

    // Update image handling
    const image = req.file 
      ? `/uploads/${req.file.filename}` 
      : null;

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image, // Store full path
      vendor: vendorId,
    });

    const createdProduct = await product.save();

    // Make the product accessible to all vendors
    const vendors = await User.find({ role: 'vendor' });
    for (const vendor of vendors) {
      await User.findByIdAndUpdate(
        vendor._id,
        { $push: { products: createdProduct._id } },
        { new: true }
      );
    }

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    console.log(users);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = req.body.role || user.role;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('vendor', 'name')
      .populate({
        path: 'orderItems.product',
        select: 'name stock',
        // Handle deleted products
        match: { _id: { $exists: true } }
      });

    const detailedOrders = orders.map(order => {
      const productDetails = order.orderItems.map(item => {
        const product = item.product || { stock: null };
        return {
          productName: product?.name || 'Product Unavailable',
          initialStock: product?.stock !== undefined 
            ? (product.stock || 0) + item.quantity 
            : 'N/A',
          quantityCheckedOut: item.quantity,
          remainingStock: product?.stock !== undefined 
            ? product.stock 
            : 'N/A'
        };
      });

      return {
        ...order.toObject(),
        productDetails,
        user: order.user,
        vendor: order.vendor,
        totalPrice: order.totalPrice
      };
    });

    res.status(200).json(detailedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      message: 'Failed to fetch orders',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};