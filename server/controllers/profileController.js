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
    const { age, gender, sleepPattern, stressLevel, hasDiagnosis, usesMedication, dreamRecallLevel} = req.body;


    if(!age || !gender || !sleepPattern || !stressLevel || !hasDiagnosis || !usesMedication || !dreamRecallLevel) {
        const error = new Error('Please include all required fields: age, gender, sleepPattern, stressLevel, hasDiagnosis, usesMedication, dreamRecallLevel');
        error.status = 400;
        return next(error);
    }
    
    // Validate age
    if(age < 1 || age > 120) {
        const error = new Error('Age must be between 1 and 120');
        error.status = 400;
        return next(error);
    }

    if(gender !== 'male' && gender !== 'female') {
        const error = new Error('Gender must be either male or female');
        error.status = 400;
        return next(error);
    }

    if(sleepPattern !== 'regular' && sleepPattern !== 'irregular' && sleepPattern !== 'little_sleep' && sleepPattern !== 'too_much_sleep' && sleepPattern !== 'insomnia') {
        const error = new Error('Sleep pattern must be one of the following: regular, irregular, little_sleep, too_much_sleep, insomnia');
        error.status = 400;
        return next(error);
    }

    if(stressLevel < 1 || stressLevel > 10) {
        const error = new Error('Stress level must be between 1 and 10');
        error.status = 400;
        return next(error);
    }

    if(hasDiagnosis !== 'yes' && hasDiagnosis !== 'no') {
        const error = new Error('Has diagnosis must be either yes or no');
        error.status = 400;
        return next(error);
    }

    if(usesMedication !== 'yes' && usesMedication !== 'no') {
        const error = new Error('Uses medication must be either yes or no');
        error.status = 400;
        return next(error);
    }

    if(dreamRecallLevel !== 'don\'t_remember' && dreamRecallLevel !== 'rarely' && dreamRecallLevel !== 'sometimes' && dreamRecallLevel !== 'often' && dreamRecallLevel !== 'always' && dreamRecallLevel !== 'don\'t_dream') {
        const error = new Error('Dream recall level must be one of the following: don\'t_remember, rarely, sometimes, often, always, don\'t_dream');
        error.status = 400;
        return next(error);
    }

    const user_id = req.user.id; // Get user ID from authenticated request

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
// @route PUT /api/profile
export const updateProfile = async (req, res, next) => {
    const userId = req.user.id; // Get user ID from authenticated request
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
        const query = `UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = ?`;
        
        const [result] = await pool.query(query, [...values, userId]);

        // Check if profile was found and updated
        if (result.affectedRows === 0) {
            const error = new Error(`Profile with user id ${userId} not found`);
            error.status = 404;
            return next(error);
        }

        const [updatedProfile] = await pool.query(
            "SELECT * FROM user_profiles WHERE user_id = ?",
            [userId]
        );
        res.status(200).json(updatedProfile[0]);
    } catch (error) {
        next(error);
    }
};

// @desc Check if user has profile by user_id
// @route GET /api/profile/check
export const checkUserProfile = async (req, res, next) => {
    const userId = req.user.id; // Get user ID from authenticated request

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