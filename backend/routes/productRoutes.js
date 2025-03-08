import express from 'express';
import multer from 'multer';
import { 
  createProduct, 
  getProducts, 
  getProductById,
  deleteProduct,
  updateProduct,
  getUnconfirmedProducts,
  confirmProduct,
  getVendorConfirmedProducts
} from '../controllers/productController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Routes
router.get('/unconfirmed', protect, vendor, getUnconfirmedProducts); // Specific route first
router.get('/', protect, getProducts); // Get all products
router.post('/', protect, upload.single('image'), createProduct); // Create a product
router.put('/confirm/:id', protect, vendor, confirmProduct); // Confirm a product
router.get('/:id', getProductById); // Get a product by ID
router.delete('/:id', protect, vendor, deleteProduct); // Delete a product
router.put('/:id', protect, vendor, upload.single('image'), updateProduct); // Update a product
// Add vendor-specific products route
router.get(
  '/vendor/confirmed',
  protect,
  vendor,
  getVendorConfirmedProducts
);
export default router;