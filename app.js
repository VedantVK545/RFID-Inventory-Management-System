const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();
const WebSocket = require('ws'); // Add WebSocket
const cors = require('cors');
const http = require('http'); // Use HTTP server for WebSocket integration
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const pageRoutes = require('./routes/pages');
const cssroutes = require('./routes/cssroutes');
const { isAuthenticated } = require('./middlewares/auth');
const jsroutes = require('./routes/jsroutes');
const Inventory = require('./routes/inventory');
const logRoutes = require('./routes/logs');
const devices = require('./routes/devices');
const forgotpass = require('./routes/forgotpass');
const logAction = require('./middlewares/logger');
const path = require('path');
const aiRoutes = require('./routes/ai'); // Add AI routes
const PORT = process.env.PORT || 3000;
const app = express();

// Create HTTP server with proper WebSocket upgrade handling
const server = http.createServer(app);
const wss = new WebSocket.Server({ 
    server: server,
    path: '/', // Explicitly set the WebSocket path
    clientTracking: true // Track connected clients
});

// Enhanced WebSocket connection handler
wss.on('connection', (ws, req) => {


    // Handle client connection
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // Handle messages
    ws.on('message', (message) => {
        try {
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {

    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Add WebSocket heartbeat to detect stale connections
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

app.use(cors({ origin: '*' }));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'devil-hu-main',
    resave: false,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Add these routes for fixing the UI issues
app.get("/forceupdate", (req, res) => {
  res.sendFile(path.join(__dirname, "public/forceupdate.html"));
});

app.get("/directfix", (req, res) => {
  res.sendFile(path.join(__dirname, "public/directfix.html"));
});

// Add cache-busting headers for CSS files
app.use("/css", (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Routes
app.use(authRoutes);
app.use(userRoutes);
app.use(pageRoutes);
app.use(cssroutes);
app.use(jsroutes);
app.use(Inventory(wss)); // Pass WebSocket server to inventory routes
app.use(logAction);
app.use(logRoutes);
app.use(devices);
app.use(forgotpass);
app.use(aiRoutes); // Use AI routes
// 404 Error Page
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '/public/404.html'));
});

// Start server (keep this at the bottom of the file)
server.listen(PORT, () => {
    console.log('✅ Server is running on http://localhost:' + PORT);
});