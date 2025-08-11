import express from "express";
import {
    chatWithAI,
    startTherapySession
} from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to ai routes
router.use(authenticateToken);

// Chat with AI
router.post('/chat', chatWithAI);

// Start a new therapy session
router.post('/start-session', startTherapySession);

export default router;

