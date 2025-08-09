import express from "express";
import {
    chatWithAI,
} from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to ai routes
router.use(authenticateToken);

// Chat with AI
router.post('/chat', chatWithAI);

export default router;

