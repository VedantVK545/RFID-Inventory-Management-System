const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: { type: String, default: 'Guest' },
    action: { type: String, required: true },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', logSchema);