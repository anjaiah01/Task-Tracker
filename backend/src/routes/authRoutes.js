const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, 
        [name, email, hashedPassword], 
        function (err) {
            if (err) return res.status(400).json({ message: 'User already exists' });
            res.status(201).json({ message: 'User registered successfully' });
        });
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) return res.status(400).json({ message: 'User not found' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

module.exports = router;
