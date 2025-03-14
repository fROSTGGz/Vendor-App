import express from 'express';
import { 
    getAllUsers,
    updateUserRole,
    getAllOrders,
    createProduct
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing routes...
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.get('/orders', protect, admin, getAllOrders);
router.post('/products', protect, admin, createProduct);

export default router;
