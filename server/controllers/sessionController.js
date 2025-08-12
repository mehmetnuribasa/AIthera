import pool from "../config/pool.js";

export const getSessions = async (req, res, next) => {

    try {
        const userId = req.user.id; // Get user ID from authenticated request

        const [sessions] = await pool.query(
            "SELECT session_number, topic, status, wellness_score FROM therapy_sessions WHERE user_id = ?",
            [userId]
        );

        res.status(200).json(sessions);

    } catch(error) {
        next(error);
    }
};