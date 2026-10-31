
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const CLIENT_URL =
  process.env.CLIENT_URL ||
  'http://localhost:5173';

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...CLIENT_URL.split(',').map(url =>
    url.trim().replace(/\/$/, '')
  )
];

// Connect to MongoDB
connectDB();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests without origin
      if (!origin) {
        return callback(null, true);
      }

      // Allow only trusted frontend origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`[Socket CORS] Blocked origin: ${origin}`);

      return callback(
        new Error(`Socket.IO CORS blocked: ${origin}`)
      );
    },

    methods: ['GET', 'POST'],
    credentials: true
  },

  pingTimeout: 60000,
  pingInterval: 25000
});

// Attach Socket Handlers
initSocket(io);

// Start Server
server.listen(PORT, () => {
  console.log('=========================================');
  console.log(' Connectly Server is running');
  console.log(` Port: ${PORT}`);
  console.log(` Client URL: ${CLIENT_URL}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(' Socket.IO Gateway active');
  console.log('=========================================');
});

// Server error handler
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[ServerError] Port ${PORT} is already in use.`);
  } else {
    console.error('[ServerError]:', err.message);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(
    `[UncaughtException] ${err.stack || err.message}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(
    `[UnhandledRejection] ${err.stack || err.message}`
  );
});
