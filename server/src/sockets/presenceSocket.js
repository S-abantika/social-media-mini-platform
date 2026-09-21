const User = require('../models/User');

// In-memory map: userId -> Set of active socket IDs
const activeUsers = new Map();

const handlePresence = (io, socket) => {
  const userId = socket.userId;

  if (!userId) return;

  // Add socket ID to user's set of active sockets
  if (!activeUsers.has(userId)) {
    activeUsers.set(userId, new Set());
  }
  const userSockets = activeUsers.get(userId);
  const wasOffline = userSockets.size === 0;
  userSockets.add(socket.id);

  // If this is the user's first active connection, broadcast online status
  if (wasOffline) {
    User.findByIdAndUpdate(userId, { isOnline: true }).exec().catch(err =>
      console.error('[SocketPresence] Error setting online:', err.message)
    );
    io.emit('user_online', { userId });
  }

  // Handle disconnect
  socket.on('disconnect', async () => {
    if (activeUsers.has(userId)) {
      const sockets = activeUsers.get(userId);
      sockets.delete(socket.id);

      if (sockets.size === 0) {
        activeUsers.delete(userId);
        const lastSeen = new Date();

        try {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen
          });
          io.emit('user_offline', { userId, lastSeen });
        } catch (err) {
          console.error('[SocketPresence] Error setting offline:', err.message);
        }
      }
    }
  });
};

const getOnlineUserIds = () => {
  return Array.from(activeUsers.keys());
};

module.exports = {
  handlePresence,
  getOnlineUserIds
};
