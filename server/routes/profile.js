import express from 'express';
import {
    getProfiles,
    getProfile,
    updateProfile,
    createProfile,
    checkUserProfile,
    getProfileByUserId
} from '../controllers/profileController.js';

const router = express.Router();

// Get user profiles
router.get('/', getProfiles);

// Check if user has profile
router.get('/check/:userId', checkUserProfile);

// Get user profile by user_id
router.get('/user/:userId', getProfileByUserId);

// Get user profile
router.get('/:id', getProfile);

// Create user profile
router.post('/', createProfile);

// Update user profile
router.put('/:id', updateProfile);

export default router;

