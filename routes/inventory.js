module.exports = (wss) => {
    const express = require('express');
    const WebSocket = require('ws');
    const { isAuthenticated, isAdmin, isRFID } = require('../middlewares/auth');
    const logAction = require('../middlewares/logger');
    const fs = require('fs');
    const path = require('path');
    const router = express.Router();
    const Inventory = require('../models/inventory');
    const TransactionLog = require('../models/inventorylogs');
    router.get('/getallitems', isAuthenticated, logAction, async (req, res) => {
        try {
            const items = await Inventory.collection.find({}, { projection: { name: 1, tag: 1, quantity: 1, Catagory: 1, created: 1 } }).toArray();
            res.json(items);
        } catch (err) {
            console.error('Error fetching items:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/createitem', isAuthenticated, logAction, async (req, res) => {
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
    
            const newItem = new Inventory({ tag, quantity: adjustedQuantity, name: `Item-${Date.now()}`, Catagory: req.body.Catagory || 'Not yet setup' });
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
    router.post('/createitemx', isRFID, logAction, async (req, res) => {
        const { tag, quantity, name, Catagory } = req.body;
        let adjustedQuantity = quantity > 0 ? quantity : 1;

        try {
            const existingItem = await Inventory.findOne({ tag });
            if (existingItem) {
                // Send update confirmation for existing items
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            event: 'confirmItemUpdate',
                            data: {
                                tag,
                                quantity: adjustedQuantity,          // New quantity to add
                                currentQuantity: existingItem.quantity || 0, // Make sure we send current quantity
                                existingItem: {
                                    ...existingItem._doc,            // Spread existing item data
                                    currentQuantity: existingItem.quantity || 0  // Add current quantity explicitly
                                }
                            }
                        }));
                    }
                });
                return res.json({ 
                    message: 'Confirmation request sent',
                    data: { 
                        tag, 
                        quantity: adjustedQuantity, 
                        currentQuantity: existingItem.quantity || 0,
                        existingItem: {
                            ...existingItem._doc,
                            currentQuantity: existingItem.quantity || 0
                        }
                    }
                });
            }

            // Only send create confirmation for new items
            const newItemData = {
                tag,
                quantity: adjustedQuantity,
                name: name || `Item-${Date.now()}`,
                Catagory: Catagory || 'Not yet setup'
            };

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        event: 'confirmItemCreate',
                        data: newItemData
                    }));
                }
            });
            return res.json({ 
                message: 'Confirmation request sent',
                data: newItemData
            });

        } catch (err) {
            console.error('Error processing item:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/confirmitemx', isAuthenticated, logAction, async (req, res) => {
        const { tag, quantity, name, Catagory, confirmed } = req.body;
        
        if (!confirmed) {
            // If not confirmed, notify clients and return
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        event: 'operationCancelled',
                        data: { message: 'Operation cancelled by user' }
                    }));
                }
            });
            return res.json({ message: 'Operation cancelled' });
        }

        try {
            let adjustedQuantity = quantity > 0 ? quantity : 1;
            const existingItem = await Inventory.findOne({ tag });
            
            if (existingItem) {
                // Update existing item logic...
                existingItem.quantity = (existingItem.quantity || 0) + adjustedQuantity;
                await existingItem.save();

                await TransactionLog.create({
                    action: 'add',
                    itemName: existingItem.name,
                    itemTag: existingItem.tag,
                    quantity: adjustedQuantity,
                    performedBy: req.session.username || 'RFID Device',
                });

                // Notify clients of successful update
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            event: 'updateItem',
                            data: { 
                                message: 'Item quantity updated', 
                                item: existingItem,
                                confirmed: true
                            }
                        }));
                    }
                });

                return res.json({ message: 'Item quantity updated successfully', item: existingItem });
            }

            // Create new item with the provided name and category
            const newItem = new Inventory({ 
                tag, 
                quantity: adjustedQuantity,
                name: name || `Item-${Date.now()}`,      // Use provided name or generate default
                Catagory: Catagory || 'Not yet setup'    // Use provided category or default
            });
            await newItem.save();

            // Log the transaction
            await TransactionLog.create({
                action: 'add',
                itemName: newItem.name,
                itemTag: newItem.tag,
                quantity: adjustedQuantity,
                performedBy: req.session.username || 'RFID Device',
            });

            // Notify clients of successful creation
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        event: 'itemCreated',
                        data: { 
                            message: 'New item created', 
                            item: newItem,
                            confirmed: true
                        }
                    }));
                }
            });

            return res.json({ message: 'Item created successfully', item: newItem });

        } catch (err) {
            console.error('Error creating or updating item:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/deleteitem', isAuthenticated, isAdmin, logAction, async (req, res) => {
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

    router.post('/updateitem', isAuthenticated, logAction,async (req, res) => {
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

    router.post('/updateitemquantity', isAuthenticated, logAction,async (req, res) => {
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


    router.get('/exportinventory', isAuthenticated,logAction, async (req, res) => {
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