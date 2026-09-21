const Notification = require('../models/Notification');

let ioInstance = null;

const setNotificationIO = (io) => {
  ioInstance = io;
};

const createNotification = async ({ recipient, sender, type, post = null, comment = null }) => {
  try {
    // Avoid notifying yourself
    if (recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      comment
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'fullName username profileImage')
      .populate('post', 'content image');

    // Real-time emission via Socket.IO if user room is active
    if (ioInstance) {
      ioInstance.to(`user_${recipient.toString()}`).emit('new_notification', populatedNotification);
    }

    return populatedNotification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
};

module.exports = {
  setNotificationIO,
  createNotification
};
