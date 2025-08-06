import jwt from 'jsonwebtoken';
import pool from '../config/pool.js';

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        const error = new Error('Access token required');
        error.status = 401;
        return next(error);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user info from database
        const [user] = await pool.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
        
        if (user.length === 0) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }

        req.user = user[0]; // Add user info to request
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const expiredError = new Error('Access token expired');
            expiredError.status = 401;
            return next(expiredError);
        } else if (error.name === 'JsonWebTokenError') {
            const invalidError = new Error('Invalid token');
            invalidError.status = 401;
            return next(invalidError);
        }
        next(error);
    }
}; 