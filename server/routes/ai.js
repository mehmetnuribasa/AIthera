import express from "express";
import {
    getTherapyRecommendation
} from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to ai routes
router.use(authenticateToken);

// Get therapy recommendation based on user profile and GAD-7 results
router.get("/recommendation", getTherapyRecommendation);

export default router;

