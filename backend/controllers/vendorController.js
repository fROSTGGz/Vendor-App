import express from 'express';
import User from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Function to request vendor status
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
export const saveVendorProducts = async (req, res) => {
  const { products } = req.body;
  const vendorId = req.user._id;

  // Logic to save the products for the vendor
  // This could involve updating the vendor's record in the database
  // Example:
  try {
    const vendor = await User.findById(vendorId);
    vendor.products = products; // Assuming you have a products field in the vendor model
    await vendor.save();
    res.status(200).json({ message: 'Products saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving products' });
  }
};

// Function to get all vendors
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendors' });
  }
};
export const addProduct = async (req, res) => {
  const { productId } = req.body;
  const vendorId = req.user._id;

  try {
    const vendor = await User.findById(vendorId);
    if (!vendor.products.includes(productId)) {
      vendor.products.push(productId);
      await vendor.save();
      res.status(200).json({ message: 'Product added successfully' });
    } else {
      res.status(400).json({ message: 'Product already exists in the list' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding product' });
  }
};

// Function to delete a product from the vendor's product list
export const deleteProduct = async (req, res) => {
  const { productId } = req.body;
  const vendorId = req.user._id;

  try {
    const vendor = await User.findById(vendorId);
    vendor.products = vendor.products.filter(id => id !== productId);
    await vendor.save();
    res.status(200).json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing product' });
  }
};
export const getVendorProducts = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id).populate('products', 'name price category stock');
    console.log(vendor);
    res.json(vendor.products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor products' });
  }
};
// Routes
router.post('/request', protect, requestVendorStatus);
router.get('/', protect, getAllVendors);

export default router;