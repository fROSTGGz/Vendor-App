import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

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
  const orders = await Order.find({}).populate('vendor', 'id name');
  res.json(orders);
};

