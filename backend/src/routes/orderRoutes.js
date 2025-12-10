import express from 'express';
import { getOrders, getOrder, createOrder, updateOrderStatus, getRecentOrders } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/recent', authenticate, getRecentOrders);
router.get('/', authenticate, getOrders);
router.post('/', authenticate, createOrder);
router.get('/:id', authenticate, getOrder);
router.put('/:id/status', authenticate, updateOrderStatus);

export default router;
