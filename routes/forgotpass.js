const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt'); // Added bcrypt for password hashing
const User = require('../models/user');
const path = require('path');
const router = express.Router();

// Create email transporter
const transporter = nodemailer.createTransport({
    host: 'mail1.serv00.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'inventorymanagerwithrfid@chaiwalabot.serv00.net',
        pass: process.env.EMAIL_PASS || 'WJ$4?Y0+DOml0PD7+9cEV9fl99.OmT'
    }
});

// Update the reset-password route to redirect after sending email
router.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'No account found with that email.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        await user.save();

        // Send reset email
        const resetLink = `${req.protocol}://${req.get('host')}/reset/${resetToken}`;
        await transporter.sendMail({
            from: 'inventorymanagerwithrfid@chaiwalabot.serv00.net',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>Click the link below to reset your password.</p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you didn't request this password reset, please ignore this email.</p>
            `
        });

        // Redirect to confirmation page instead of sending JSON
        res.redirect('/reset-confirmation');
    } catch (err) {
        console.error('Email error:', err);
        res.status(500).json({ error: 'Error sending reset email. Please try again.' });
    }
});

// Add route for reset confirmation page
router.get('/reset-confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reset-confirmation.html'));
});

// Add route for handling the actual password reset
router.get('/reset/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect('/forgot-password?error=invalid');
        }

        // Token is valid, show reset password form
        res.sendFile(path.join(__dirname, '../public/reset-password.html'));
    } catch (err) {
        console.error('Error verifying reset token:', err);
        res.redirect('/forgot-password?error=server');
    }
});

// Add the password reset completion endpoint
router.post('/reset-password-confirm', async (req, res) => {
    const { token, password } = req.body;

    try {
        // Find user with valid reset token that hasn't expired
        const user = await User.findOne({
            resetToken: token,
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Password reset token is invalid or has expired' 
            });
        }

        // Update password and clear reset token
        user.password = await bcrypt.hash(password, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            message: 'An error occurred while resetting password' 
        });
    }
});

module.exports = router;