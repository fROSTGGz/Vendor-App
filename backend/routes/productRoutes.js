import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById 
} from '../controllers/productController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, vendor, createProduct);
router.route('/:id').get(getProductById);

export default router;