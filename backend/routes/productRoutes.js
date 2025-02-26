import express from 'express';
import multer from 'multer';
import { 
  createProduct, 
  getProducts, 
  getProductById,
  deleteProduct,
  updateProduct 
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

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
router.get('/', protect, getProducts); // Get all products
router.post('/', protect, admin, upload.single('image'), createProduct); // Create a product
router.get('/:id', getProductById); // Get a product by ID
router.delete('/:id', protect, admin, deleteProduct); // Delete a product
router.put('/:id', protect, admin, upload.single('image'), updateProduct); // Update a product

export default router;