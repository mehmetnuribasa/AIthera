import pool from "../config/pool.js";

// @desc Get all user profiles
// @route GET /api/profile
export const getProfiles = async (req, res, next) => {
    try {
        const [result] = await pool.query("SELECT * FROM user_profiles");
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// @desc Get user profile by ID
// @route GET /api/profile/:id
export const getProfile = async (req, res, next) => {
    const id = parseInt(req.params.id);

    try {
        const [result] = await pool.query("SELECT * FROM user_profiles WHERE id = ?", [id]);

        if (result.length === 0) {
            const error = new Error(`Profile with id ${id} not found`);
            error.status = 404;
            return next(error);
        }

        res.status(200).json(result[0]);
    } catch (error) {
        next(error);
    }
};

// @desc Create a new user profile
// @route POST /api/profile
export const createProfile = async (req, res, next) => {
    const { user_id, age, gender, sleepPattern, stressLevel, hasDiagnosis, usesMedication, dreamRecallLevel} = req.body;

    if(!user_id || !age || !gender || !sleepPattern || !stressLevel || !hasDiagnosis || !usesMedication || !dreamRecallLevel) {
        const error = new Error('Please include all required fields: user_id, age, gender, sleepPattern, stressLevel, hasDiagnosis, usesMedication, dreamRecallLevel');
        error.status = 400;
        return next(error);
    }

    try {
        // Check if profile already exists for this user
        const [existing] = await pool.query(
            "SELECT * FROM user_profiles WHERE user_id = ?",
            [user_id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "Profile already exists for this user." });
        }

        // Create new profile
        const [result] = await pool.query(
            "INSERT INTO user_profiles (user_id, age, gender, sleepPattern, stressLevel, hasDiagnosis, usesMedication, dreamRecallLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [user_id, age, gender, sleepPattern, stressLevel, hasDiagnosis, usesMedication, dreamRecallLevel]
        );

        const [newProfile] = await pool.query(
            "SELECT * FROM user_profiles WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json(newProfile[0]);
    } catch (error) {
        next(error);
    }
};

// @desc Update user profile
// @route PUT /api/profile/:id
export const updateProfile = async (req, res, next) => {
    const id = parseInt(req.params.id);
    const { age, gender, sleepPattern, stressLevel, hasDiagnosis, usesMedication, dreamRecallLevel } = req.body;

    try {
        // Check if profile exists
        const fields = [];
        const values = [];

        if (age) {
            fields.push("age = ?");
            values.push(age);
        }
        if(gender) {
            fields.push("gender = ?");
            values.push(gender);
        }
        if(sleepPattern) {
            fields.push("sleepPattern = ?");
            values.push(sleepPattern);
        }
        if(stressLevel) {
            fields.push("stressLevel = ?");
            values.push(stressLevel);
        }
        if(hasDiagnosis) {
            fields.push("hasDiagnosis = ?");
            values.push(hasDiagnosis);
        }
        if(usesMedication) {
            fields.push("usesMedication = ?");
            values.push(usesMedication);
        }
        if(dreamRecallLevel) {
            fields.push("dreamRecallLevel = ?");
            values.push(dreamRecallLevel);
        }

        if (fields.length === 0) {
            const error = new Error('Please provide at least one field to update');
            error.status = 400;
            return next(error);
        }

        // Update profile
        const query = `UPDATE user_profiles SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.query(query, [...values, id]);

        // Check if profile was found and updated
        if (result.affectedRows === 0) {
            const error = new Error(`Profile with id ${id} not found`);
            error.status = 404;
            return next(error);
        }

        const [updatedProfile] = await pool.query(
            "SELECT * FROM user_profiles WHERE id = ?",
            [id]
        );
        res.status(200).json(updatedProfile[0]);
    } catch (error) {
        next(error);
    }
};

// @desc Check if user has profile by user_id
// @route GET /api/profile/check/:userId
export const checkUserProfile = async (req, res, next) => {
    const userId = parseInt(req.params.userId);

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }
    
    try {
        const [result] = await pool.query("SELECT * FROM user_profiles WHERE user_id = ?", [userId]);

        if (result.length === 0) {
            // User doesn't have a profile
            res.status(200).json({ 
                hasProfile: false, 
                message: "User profile not found" 
            });
        } else {
            // User has a profile
            res.status(200).json({ 
                hasProfile: true,
                message: "User profile found" 
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc Get user profile by user_id
// @route GET /api/profile/user/:userId
export const getProfileByUserId = async (req, res, next) => {
    const userId = parseInt(req.params.userId);

    try {
        const [result] = await pool.query("SELECT * FROM user_profiles WHERE user_id = ?", [userId]);

        if (result.length === 0) {
            const error = new Error(`Profile for user ${userId} not found`);
            error.status = 404;
            return next(error);
        }

        res.status(200).json(result[0]);
    } catch (error) {
        next(error);
    }
};