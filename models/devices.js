const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    location: { type: String, unique: true },
    status: String,
    LastSync: { type: String, default: 'NILL' },
    created: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Devices', userSchema);