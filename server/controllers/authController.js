import pool from "../config/pool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// @desc Login user
// @route POST /api/login
export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        const error = new Error("Please include both email and password");
        error.status = 400;
        return next(error);
    }

    try {
        // Search for user by email
        const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (user.length === 0) {
            const error = new Error("User not found");
            error.status = 404;
            return next(error);
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user[0].password);
        if (!isPasswordValid) {
            console.log("Invalid password attempt for user:", password, user[0].password);
            const error = new Error("Invalid password");
            error.status = 401;
            return next(error);
        }

        // Create tokens
        const accessToken = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: "30s" }); //TEMPORARILY 30s for testing
        const refreshToken = jwt.sign({ id: user[0].id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

        await pool.query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", 
            [user[0].id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, // set to true to prevent client-side access
            secure: false, // Set to true if using HTTPS (TEMPORARILY false for testing)
            sameSite: "lax",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.cookie("user_id", user[0].id, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS (TEMPORARILY false for testing)
            sameSite: "lax",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.status(200).json({ accessToken });
    } catch (error) {
        next(error);
    }
};

// @desc Signup user
// @route POST /api/signup
export const signupUser = async (req, res, next) => {
     const {first_name, last_name, email, password, confirm_password, is_admin} = req.body;

    if(!first_name || !last_name || !email || !password || !confirm_password) {
        const error = new Error('Please include all required fields: first_name, last_name, email, password, confirm_password');
        error.status = 400;
        return next(error);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const error = new Error('Please provide a valid email address');
        error.status = 400;
        return next(error);
    }

    // Password strength policy: min 8 chars, uppercase, lowercase, number, special char
    const isLongEnough = typeof password === 'string' && password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!(isLongEnough && hasUppercase && hasLowercase && hasNumber && hasSpecial)) {
        const error = new Error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
        error.status = 400;
        return next(error);
    }

    if (password !== confirm_password) {
        const error = new Error('Passwords do not match');
        error.status = 400;
        return next(error);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, is_admin) VALUES (?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword, is_admin || 0]
        );

        const [new_user] = await pool.query(
            `SELECT * FROM users WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json(new_user[0]);
    } catch (error) {
        next(error);
    }
}

// @desc Refresh access token
// @route POST /api/refresh-token
export const refreshAccessToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        const error = new Error("Refresh token is required");
        error.status = 400;
        return next(error);
    }
    
    try {
        // Check if refresh token exists in the database
        const [rows] = await pool.query("SELECT * FROM refresh_tokens WHERE token = ?", [refreshToken]);

        if (rows.length === 0) {
            const error = new Error("Invalid refresh token");
            error.status = 401; // Unauthorized
            return next(error);
        }

        // check if the refresh token is expired
        const tokenData = rows[0];
        if (new Date(tokenData.expires_at) < new Date()) {
            const error = new Error("Refresh token expired");
            error.status = 401; // Unauthorized
            return next(error);
        }


        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Create new access token
        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "30s" }); // TEMPORARILY 30s for testing

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        next(error);
    }
};

// @desc Logout user
// @route DELETE /api/logout
export const logoutUser = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        const error = new Error("Refresh token is required");
        error.status = 400;
        return next(error);
    }

    try {
        // Verify the refresh token to get the user ID
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Delete all refresh tokens for the user
        await pool.query("DELETE FROM refresh_tokens WHERE user_id = ?", [decoded.id]);

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};