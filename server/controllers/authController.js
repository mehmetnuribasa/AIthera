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

        res.status(200).json({ accessToken });
    } catch (error) {
        next(error);
    }
};

// @desc Signup user
// @route POST /api/signup
export const signupUser = async (req, res, next) => {
     const {first_name, last_name, email, password, is_admin} = req.body;

    if(!first_name || !last_name || !email || !password) {
        const error = new Error('Please include all required fields: first_name, last_name, email, password');
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


// @desc Check session
// @route GET /api/session
export const checkSession = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        const error = new Error("No token provided");
        error.status = 401; // Unauthorized
        return next(error);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ message: "Session active", userId: decoded.id , isAuthenticated: true });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Access token expired error
            const expiredError = new Error("Access token expired");
            expiredError.status = 401; // Unauthorized
            return next(expiredError);
        } else if (error.name === "JsonWebTokenError") {
            // Invalid token error
            const invalidError = new Error("Invalid token");
            invalidError.status = 401; // Unauthorized
            return next(invalidError);
        } else {
            return next(error);
        }
    }
};

// @desc Get current user
// @route GET /api/current-user
export const getCurrentUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        const error = new Error("No token provided");
        error.status = 401; // Unauthorized
        return next(error);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ userId: decoded.id , isAuthenticated: true });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Access token expired error
            const expiredError = new Error("Access token expired");
            expiredError.status = 401; // Unauthorized
            return next(expiredError);
        } else if (error.name === "JsonWebTokenError") {
            // Invalid token error
            const invalidError = new Error("Invalid token");
            invalidError.status = 401; // Unauthorized
            return next(invalidError);
        } else {
            return next(error);
        }
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