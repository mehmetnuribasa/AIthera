import pool from '../config/pool.js';
import { getTherapyRecommendation } from '../services/aiService.js';

// @desc Create a new GAD-7 assessment
// @route POST /api/gad7
export const createGAD7 = async (req, res, next) => {
    const { question1, question2, question3, question4, question5, question6, question7, question8 } = req.body;

    if(!question1 || !question2 || !question3 || !question4 || !question5 || !question6 || !question7 || !question8) {
        const error = new Error('Please include all required fields: question1, question2, question3, question4, question5, question6, question7, question8');
        error.status = 400;
        return next(error);
    }

    // Validate answers
    const validAnswers = ['0', '1', '2', '3'];
    if(!validAnswers.includes(question1) ||
       !validAnswers.includes(question2) ||
       !validAnswers.includes(question3) ||
       !validAnswers.includes(question4) ||
       !validAnswers.includes(question5) ||
       !validAnswers.includes(question6) ||
       !validAnswers.includes(question7)) {
        const error = new Error('Invalid answers. Please provide answers between 0 and 3.');
        error.status = 400;
        return next(error);
    }

    // validate question8
    if (typeof question8 !== 'string' || question8.trim().length < 20) {
        const error = new Error('question8 must be at least 20 characters long.');
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
            const error = new Error("GAD-7 assessment already exists for this user.");
            error.status = 409;
            return next(error);
        }


        // Calculate severity level based on total score
        const totalScore = parseInt(question1) + parseInt(question2) + parseInt(question3) + parseInt(question4) + parseInt(question5) + parseInt(question6) + parseInt(question7);
        const severityLevel = totalScore <= 4 ? 'minimal' : totalScore <= 9 ? 'mild' : totalScore <= 14 ? 'moderate' : 'severe';

        // Insert new GAD-7 assessment
        const [result] = await pool.query(
            `INSERT INTO gad7_results (user_id, question1, question2, question3, question4, question5, question6, question7, question8, totalScore, severityLevel)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, question1, question2, question3, question4, question5, question6, question7, question8, totalScore, severityLevel]
        );

        // Get profile results for AI recommendation
        const [[profile]] = await pool.query(
            "SELECT * FROM user_profiles WHERE user_id = ?",
            [user_id]
        );

        if (!profile) {
            const error = new Error("User profile not found.");
            error.status = 404;
            return next(error);
        }

        // We already have these values; no need to re-query DB
        const gad7Result = { question8, totalScore };

        // Get therapy recommendation from AI service
        const recommendation = await getTherapyRecommendation(profile, gad7Result);

        console.log('AI Recommendation:', JSON.stringify(recommendation, null, 2));

        // Update GAD-7 results with AI recommendation
        await pool.query(
            `UPDATE gad7_results SET recommended_therapy = ?, total_sessions = ? WHERE id = ?`,
            [JSON.stringify(recommendation.therapy_types), recommendation.session_count, result.insertId]
        );

        // Get the updated GAD-7 results
        const [newResult] = await pool.query(
            `SELECT * FROM gad7_results WHERE id = ?`,
            [result.insertId]
        );

        // Get session plans
        const sessionValues = recommendation.session_plan.map((session) => [
            user_id,
            result.insertId, // gad7_results.id
            session.session_number,
            session.session_topic,
            JSON.stringify(session.session_goals), // convert to JSON string
            recommendation.explanation
        ]);

        // Insert session plans into the database in background
        pool.query(
            `INSERT INTO therapy_sessions (user_id, gad7_id, session_number, topic, session_goals, session_explanation)
            VALUES ?`,
            [sessionValues]
        );

        // Mark the first session as in queue
        pool.query(
            `UPDATE therapy_sessions SET status = 'in_queue' WHERE user_id = ? AND session_number = ?`,
            [user_id, 1]
        );
        
        res.status(201).json({
            ...newResult[0]
        });
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

        res.status(200).json(results[0]);
    } catch (error) {
        next(error);
    }
}