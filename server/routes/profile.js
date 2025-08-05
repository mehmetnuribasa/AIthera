import express from 'express';
import {
    getProfiles,
    getProfile,
    updateProfile,
    createProfile,
    checkUserProfile
} from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all profile routes
router.use(authenticateToken);

// Get user profiles
router.get('/', getProfiles);

// Check if user has profile (no userId parameter needed - uses authenticated user)
router.get('/check', checkUserProfile);

// Get user profile
router.get('/:id', getProfile);

// Create user profile
router.post('/', createProfile);

// Update user profile
router.put('/:id', updateProfile);

export default router;

