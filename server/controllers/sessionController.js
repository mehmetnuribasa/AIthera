import pool from "../config/pool.js";

// @desc Get all therapy sessions for the current user
// @route GET /api/sessions
export const getSessions = async (req, res, next) => {

    try {
        const userId = req.user.id; // Get user ID from authenticated request

        const [sessions] = await pool.query(
            "SELECT id, session_number, topic, status, wellness_score FROM therapy_sessions WHERE user_id = ?",
            [userId]
        );

        res.status(200).json(sessions);

    } catch(error) {
        next(error);
    }
};

// @desc Get messages for a specific therapy session
// @route GET /api/sessions/messages/:session_id
export const getSessionMessages = async (req, res, next) => {
    try {
        const { sessionId } = req.params;  // Get Session ID from request parameters (frontend)

        if(!sessionId) {
            const error = new Error("Session ID is required.");
            error.status = 400;
            throw error;
        }

        const [messages] = await pool.query(
            "SELECT sender, message FROM therapy_messages WHERE session_id = ? ORDER BY timestamp ASC",
            [sessionId]
        );
        
        res.status(200).json({ messages: messages });

    } catch (error) {
        next(error);
    }
};