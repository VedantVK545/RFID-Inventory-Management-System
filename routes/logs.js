const express = require('express');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const Log = require('../models/log');
const router = express.Router();
const { Parser } = require('json2csv'); // Library to convert JSON to CSV
const TransactionLog = require('../models/inventorylogs');
router.get('/getlogs', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export logs as CSV
router.get('/exportlogs', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });

        // Define fields for CSV
        const fields = ['_id', 'user', 'action', 'ipAddress', 'timestamp'];
        const opts = { fields };

        // Convert logs to CSV
        const parser = new Parser(opts);
        const csv = parser.parse(logs);

        // Set headers for file download
        res.header('Content-Type', 'text/csv');
        res.attachment('logs.csv');
        res.send(csv);
    } catch (err) {
        console.error('Error exporting logs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear all logs
router.delete('/clearlogs', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Log.deleteMany(); // Deletes all documents in the logs collection
        res.json({ message: 'All logs have been cleared.' });
    } catch (err) {
        console.error('Error clearing logs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/inventorylogs', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const logs = await TransactionLog.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        console.error('Error fetching transaction logs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/exportinventorylogs', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const logs = await TransactionLog.find().sort({ timestamp: -1 });

        // Define fields for CSV
        const fields = ['_id', 'itemName', 'action', 'quantity', 'performedBy', 'timestamp'];
        const opts = { fields };

        // Convert logs to CSV
        const parser = new Parser(opts);
        const csv = parser.parse(logs);

        // Set headers for file download
        res.header('Content-Type', 'text/csv');
        res.attachment('inventory_logs.csv');
        res.send(csv);
    } catch (err) {
        console.error('Error exporting logs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/clearinventorylogs', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await TransactionLog.deleteMany();
        res.json({ message: 'All logs have been cleared.' }); 
    } catch (err) {
        console.error('Error clearing logs:', err);
        res.status(500).json({ error: 'Internal server error' }); 
    }
});
module.exports = router;