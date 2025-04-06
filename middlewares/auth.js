const path = require('path');
const device = require('../models/devices');

function isAuthenticated(req, res, next) {
    if (req.session && req.session.success) {
        return next();
    }
    return res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    return res.sendFile(path.join(__dirname + '/../public/adminonly.html'));
}

async function isRFID(req, res, next) {
    try {
        const bearerHeader = req.headers['authorization'];

        
        if (!bearerHeader) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }

        // Check if bearer format is correct
        if (!bearerHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Invalid token format. Use Bearer token.' 
            });
        }

        // Extract token from Bearer header
        const token = bearerHeader.split(' ')[1];

        
        // Find device with matching API key
        const authenticatedDevice = await device.findOne({ apiKey: token });

        
        if (!authenticatedDevice) {
            return res.status(403).json({ 
                error: 'Invalid API key.' 
            });
        }

        // Add device info to request object and set a flag
        req.device = authenticatedDevice;
        req.isRFIDDevice = true; // Add explicit flag

        return next();
        
    } catch (error) {
        return res.status(500).json({ 
            error: 'Error authenticating device.' 
        });
    }
}

module.exports = { isAuthenticated, isAdmin, isRFID };