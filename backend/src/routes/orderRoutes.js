import express from 'express';
import { getOrders, getOrder, createOrder, updateOrderStatus, getRecentOrders } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

router.get('/recent', authenticate, getRecentOrders);
router.get('/', authenticate, getOrders);
router.post('/', authenticate, validateRequest(schemas.createOrderSchema), createOrder);
router.get('/:id', authenticate, getOrder);
router.put('/:id/status', authenticate, validateRequest(schemas.updateOrderStatusSchema), updateOrderStatus);

export default router;
