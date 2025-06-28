const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key'; // In a real app, use an environment variable

app.use(express.json());

// Simple JSON file for data storage (acting as our database)
const usersFilePath = path.join(__dirname, 'users.json');
const wisdomFilePath = path.join(__dirname, 'wisdom.json');

// Initialize data files if they don't exist
if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
}
if (!fs.existsSync(wisdomFilePath)) {
    fs.writeFileSync(wisdomFilePath, JSON.stringify([
        { id: 1, text: "The journey of a thousand miles begins with a single step. - Lao Tzu" },
        { id: 2, text: "What you do not want done to yourself, do not do to others. - Confucius" },
        { id: 3, text: "The art of medicine is to cure sometimes, relieve often, comfort always. - Ibn Sina" },
        { id: 4, text: "The wise man does not lay up his own treasures. The more he gives to others, the more he has for his own. - Lao Tzu" },
        { id: 5, text: "Happiness is the absence of the striving for happiness. - Zhuangzi" } 
    ]));
}

// Helper to read data
const readData = (filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
};

// Helper to write data
const writeData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

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
    const { username, password, bio } = req.body;
    const users = readData(usersFilePath);

    if (users.find(u => u.username === username)) {
        return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword, bio: bio || '' };
    users.push(newUser);
    writeData(usersFilePath, users);

    res.status(201).send('User registered successfully');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readData(usersFilePath);
    const user = users.find(u => u.username === username);

    if (user == null) {
        return res.status(400).send('Cannot find user');
    }

    if (await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY);
        res.json({ accessToken });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.get('/profile', authenticateToken, (req, res) => {
    const users = readData(usersFilePath);
    const user = users.find(u => u.id === req.user.id);
    if (user) {
        res.json({ username: user.username, bio: user.bio });
    } else {
        res.status(404).send('User not found');
    }
});

app.put('/profile', authenticateToken, (req, res) => {
    const { bio } = req.body;
    let users = readData(usersFilePath);
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex > -1) {
        users[userIndex].bio = bio;
        writeData(usersFilePath, users);
        res.send('Profile updated successfully');
    } else {
        res.status(404).send('User not found');
    }
});

app.get('/wisdom', authenticateToken, (req, res) => {
    const wisdoms = readData(wisdomFilePath);
    const randomWisdom = wisdoms[Math.floor(Math.random() * wisdoms.length)];
    res.json(randomWisdom);
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