import pool from "../config/pool.js";
import bcrypt from "bcrypt";

// @desc Get current user
// @route GET /api/users/current
export const getCurrentUser = async (req, res, next) => {
    const userId = req.user.id; // Get user ID from authenticated request

    try {
        const [rows] = await pool.query('SELECT id, first_name, last_name, email, register_date FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            const error = new Error(`User with id ${userId} not found`);
            error.status = 404;
            return next(error);
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        next(error);
    }
}

// @desc get all users
// @route GET /api/users
export const getUsers = async (req,  res, next) => {
    const limit = parseInt(req.query.limit); // Limit query parameter

    try {
        let query = 'SELECT * FROM users';
        const params = [];

        // If a limit is specified, add it to the query
        if(!isNaN(limit) && limit > 0) {
            query += ' LIMIT ?';
            params.push(limit);
        }

        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// export const getUsers = async (req, res, next) => {
//     try {
//         const [rows] = await pool.query('SELECT * FROM users');
//         res.status(200).json(rows);
//     } catch (err) {
//         next(err);
//     }
// };


// @desc    Get single user
// @route   GET /api/users/:id
export const getUser = async (req, res, next) => {
    const id = parseInt(req.params.id);
    
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            const error = new Error(`A user with id ${id} was not found`);
            error.status = 404;
            return next(error);
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        next(err);
    }
};

// @desc Create new user
// @route POST /api/users
export const createUser = async (req, res, next) => {
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
};


// @desc Update user
// @route PUT /api/users/:id
export const updateUser = async (req, res, next) => {
    const id= parseInt(req.params.id);
    const {first_name, last_name, email, password, is_admin} = req.body;

    try {

        // Validate required fields
        const fields = [];
        const values = [];

        if(first_name) {
            fields.push('first_name = ?');
            values.push(first_name);
        }
        if(last_name) {
            fields.push('last_name = ?');
            values.push(last_name);
        }
        if(email) {
            fields.push('email = ?');
            values.push(email);
        }
        if(password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push('password = ?');
            values.push(hashedPassword);
        }
        if(is_admin !== undefined) {
            fields.push('is_admin = ?');
            values.push(is_admin);
        }

        if(fields.length === 0) {
            const error = new Error('Please include at least one field to update');
            error.status = 400;
            return next(error);
        }


        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);

        const [result] = await pool.query(query, values);

        // const [result] = await pool.query(
        //     `UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ?, is_admin = ? WHERE id = ?`,
        //     [first_name, last_name, email, password, is_admin || 0, id]
        // );


        if(result.affectedRows === 0) {
            const error = new Error(`A user with id ${id} was not found`);
            error.status = 404;
            return next(error);
        }

        const [updatedUser] = await pool.query(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );

        res.status(200).json(updatedUser[0]);
    } catch (error) {
        next(error);
    }
};


// @desc Delete user
// @route DELETE /api/users/:id
export const deleteUser = async(req, res, next) => {
    const id = parseInt(req.params.id);

    try {
        const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id]);

        if(result.affectedRows === 0) {
            const error = new Error(`A user with id ${id} was not found`);
            error.status = 404;
            return next(error);
        }

        const [rows] = await pool.query('SELECT * FROM users');
        // res.status(200).json(rows);
        res.status(200).json({
            msg: `User with id ${id} deleted successfully`,
            users: rows
        });
    } catch (error) {
        next(error);
    }
};


