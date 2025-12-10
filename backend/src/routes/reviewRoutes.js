import express from 'express';
import { getReviews, createReview, updateReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:productId', getReviews);
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);

export default router;
