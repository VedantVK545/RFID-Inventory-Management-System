const Log = require('../models/log');
const requestIp = require('request-ip'); // Import the request-ip module

async function logAction(req, res, next) {
    try {

        if (req.originalUrl === '/favicon.ico' || 
            req.originalUrl === '/getallitems' || 
            req.originalUrl === '/getlogs' || 
            req.originalUrl === '/exportinventory' ||
            req.originalUrl === '/getltrans' ||
            req.originalUrl === '/getalldevices' || 
            req.originalUrl === '/inventorylogs' || 
            req.originalUrl === '/login' || 
            req.originalUrl === '/logout' || 
            req.originalUrl === '/getallusers' || 
            req.originalUrl.startsWith('/updatesync')||
            req.originalUrl.startsWith('/ask-ai'))
        {
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
                user: req.device ? 'RFID Device' : (req.session?.username || 'Guest'),
                action: `${req.method} ${req.originalUrl}`, 
                ipAddress: ipAddress,
                timestamp: new Date(),
                requestBody: req.body || {},
            });

            await logEntry.save();
        }
    } catch (err) {
        console.error('Error saving log:', err);
    }
    next();
}

module.exports = logAction;