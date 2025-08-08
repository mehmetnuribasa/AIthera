// const express = require('express');
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';
import notFound from './middleware/notFound.js';
import pool from './config/pool.js';
import users from './routes/users.js';
import auth from './routes/auth.js';
import profiles from './routes/profile.js';
import gad7 from './routes/gad7.js';
import ai from './routes/ai.js';

// Load environment variables from .env file
dotenv.config();

// Check database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database');

  // Release the connection back to the pool
  connection.release();
});


// Cleanup function to close the database connection gracefully
const cleanup = () => {
  console.log('Cleaning up resources...');
  pool.end((err) => {
    if (err) console.error('Error closing database:', err);
    else console.log('Database connection closed.');
  });
};

// SIGINT (Ctrl+C)
process.on('SIGINT', cleanup);

// SIGTERM (Kill command)
process.on('SIGTERM', cleanup);



const app = express();
const port = process.env.PORT || 8080;


// Middleware to enable CORS
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};
app.use(cors(corsOptions));

// Cookie parser middleware
app.use(cookieParser());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger middleware
app.use(logger);

//Routes
app.use('/api/users', users);

app.use('/api/auth', auth);

app.use("/api/profile", profiles);

app.use('/api/gad7', gad7);

app.use('/api/ai', ai);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

