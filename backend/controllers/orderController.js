import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

export const createOrder = async (req, res) => {
  const { orderItems, totalPrice } = req.body;

  try {
    // Find the vendor of the first product in the order
    const firstProduct = await Product.findById(orderItems[0].product);
    
    // Create an array to store product details for order tracking
    const productDetails = [];

    // Process each order item and update stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      // Check if there's sufficient stock
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}` 
        });
      }

      // Directly reduce the stock
      product.stock -= item.quantity;
      await product.save();

      // Store product details for order tracking
      productDetails.push({
        productName: product.name,
        initialStock: product.stock + item.quantity, // Original stock before reduction
        quantityCheckedOut: item.quantity,
        remainingStock: product.stock // Remaining stock after reduction
      });
    }

    // Create the order
    const order = new Order({
      user: req.user._id,
      vendor: firstProduct.vendor,
      orderItems,
      totalPrice,
      productDetails // Include product details in the order
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Add this function to get user's orders
export const getUserOrders = async (req, res) => {
  try {
    // Find orders for the logged-in user
    const orders = await Order.find({ user: req.user._id })
      .populate('vendor', 'name') // Populate vendor details
      .populate({
        path: 'orderItems.product',
        select: 'name image' // Populate product details
      })
      .sort({ createdAt: -1 }); // Sort by most recent first

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      message: 'Error fetching orders', 
      error: error.message 
    });
  }
};