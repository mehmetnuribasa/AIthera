import pool from '../config/pool.js';

// @desc Create a new GAD-7 assessment
// @route POST /api/gad7
export const createGAD7 = async (req, res, next) => {
    const { question1, question2, question3, question4, question5, question6, question7 } = req.body;

    if(!question1 || !question2 || !question3 || !question4 || !question5 || !question6 || !question7) {
        const error = new Error('Please include all required fields: question1, question2, question3, question4, question5, question6, question7');
        error.status = 400;
        return next(error);
    }

    const user_id = req.user.id; // Get user ID from authenticated request

    try {
        // Check if GAD-7 assessment already exists for this user
        const [existing] = await pool.query(
            "SELECT * FROM gad7_results WHERE user_id = ?",
            [user_id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "GAD-7 assessment already exists for this user." });
        }

        // Calculate severity level based on total score
        const totalScore = parseInt(question1) + parseInt(question2) + parseInt(question3) + parseInt(question4) + parseInt(question5) + parseInt(question6) + parseInt(question7);
        const severityLevel = totalScore <= 4 ? 'minimal' : totalScore <= 9 ? 'mild' : totalScore <= 14 ? 'moderate' : 'severe';
        const recommended_therapy = severityLevel === 'minimal' ? 'Mindfulness' : severityLevel === 'mild' ? 'ACT' : severityLevel === 'moderate' ? 'CBT' : 'CBT + EMDR';
        const total_sessions = severityLevel === 'minimal' ? 4 : severityLevel === 'mild' ? 6 : severityLevel === 'moderate' ? 8 : 12;

        const [result] = await pool.query(
            `INSERT INTO gad7_results (user_id, question1, question2, question3, question4, question5, question6, question7, totalScore, severityLevel, recommended_therapy, total_sessions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, question1, question2, question3, question4, question5, question6, question7, totalScore, severityLevel, recommended_therapy, total_sessions]
        );

        // Get the inserted record using the insertId
        const [newResult] = await pool.query(
            `SELECT * FROM gad7_results WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json(newResult[0]);
    } catch (error) {
        next(error);
    }
};


// @desc Check GAD-7 assessment status for a user
// @route GET /api/gad7/check/:userId
export const checkGAD7Status = async (req, res, next) => {
    const userId = req.user.id; // Get user ID from authenticated request

    try {
        const [result] = await pool.query(
            "SELECT * FROM gad7_results WHERE user_id = ?",
            [userId]
        );

        //User does not have a GAD-7 assessment
        if (result.length === 0) {
            res.status(200).json({
                hasGAD7: false,
                message: "No GAD-7 assessment found for this user."
            });
        } 
        //User has a GAD-7 assessment
        else {
            res.status(200).json({
                hasGAD7: true,
                message: "GAD-7 assessment found for this user."
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc Get GAD-7 results for a user
// @route GET /api/gad7/results
export const getGAD7Results = async (req, res, next) => {
    const userId = req.user.id; // Get user ID from authenticated request

    try {
        const [results] = await pool.query(
            "SELECT * FROM gad7_results WHERE user_id = ?",
            [userId]
        );

        if (results.length === 0) {
            const error = new Error(`No GAD-7 results found for user with id ${userId}`);
            error.status = 404;
            return next(error);
        }

        res.status(200).json(results);
    } catch (error) {
        next(error);
    }
}