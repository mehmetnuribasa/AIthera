import express from "express";
import {
    getSessions
} from "../controllers/sessionController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Get sessions
router.get("/", getSessions);

export default router;