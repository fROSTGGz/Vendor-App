import express from 'express';
import { getAllUsers, updateUserRole, getAllOrders } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.get('/orders', protect, admin, getAllOrders);

export default router;

