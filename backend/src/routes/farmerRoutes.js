import express from 'express';
import { getFarmers, getFarmer, updateFarmer, getFarmerProducts, getDashboardStats } from '../controllers/farmerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getFarmers);
router.get('/dashboard', authenticate, getDashboardStats);
router.get('/:id', getFarmer);
router.get('/:id/products', getFarmerProducts);
router.put('/:id', authenticate, updateFarmer);

export default router;
