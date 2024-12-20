import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

export const createOrder = async (req, res) => {
  const { orderItems, totalPrice } = req.body;

  // Find the vendor of the first product in the order
  const firstProduct = await Product.findById(orderItems[0].product);
  
  const order = new Order({
    user: req.user._id,
    vendor: firstProduct.vendor, // Set the vendor based on the product
    orderItems,
    totalPrice
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('vendor', 'name') // Populate vendor name
    .populate('orderItems.product', 'name'); // Populate product details
  res.json(orders);
};