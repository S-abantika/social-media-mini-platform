const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { getOrCreateConversation } = require('../services/messageService');

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'fullName username profileImage department isOnline lastSeen')
      .populate('lastMessage.sender', 'fullName username')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create conversation with a user
// @route   POST /api/messages/conversations
// @access  Private
const startConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required.'
      });
    }

    if (recipientId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself.'
      });
    }

    const conversation = await getOrCreateConversation(currentUserId, recipientId);

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    // Verify participation
    const isParticipant = conversation.participants.some(
      p => p.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You are not a participant in this conversation.'
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullName username profileImage')
      .populate('receiver', 'fullName username profileImage')
      .sort({ createdAt: 1 });

    // Mark unread messages sent by the other party as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Reset unread count for current user in conversation
    if (conversation.unreadCounts && conversation.unreadCounts.has(currentUserId.toString())) {
      conversation.unreadCounts.set(currentUserId.toString(), 0);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message (REST fallback)
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, receiverId, content, messageType } = req.body;
    const currentUserId = req.user._id;

    if (!conversationId || !receiverId || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID, receiver ID, and content are required.'
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: currentUserId,
      receiver: receiverId,
      content: content.trim(),
      messageType: messageType || 'text'
    });

    // Update conversation lastMessage & increment receiver unreadCount
    conversation.lastMessage = {
      content: content.trim(),
      sender: currentUserId,
      createdAt: new Date(),
      messageType: messageType || 'text'
    };

    const currentUnread = conversation.unreadCounts?.get(receiverId.toString()) || 0;
    conversation.unreadCounts.set(receiverId.toString(), currentUnread + 1);
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName username profileImage')
      .populate('receiver', 'fullName username profileImage');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  startConversation,
  getMessages,
  sendMessage
};
