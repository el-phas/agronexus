/**
 * Chatbot Routes
 * Handles AI chat and tips endpoints
 */

import express from 'express';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
  getFarmingTips,
  getBuyingTips
} from '../controllers/chatbotController.js';

const router = express.Router();

// Chat endpoints
router.post("/", sendMessage);
router.get("/history", getChatHistory);
router.delete("/history", clearChatHistory);

// Tips endpoints
router.get("/tips/farming", getFarmingTips);
router.get("/tips/buying", getBuyingTips);

export default router;
