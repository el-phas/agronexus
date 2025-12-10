import express from 'express';
import {
  getTasksForFarmer,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All task endpoints require authentication
router.get('/', authenticate, getTasksForFarmer);
router.post('/', authenticate, createTask);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router;
