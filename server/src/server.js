require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');
const userRoutes = require('./routes/users');
const initializeSocket = require('./socket'); // Import socket logic
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', methods: ['GET', 'POST'] }
});
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', userRoutes);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
initializeSocket(io);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});