import express from 'express';
import {
    createGAD7,
    checkGAD7Status
} from '../controllers/gad7Controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all GAD7 routes
router.use(authenticateToken);

// Create a new GAD-7 assessment
router.post('/', createGAD7);

// Check GAD-7 assessment status for a user (no userId parameter needed - uses authenticated user)
router.get('/check', checkGAD7Status);

export default router;