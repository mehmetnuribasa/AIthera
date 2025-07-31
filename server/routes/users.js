import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';

const router = express.Router();

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