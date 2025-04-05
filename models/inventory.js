
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, default: () => `Item-${Date.now()}` },
    tag: { type: String, unique: true, default: 'Not yet setup' },
    quantity: { type: Number, default: 0 },
    Catagory: { type: String, default: 'Not yet setup' },
    created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InventoryItems', itemSchema);