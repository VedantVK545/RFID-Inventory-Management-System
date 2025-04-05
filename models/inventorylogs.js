const mongoose = require('mongoose');

const transactionLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., "add", "remove", "update"
    itemName: { type: String, required: true },
    itemTag: { type: String, required: true },
    quantity: { type: Number, required: true },
    performedBy: { type: String, required: true }, // Username of the person performing the action
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TransactionLog', transactionLogSchema);