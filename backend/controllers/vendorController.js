import User from '../models/userModel.js';

export const requestVendorStatus = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (user.role === 'vendor') {
      res.status(400);
      throw new Error('User is already a vendor');
    }

    user.role = 'pending';
    await user.save();

    res.json({ message: 'Vendor status requested' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

