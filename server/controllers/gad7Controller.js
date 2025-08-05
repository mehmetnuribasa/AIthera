import pool from '../config/pool.js';

// @desc Create a new GAD-7 assessment
// @route POST /api/gad7
export const createGAD7 = async (req, res, next) => {
    const { user_id, question1, question2, question3, question4, question5, question6, question7 } = req.body;

    if(!user_id || !question1 || !question2 || !question3 || !question4 || !question5 || !question6 || !question7) {
        const error = new Error('Please include all required fields: user_id, question1, question2, question3, question4, question5, question6, question7');
        error.status = 400;
        return next(error);
    }

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
        const totalScore = question1 + question2 + question3 + question4 + question5 + question6 + question7;
        const severityLevel = totalScore <= 4 ? 'minimal' : totalScore <= 9 ? 'mild' : totalScore <= 14 ? 'moderate' : 'severe';
        
        const [result] = await pool.query(
            `INSERT INTO gad7_results (user_id, question1, question2, question3, question4, question5, question6, question7, severityLevel)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, question1, question2, question3, question4, question5, question6, question7, severityLevel]
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
    const userId = parseInt(req.params.userId);

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

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