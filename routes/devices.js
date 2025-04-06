const express = require('express');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const device = require('../models/devices');
const router = express.Router();
const { checkDeviceStatus, updateAllDevicesStatus } = require('../middlewares/devices');
const crypto = require('crypto'); // Add this at the top with other requires

setInterval(updateAllDevicesStatus, 15000);

// Replace the existing getalldevices endpoint with this
router.get('/getalldevices', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const devices = await device.collection.find({}).toArray();
        const currentTime = new Date();
        
        const devicesWithStatus = devices.map(device => {
            const lastSync = device.LastSync || new Date(0);
            const timeDiff = currentTime - lastSync;
            const isActive = timeDiff <= 15000; // 15 seconds

            return {
                ...device,
                status: isActive ? 'active' : 'inactive'
            };
        });

        res.json(devicesWithStatus);
    } catch (err) {
        console.error('Error fetching devices:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/createdevice', isAuthenticated, isAdmin, async (req, res) => {
    const { name, location, status } = req.body;
    try {
        // Check if the device name already exists
        const existingDevice = await device.findOne({ name });
        if (existingDevice) {
            return res.status(400).json({ error: 'Device name already exists' });
        }
        
        // Generate API key
        const start = `API-KEY-`
        const apiKey = start + crypto.randomBytes(8).toString('hex');
        
        // Proceed to create the new device with API key
        const newDevice = new device({
            name,
            location,
            status,
            apiKey
        });
        
        await newDevice.save();
        
        // Return the API key in the response
        res.json({
            message: 'Device created successfully',
            deviceId: newDevice._id,
            apiKey: apiKey
        });
    } catch (err) {
        console.error('Error creating device:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/updatedevice/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, location, status } = req.body;
    try {
        const existingDevice = await device.findByIdAndUpdate(
            id,
            { name, location, status },
            { new: true }
        );
        if (!existingDevice) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json({ message: 'Device updated successfully' });
    } catch (err) {
        console.error('Error updating device:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/deletedevice/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedDevice = await device.findByIdAndDelete(id);
        if (!deletedDevice) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json({ message: 'Device deleted successfully' });
    } catch (err) {
        console.error('Error deleting device:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add this before module.exports
router.post('/updatesync/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedDevice = await device.findByIdAndUpdate(
            id,
            { 
                LastSync: new Date(),
                status: 'active'
            },
            { new: true }
        );

        if (!updatedDevice) {
            return res.status(404).json({ error: 'Device not found' });
        }

        // Call checkDeviceStatus after updating sync time
        await checkDeviceStatus(id);
        
        res.json({ message: 'Device sync updated successfully' });
    } catch (err) {
        console.error('Error updating device sync:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;