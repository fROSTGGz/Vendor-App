import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById,
  deleteProduct,
  updateProduct  // Add this
} from '../controllers/productController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Apply protect middleware to GET route, but make it optional
router.get('/', protect, getProducts);
router.post('/', protect, vendor, upload.single('image'), createProduct);
router.delete('/:id', protect, vendor, deleteProduct);
router.get('/:id', getProductById);
router.put('/:id', protect, vendor, updateProduct);

export default router;