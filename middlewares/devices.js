const Device = require('../models/devices'); // Note the capital D in Device

const checkDeviceStatus = async (deviceId) => {
    try {
        const currentTime = new Date();
        const deviceDoc = await Device.findById(deviceId);
        
        if (!deviceDoc) {
            return null;
        }

        const lastSyncTime = deviceDoc.LastSync || new Date(0);
        const timeDiff = currentTime - lastSyncTime;
        const isActive = timeDiff <= 15000;

        return await Device.findByIdAndUpdate(
            deviceId,
            { status: isActive ? 'active' : 'inactive' },
            { new: true }
        );
    } catch (error) {
        console.error('Error checking device status:', error);
        return null;
    }
};
const updateAllDevicesStatus = async () => {
    try {
        const devices = await Device.find({});
        const currentTime = new Date();
        
        await Promise.all(devices.map(async (dev) => {
            const lastSync = dev.LastSync || new Date(0);
            const timeDiff = currentTime - lastSync;
            const isActive = timeDiff <= 15000;
            
            await Device.findByIdAndUpdate(
                dev._id,
                { status: isActive ? 'active' : 'inactive' },
                { new: true }
            );
        }));
    } catch (error) {
        console.error('Error updating devices status:', error);
    }
};
module.exports = { checkDeviceStatus, updateAllDevicesStatus };