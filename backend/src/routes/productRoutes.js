import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createProduct);
router.put('/:id', authenticate, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;
