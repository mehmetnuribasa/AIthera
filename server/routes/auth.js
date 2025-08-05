import express from 'express';
import {
    loginUser,
    refreshAccessToken,
    logoutUser,
    signupUser
} from '../controllers/authController.js';

const router = express.Router();

// Login user
router.post('/login', loginUser);

// Signup user
router.post('/signup', signupUser);

// Refresh access token
router.post('/refresh-token', refreshAccessToken);

// Logout user
router.delete('/logout', logoutUser);

export default router;