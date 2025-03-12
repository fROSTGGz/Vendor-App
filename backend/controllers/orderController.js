import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

export const createOrder = async (req, res) => {
  const { orderItems, totalPrice } = req.body;

  try {
    // Validate order items
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Invalid order items' });
    }

    // Validate total price
    if (isNaN(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({ message: 'Invalid total price' });
    }

    // Find the first product to get vendor
    const firstProduct = await Product.findById(orderItems[0].product);
    if (!firstProduct) {
      return res.status(404).json({ message: 'First product not found' });
    }
    if (!firstProduct.vendor) {
      return res.status(400).json({ message: 'Product vendor not found' });
    }

    // Create an array to store product details for order tracking
    const productDetails = [];

    // Process each order item and update stock
    for (const item of orderItems) {
      // Validate order item
      if (!item.product || !item.quantity || isNaN(item.quantity)) {
        return res.status(400).json({ message: 'Invalid order item' });
      }

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

      // Reduce the stock while preserving required fields
      const update = {
        stock: product.stock - item.quantity,
        marketplace: product.marketplace // Preserve marketplace
      };
      await Product.findByIdAndUpdate(product._id, update);

      // Store product details for order tracking
      productDetails.push({
        productName: product.name,
        initialStock: product.stock + item.quantity,
        quantityCheckedOut: item.quantity,
        remainingStock: product.stock
      });
    }

    // Create the order with marketplace
    const order = new Order({
      user: req.user._id,
      vendor: firstProduct.vendor,
      orderItems,
      totalPrice,
      productDetails,
      marketplace: req.body.marketplace // Include marketplace from request
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