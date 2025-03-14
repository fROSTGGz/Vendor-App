import express from 'express';
import { 
  addProduct,
  getVendorProducts,
  deleteProduct,
  getAllVendors
} from '../controllers/vendorController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create Product
router.post(
  '/products',
  protect,
  vendor,
  addProduct
);

// Get Vendor Products
router.get(
  '/products',
  protect,
  vendor,
  getVendorProducts
);

// Delete Product
router.delete(
  '/products/:id',
  protect,
  vendor,
  deleteProduct
);

router.get('/', protect, getAllVendors);

export default router;
