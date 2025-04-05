const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/css/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/css/styles.css'));
});
module.exports = router;