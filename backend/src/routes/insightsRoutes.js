import express from 'express';
import { getInsights } from '../controllers/insightsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public insights for analytics (can restrict to admin/farmer later)
router.get('/', authenticate, getInsights);

export default router;
