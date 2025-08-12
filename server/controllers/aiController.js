import pool from "../config/pool.js";
import { getWelcomeMessage, getClosingMessage, getChatMessage, summarizeSessionInBackground} from "../services/aiService.js";


// @desc Chat with AI
// @route POST /api/ai/chat
export const chatWithAI = async (req, res, next) => {
    try {
        const userId = req.user.id; // Get user ID from authenticated request
        const { sessionNumber, message } = req.body;    // Get session ID and messages from frontend.

        if (!sessionNumber || !message) {
            const error = new Error("Session number and message are required.");
            error.status = 400;
            return next(error);
        }

        // Get the session details
        const [sessionResult] = await pool.query(
            `SELECT * FROM therapy_sessions WHERE user_id = ? AND session_number = ?`,
            [userId, sessionNumber]
        );

        if (sessionResult.length === 0) {
            const error = new Error("Session not found or access denied.");
            error.status = 404;
            return next(error);
        }
        
        const session = sessionResult[0];

        if(session.status === 'completed') {
            const error = new Error("Session is already completed.");
            error.status = 400;
            return next(error);
        }

        // Get the messages for this session
        const [messagesResult] = await pool.query(
            `SELECT * FROM therapy_messages WHERE session_id = ? ORDER BY timestamp ASC`,
            [session.id]
        );

        // Get the previous session summary
        let summary = "";
        if(session.session_number > 1) {
            const [prevSummary] = await pool.query(
                `SELECT summary FROM therapy_sessions WHERE user_id = ? AND session_number = ?`,
                [userId, sessionNumber-1]
            );

            summary = prevSummary[0] ? prevSummary[0].summary : "";
        }

        // Check if the user has reached the turn limit
        const reachedTurnLimit = messagesResult.length >= 1;

        //continue the conversation..
        if(!reachedTurnLimit) {
            const responseText = await getChatMessage(session, messagesResult, message, summary);

            //save the user message to database
            await pool.query(
                `INSERT INTO therapy_messages (session_id, sender, message) VALUES (?, ?, ?)`,
                [session.id, 'user', message]
            );

            // Save the ai response to the database
            await pool.query(
                `INSERT INTO therapy_messages (session_id, sender, message) VALUES (?, ?, ?)`,
                [session.id, 'assistant', responseText]
            );

            return res.status(200).json({ message: responseText, closed: false }); 
        }


        // Send a closing message..
        const closingMessage = await getClosingMessage(session, messagesResult, message, summary);

        //save the user message to database
        await pool.query(
            `INSERT INTO therapy_messages (session_id, sender, message) VALUES (?, ?, ?)`,
            [session.id, 'user', message]
        );

        // Save the ai response to the database
        await pool.query(
            `INSERT INTO therapy_messages (session_id, sender, message) VALUES (?, ?, ?)`,
            [session.id, 'assistant', closingMessage]
        );

        // Mark the session as completed
        await pool.query(
            `UPDATE therapy_sessions SET status = 'completed' WHERE id = ?`,
            [session.id]
        );

        // Summarize the session in the background
        summarizeSessionInBackground(session, messagesResult, message, closingMessage, summary);

        return res.status(200).json({ message: closingMessage, closed: true });
    } catch (error) {
        next(error);
    }
};

// @desc Start a new therapy session
// @route POST /api/ai/start-session
export const startTherapySession = async (req, res, next) => {
    try {
        const userId = req.user.id; // Get user ID from authenticated request
        const {sessionNumber} = req.body;

        if(!sessionNumber) {
            const error = new Error("Session number is required.");
            error.status = 400;
            throw error;
        }

        // Get the session details
        const [sessionResult] = await pool.query(
            `SELECT * FROM therapy_sessions WHERE user_id = ? AND session_number = ?`,
            [userId, sessionNumber]
        );

        if (sessionResult.length === 0) {
            const error = new Error("Session not found or access denied.");
            error.status = 404;
            return next(error);
        }

        const session = sessionResult[0];

        if(session.status === 'completed') {
            const error = new Error("Session is already completed.");
            error.status = 400;
            return next(error);
        }

        // Check if session already has messages
        const [messagesResult] = await pool.query(
            `SELECT * FROM therapy_messages WHERE session_id = ? ORDER BY timestamp ASC`,
            [session.id]
        );

        if (messagesResult.length > 0) {
            const error = new Error("Session already started. Use /chat endpoint to continue conversation.");
            error.status = 400;
            return next(error);
        }
        
        // Get the previous session summary
        let summary = "";
        if(session.session_number > 1) {
            const [prevSummary] = await pool.query(
                `SELECT summary FROM therapy_sessions WHERE user_id = ? AND session_number = ?`,
                [userId, sessionNumber-1]
            );

            summary = prevSummary[0] ? prevSummary[0].summary : "";
        }

        // Generate a AI welcome message
        const welcomeMessage = await getWelcomeMessage(session, summary);

        //save the AI's welcome message
        await pool.query(
            `INSERT INTO therapy_messages (session_id, sender, message) VALUES (?, ?, ?)`,
            [session.id, 'assistant', welcomeMessage]
        );

        res.status(200).json({ message: welcomeMessage });
    } catch (error) {
        next(error);
    }
};