import express from "express";
import {
    getSessions,
    getSessionMessages
} from "../controllers/sessionController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Get sessions
router.get("/", getSessions);

// Get session messages
router.get("/messages/:sessionId", getSessionMessages);

export default router;