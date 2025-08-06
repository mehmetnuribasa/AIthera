import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getCurrentUser
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to authenticate user
router.use(authenticateToken);

// Get current user
router.get('/current', getCurrentUser);

//Get all users
router.get('/', getUsers);

//Get single user
router.get('/:id', getUser);

//Create user
router.post('/', createUser);

//Update user
router.put('/:id', updateUser);

//Delete user
router.delete('/:id', deleteUser);

export default router;