import express from 'express';
// Update imports to match:
import { 
    getAllUsers,
    updateUserRole,
    getAllOrders,
    downloadVendorsPDF,  // ← Matches controller export
    downloadVendorsCSV,  // ← Matches controller export
    getVendorDetails
  } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing routes...
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.get('/orders', protect, admin, getAllOrders);
router.get('/vendors/download/pdf', protect, admin, downloadVendorsPDF);
router.get('/vendors/download/csv', protect, admin, downloadVendorsCSV);
router.get('/vendors/:id', protect, admin, getVendorDetails);


export default router;