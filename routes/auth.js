const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.get('/register/messages', (req, res) => {
    const error = req.session.reg_errors ? req.session.reg_errors.join('<br>') : null;
    const success = req.session.success;
    req.session.reg_errors = null;
    req.session.success = null;

    res.json({ error, success });
});

router.post('/register', async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    const errors = [];
    if (!username || !email || !password || !confirm_password) {
        errors.push('All fields are required.');
    }
    if (password !== confirm_password) {
        errors.push('Passwords do not match.');
    }
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters.');
    }
    if (errors.length > 0) {
        req.session.reg_errors = errors;
        return res.redirect('/register');
    }

    try {
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            req.session.reg_errors = ['Username is already taken.'];
            return res.redirect('/register');
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            req.session.reg_errors = ['Email is already taken.'];
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        req.session.success = 'Registration successful! You can now log in.';
        return res.redirect('/register');
    } catch (err) {
        console.error(err);
        req.session.reg_errors = ['Something went wrong. Please try again.'];
        res.redirect('/register');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            req.session.error = 'Invalid username or password';
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.session.error = 'Invalid username or password';
            return res.redirect('/login');
        }

        req.session.success = 'Login successful!';
        req.session.username = user.username;
        req.session.role = user.role;
        return res.redirect('/');
    } catch (err) {
        console.error(err);
        req.session.error = 'Something went wrong. Please try again.';
        res.redirect('/login');
    }
});
router.get('/login/messages', (req, res) => {
    const error = req.session.error || null; // Use req.session.error for login errors
    const success = req.session.success || null;

    // Clear only the relevant session variables
    req.session.error = null;
    req.session.success = null;

    res.json({ error, success });
});
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

module.exports = router;