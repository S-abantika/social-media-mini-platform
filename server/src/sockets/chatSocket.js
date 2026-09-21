const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const handleChat = (io, socket) => {
  const currentUserId = socket.userId;

  // Join a specific conversation room
  socket.on('join_conversation', (conversationId) => {
    if (!conversationId) return;
    const room = `conv_${conversationId}`;
    socket.join(room);
  });

  // Leave a conversation room
  socket.on('leave_conversation', (conversationId) => {
    if (!conversationId) return;
    const room = `conv_${conversationId}`;
    socket.leave(room);
  });

  // Send a real-time message
  socket.on('send_message', async (data, callback) => {
    try {
      const { conversationId, receiverId, content, messageType = 'text' } = data;

      if (!conversationId || !receiverId || !content || !content.trim()) {
        if (callback) callback({ success: false, message: 'Missing message parameters.' });
        return;
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        if (callback) callback({ success: false, message: 'Conversation not found.' });
        return;
      }

      // Persist message in database
      const message = await Message.create({
        conversation: conversationId,
        sender: currentUserId,
        receiver: receiverId,
        content: content.trim(),
        messageType
      });

      // Update last message preview & unread counts on Conversation
      conversation.lastMessage = {
        content: content.trim(),
        sender: currentUserId,
        createdAt: new Date(),
        messageType
      };

      const currentUnread = conversation.unreadCounts?.get(receiverId.toString()) || 0;
      conversation.unreadCounts.set(receiverId.toString(), currentUnread + 1);
      await conversation.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'fullName username profileImage')
        .populate('receiver', 'fullName username profileImage');

      // Emit to everyone in this active conversation room
      io.to(`conv_${conversationId}`).emit('receive_message', populatedMessage);

      // Also emit to the receiver's personal user room so their conversation list updates in real time
      io.to(`user_${receiverId}`).emit('conversation_updated', {
        conversationId,
        lastMessage: conversation.lastMessage,
        message: populatedMessage
      });

      if (callback) callback({ success: true, data: populatedMessage });
    } catch (error) {
      console.error('[SocketChat] Error in send_message:', error.message);
      if (callback) callback({ success: false, message: error.message });
    }
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, receiverId, username }) => {
    if (!conversationId) return;
    socket.to(`conv_${conversationId}`).emit('user_typing', {
      conversationId,
      userId: currentUserId,
      username
    });
  });

  // Stop typing indicator
  socket.on('stop_typing', ({ conversationId, receiverId }) => {
    if (!conversationId) return;
    socket.to(`conv_${conversationId}`).emit('user_stop_typing', {
      conversationId,
      userId: currentUserId
    });
  });

  // Mark message(s) as read
  socket.on('message_read', async ({ conversationId, messageIds, senderId }) => {
    try {
      if (!conversationId) return;

      const filter = {
        conversation: conversationId,
        receiver: currentUserId,
        isRead: false
      };

      if (messageIds && messageIds.length > 0) {
        filter._id = { $in: messageIds };
      }

      await Message.updateMany(filter, {
        isRead: true,
        readAt: new Date()
      });

      // Reset unread count for current user
      const conversation = await Conversation.findById(conversationId);
      if (conversation && conversation.unreadCounts) {
        conversation.unreadCounts.set(currentUserId.toString(), 0);
        await conversation.save();
      }

      // Notify the other user (sender) that their messages were read
      const targetRoom = senderId ? `user_${senderId}` : `conv_${conversationId}`;
      io.to(targetRoom).emit('read_receipt', {
        conversationId,
        readBy: currentUserId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('[SocketChat] Error in message_read:', error.message);
    }
  });
};

module.exports = handleChat;
