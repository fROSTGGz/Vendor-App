import express from 'express';
import { requestVendorStatus } from '../controllers/vendorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', protect, requestVendorStatus);

export default router;

