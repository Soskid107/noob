require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const Joi = require('joi');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;
const useSSL = process.env.DB_SSL === 'true';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    ...(useSSL && { ssl: { rejectUnauthorized: false } })
});

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001', // allow your frontend dev server
    credentials: true // if you use cookies or need credentials
}));


// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API Routes
app.post('/register', async (req, res) => {
    // Define validation schema
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(6).max(128).required(),
        bio: Joi.string().max(500).allow('', null)
    });

    // Validate the request body
    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const { username, password, bio } = value;

    try {
         // Check if username already exists
         const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
         if (userCheck.rows.length > 0) { // Fixed: userCheck.rows.lenghh
             return res.status(400).send('Username already exists');
          }

         const hashedPassword = await bcrypt.hash(password, 10);


         // insert new user into the database
 const result = await pool.query(
      'INSERT INTO users (username, password, bio) VALUES ($1, $2, $3) RETURNING id',
        [username, hashedPassword, bio || '']
      );
     // No additional code needed here, but you could log or handle post-registration logic if desired    
          res.status(201).send('User registered successfully');
      } catch (error) {
         console.error('Error during registration:', error);
         res.status(500).json({
            message: 'An error occurred during registration.',
            error: error.message,
            stack: error.stack
         });
      }
});

app.post('/login', async (req, res) => {
    // Define validation schema
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(6).max(128).required()
    });

    // Validate the request body
    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const { username, password } = value;

    console.log(`Login attempt for user: ${username}`);

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            console.log(`User ${username} not found.`);
            return res.status(400).send('Cannot find user');
        }

        console.log(`Comparing password for user: ${username}`);
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            console.log(`Password match for user: ${username}`);
            const accessToken = jwt.sign(
                { username: user.username, id: user.id },
                SECRET_KEY,
                { expiresIn: '1h' }
            );
            res.json({ accessToken });
        } else {
            console.log(`Invalid credentials for user: ${username}`);
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error(`Error during password comparison or JWT signing for user ${username}:`, error);
        res.status(500).send('An error occurred during login.');
    }
});
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT username, bio FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        if (user) {
            res.json({ username: user.username, bio: user.bio });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).send('An error occurred while fetching profile.');
    }
});

app.put('/profile', authenticateToken, async (req, res) => {
    // Define validation schema
    const schema = Joi.object({
        bio: Joi.string().max(500).allow('', null)
    });

    // Validate the request body
    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const { bio } = value;
    try {
        const result = await pool.query('UPDATE users SET bio = $1 WHERE id = $2 RETURNING id', [bio, req.user.id]);
        if (result.rowCount > 0) {
            res.send('Profile updated successfully');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('An error occurred while updating profile.');
    }
});

app.get('/wisdom', authenticateToken, async (req, res) => {
    try {
        // Fetch a random wisdom from the database
        const result = await pool.query('SELECT * FROM wisdom ORDER BY RANDOM() LIMIT 1');
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('No wisdom found.');
        }
    } catch (error) {
        console.error('Error fetching wisdom:', error);
        res.status(500).send('An error occurred while fetching wisdom.');
    }
});

// Serve static assets
app.use(express.static(path.join(__dirname, '../client/build')));

// FIXED: Use middleware instead of route for SPA catch-all
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Application specific logging, throwing an error, or other logic here
    process.exit(1); // Exit the process to avoid undefined state
});