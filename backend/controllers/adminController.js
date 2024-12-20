import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
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
      vendor: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

export const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

export const updateUserRole = async (req, res) => {
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
    res.status(404);
    throw new Error('User not found');
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email') // Populate user details
      .populate('vendor', 'name') // Populate vendor details
      .populate({
        path: 'orderItems.product',
        select: 'name stock' // Select only name and stock of the product
      });

    // Transform orders to include detailed product information
    const detailedOrders = orders.map(order => {
      const productDetails = order.orderItems.map(item => ({
        productName: item.product?.name || 'Unknown', // Handle missing product data
        initialStock: item.product?.stock !== undefined 
          ? item.product.stock + item.quantity 
          : 'N/A', // Calculate initial stock safely
        quantityCheckedOut: item.quantity,
        remainingStock: item.product?.stock !== undefined 
          ? item.product.stock 
          : 'N/A' // Handle missing stock
      }));

      return {
        ...order.toObject(), // Convert to plain object
        productDetails,
        user: order.user,
        vendor: order.vendor,
        totalPrice: order.totalPrice
      };
    });

    res.status(200).json(detailedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};
