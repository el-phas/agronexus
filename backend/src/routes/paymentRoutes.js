import express from 'express';
import { initiatePayment, checkPaymentStatus, handleDarajaCallback } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/initiate', authenticate, validateRequest(schemas.initiatePaymentSchema), initiatePayment);
router.get('/:paymentId/status', authenticate, checkPaymentStatus);
// Public callback from Daraja
router.post('/callback', express.json(), handleDarajaCallback);

export default router;
