const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/css/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/css/styles.css'));
});
router.get('/css/ai-style.css', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/css/ai-style.css'));
});
module.exports = router;