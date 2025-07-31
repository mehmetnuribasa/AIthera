import express from 'express';
import { loginUser, refreshAccessToken, checkSession, logoutUser, signupUser} from '../controllers/authController.js';

const router = express.Router();

// Login user
router.post('/login', loginUser);

// Signup user
router.post('/signup', signupUser);

// Refresh access token
router.post('/refresh-token', refreshAccessToken);

// Check session
router.get('/session', checkSession);

// Logout user
router.delete('/logout', logoutUser);

export default router;