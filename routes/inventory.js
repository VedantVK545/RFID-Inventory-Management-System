module.exports = (wss) => {
    const express = require('express');
    const WebSocket = require('ws');
    const { isAuthenticated, isAdmin } = require('../middlewares/auth');
    const logAction = require('../middlewares/logger');
    const fs = require('fs');
    const path = require('path');
    const router = express.Router();
    const Inventory = require('../models/inventory');
    const TransactionLog = require('../models/inventorylogs');

    // Apply the logAction middleware to all inventory routes
    router.use(logAction);

    router.get('/getallitems', isAuthenticated, async (req, res) => {
        try {
            const items = await Inventory.collection.find({}, { projection: { name: 1, tag: 1, quantity: 1, Catagory: 1, created: 1 } }).toArray();
            res.json(items);
        } catch (err) {
            console.error('Error fetching items:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/createitem', isAuthenticated, async (req, res) => {
        const { tag, quantity } = req.body;
        let adjustedQuantity = quantity > 0 ? quantity : 1;
    
        try {
            const existingItem = await Inventory.findOne({ tag });
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 0) + adjustedQuantity;
                await existingItem.save();
    
                // Log the transaction
                await TransactionLog.create({
                    action: 'add',
                    itemName: existingItem.name,
                    itemTag: existingItem.tag,
                    quantity: adjustedQuantity,
                    performedBy: req.session.username,
                });
    
                return res.json({ message: 'Item quantity updated successfully', item: existingItem });
            }
    
            const newItem = new Inventory({ tag, quantity: adjustedQuantity });
            await newItem.save();
    
            // Log the transaction
            await TransactionLog.create({
                action: 'add',
                itemName: newItem.name,
                itemTag: newItem.tag,
                quantity: adjustedQuantity,
                performedBy: req.session.username,
            });
    
            res.json({ message: 'Item created successfully', item: newItem });
        } catch (err) {
            console.error('Error creating or updating item:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/createitemx', async (req, res) => {
        const { tag, quantity } = req.body;
        let adjustedQuantity = quantity > 0 ? quantity : 1;

        try {
            const existingItem = await Inventory.findOne({ tag });
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 0) + adjustedQuantity;
                await existingItem.save();

                // Log the transaction
                await TransactionLog.create({
                    action: 'add',
                    itemName: existingItem.name,
                    itemTag: existingItem.tag,
                    quantity: adjustedQuantity,
                    performedBy: req.session.username || 'RFID Device', // Default to 'Unknown' if username is not available
                });

                // Notify WebSocket clients with 'updateItem' event
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            event: 'updateItem',
                            data: { message: 'Item quantity updated', item: existingItem }
                        }));
                    }
                });

                return res.json({ message: 'Item quantity updated successfully', item: existingItem });
            }

            const newItem = new Inventory({ tag, quantity: adjustedQuantity });
            await newItem.save();

            // Log the transaction
            await TransactionLog.create({
                action: 'add',
                itemName: newItem.name,
                itemTag: newItem.tag,
                quantity: adjustedQuantity,
                performedBy: req.session.username || 'RFID Device', 
            });

            // Notify WebSocket clients with 'itemCreated' event
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        event: 'itemCreated',
                        data: { message: 'New item created', item: newItem }
                    }));
                }
            });

            res.json({ message: 'Item created successfully', item: newItem });
        } catch (err) {
            console.error('Error creating or updating item:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/deleteitem', isAuthenticated, isAdmin, async (req, res) => {
        const { name, tag } = req.body;

        try {
            const existingItem = await Inventory.findOne({ $or: [{ name }, { tag }] });
            if (!existingItem) {
                return res.status(400).json({ error: 'Item does not exist' });
            }

            await Inventory.deleteOne({ $or: [{ name }, { tag }] });

            // Log the transaction
            await TransactionLog.create({
                action: 'remove',
                itemName: existingItem.name,
                itemTag: existingItem.tag,
                quantity: existingItem.quantity,
                performedBy: req.session.username,
            });

            res.json({ message: 'Item deleted successfully' });
        } catch (err) {
            console.error('Error deleting item:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/updateitem', isAuthenticated, async (req, res) => {
        const { name, tag, quantity, Catagory } = req.body;

        try {
            const existingItem = await Inventory.findOne({ $or: [{ name }, { tag }] });
            if (!existingItem) {
                return res.status(400).json({ error: 'Item does not exist' });
            }

            const oldQuantity = existingItem.quantity;

            await Inventory.updateOne(
                { $or: [{ name }, { tag }] },
                { $set: { name, tag, quantity, Catagory } }
            );

            // Log the transaction
            await TransactionLog.create({
                action: 'update',
                itemName: name,
                itemTag: tag,
                quantity: quantity - oldQuantity,
                performedBy: req.session.username,
            });

            // Notify WebSocket clients with 'updateItem' event
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        event: 'updateItem',
                        data: { message: 'Item quantity updated', item: existingItem }
                    }));
                }
            });

            return res.json({ message: 'Item quantity updated successfully', item: existingItem });
        } catch (err) {
            console.error('Error updating item:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/updateitemquantity', isAuthenticated, async (req, res) => {
        const { tag, quantity } = req.body;

        try {
            const existingItem = await Inventory.findOne({ tag });
            if (!existingItem) {
                return res.status(400).json({ error: 'Item does not exist' });
            }

            const oldQuantity = existingItem.quantity;
            existingItem.quantity = quantity;
            await existingItem.save();

            // Log the transaction
            await TransactionLog.create({
                action: 'updateQuantity',
                itemName: existingItem.name,
                itemTag: existingItem.tag,
                quantity: quantity - oldQuantity,
                performedBy: req.session.username || 'RFID Device', 
            });

            // Notify WebSocket clients with 'updateItem' event
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        event: 'updateItem',
                        data: { message: 'Item quantity updated', item: existingItem }
                    }));
                }
            });

            return res.json({ message: 'Item quantity updated successfully', item: existingItem });
        } catch (err) {
            console.error('Error updating item quantity:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.get('/createdummyitems', isAuthenticated, isAdmin, async (req, res) => {
        try {
            const dummyItems = [
                { name: 'Item1', tag: 'Tag1', quantity: 10, Catagory: 'Category1' },
                { name: 'Item2', tag: 'Tag2', quantity: 20, Catagory: 'Category2' },
                { name: 'Item3', tag: 'Tag3', quantity: 30, Catagory: 'Category3' },
            ];

            await Inventory.insertMany(dummyItems);
            res.json({ message: 'Dummy items created successfully' });
        } catch (err) {
            console.error('Error creating dummy items:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.get('/exportinventory', isAuthenticated, async (req, res) => {
        try {
            // Correct the projection syntax
            const items = await Inventory.find({}, 'name tag quantity Catagory created');
            
            // Add column headers
            const headers = 'name,tag,quantity,Catagory,created';
            
            // Generate CSV content
            const csvContent = items.map(item => `${item.name},${item.tag},${item.quantity},${item.Catagory},${item.created}`).join('\n');
            
            // Combine headers and content
            const fullCsvContent = `${headers}\n${csvContent}`;
            
            // Define the file path
            const filePath = path.join(__dirname, '../exports/inventory.csv');
            
            // Write the CSV content to a file
            fs.writeFileSync(filePath, fullCsvContent);
            
            // Send the file for download
            res.download(filePath, 'inventory.csv', (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    res.status(500).send('Error downloading file');
                }
                fs.unlinkSync(filePath); // Delete the file after download
            });
        } catch (err) {
            console.error('Error exporting inventory:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};