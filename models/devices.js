const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    apiKey: { type: String, required: true },
    LastSync: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Device', deviceSchema);