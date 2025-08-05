import express from 'express';
import {
    createGAD7,
    checkGAD7Status
} from '../controllers/gad7Controller.js';

const router = express.Router();

// Create a new GAD-7 assessment
router.post('/', createGAD7);

// Check GAD-7 assessment status for a user
router.get('/check/:userId', checkGAD7Status);


export default router;