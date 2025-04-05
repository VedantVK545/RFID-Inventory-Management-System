const Log = require('../models/log');
const requestIp = require('request-ip'); // Import the request-ip module

async function logAction(req, res, next) {
    try {
        if (req.originalUrl === '/favicon.ico'|| req.originalUrl === '/getallitems'|| req.originalUrl === '/getlogs' || req.originalUrl === '/exportinventory' ||req.originalUrl === '/getltrans' ||req.originalUrl === '/getalldevices' || req.originalUrl === '/getalldevices' || req.originalUrl === '/inventorylogs'|| req.originalUrl === '/login')  {
            return next();
        }
        if (req.originalUrl.startsWith('/')) {
            // Use request-ip to get the client's IP address
            let ipAddress = requestIp.getClientIp(req);

            // Handle cases where the IP is "::1" (IPv6 loopback)
            if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
                ipAddress = '127.0.0.1';
            }

            // Remove "::ffff:" prefix from IPv4-mapped IPv6 addresses
            if (ipAddress.startsWith('::ffff:')) {
                ipAddress = ipAddress.replace('::ffff:', '');
            }

            const logEntry = new Log({
                user: req.session?.username || 'RFID Device', // Log the username or 'Guest' if not logged in
                action: `${req.method} ${req.originalUrl}`, // Log the HTTP method and URL
                ipAddress: ipAddress, // Log the IP address of the requester
                timestamp: new Date(), // Add a timestamp for the log entry
                requestBody: req.body || {}, // Log the request body for POST/PUT requests
            });
            await logEntry.save();
        }
    } catch (err) {
        console.error('Error saving log:', err);
    }
    next();
}

module.exports = logAction;