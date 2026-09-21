const jwt = require('jsonwebtoken');
const { handlePresence } = require('./presenceSocket');
const handleChat = require('./chatSocket');
const { setNotificationIO } = require('../services/notificationService');

const initSocket = (io) => {
  // Pass io instance to notification service
  setNotificationIO(io);

  // Authentication Handshake Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: Token required.'));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'connectly_secret_fallback_2026'
      );
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    // Join user's personal room for direct notifications and events
    const userRoom = `user_${socket.userId}`;
    socket.join(userRoom);

    // Register modular event listeners
    handlePresence(io, socket);
    handleChat(io, socket);
  });
};

module.exports = initSocket;
