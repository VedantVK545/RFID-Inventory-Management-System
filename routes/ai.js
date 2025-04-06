const express = require('express');
const { useCloudflareAI } = require('../services/ai');
const router = express.Router();

router.post('/ask-ai', useCloudflareAI);

module.exports = router;