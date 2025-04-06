const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'user' },
    created: { type: Date, default: Date.now },
    resetToken: String
});
module.exports = mongoose.model('LoginUsers', userSchema);