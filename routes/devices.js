const express = require('express');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const device = require('../models/devices');
const router = express.Router();

router.get('/getalldevices', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const devices = await device.collection.find({}, { projection: { name: 1, location: 1, status: 1, LastSync: 1, created: 1} }).toArray();
        res.json(devices);
    } catch (err) {
        console.error('Error fetching devices:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/createdevice', isAuthenticated, isAdmin, async (req, res) => {
    const { name, location, status } = req.body; // Use req.body to get the data
    try {
        // Check if the device name already exists
        const existingDevice = await device.findOne({ name });
        if (existingDevice) {
            return res.status(400).json({ error: 'Device name already exists' });
        }

        // Proceed to create the new device
        const newDevice = new device({ name, location, status });
        await newDevice.save();
        res.json({ message: 'Device created successfully' });
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
module.exports = router;