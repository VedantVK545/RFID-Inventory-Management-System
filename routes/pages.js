const express = require('express');
const { isAuthenticated, isAdmin} = require('../middlewares/auth');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/index.html'));
});

router.get('/inventory', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/inventory.html'));
});

router.get('/receiptlogs', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/receiptlogs.html'));
});

router.get('/rfid', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/rfid.html'));
});

router.get('/usercores', isAuthenticated, isAdmin,(req, res) => {
    res.sendFile(path.join(__dirname + '/../public/userlist.html'));
});
router.get('/userlogs', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/userlogs.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/register.html'));
});
router.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/forgot-password.html'));
});

// Fix the reset confirmation route path
router.get('/reset-confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reset-confirmation.html'));
});

// Fix the reset password route path to accept token parameter
router.get('/reset/:token', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reset-password.html'));
});

module.exports = router;