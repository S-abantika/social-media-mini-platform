const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const getOrCreateConversation = async (userId1, userId2) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userId1, userId2] }
  }).populate('participants', 'fullName username profileImage isOnline lastSeen');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId1, userId2],
      unreadCounts: new Map()
    });

    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'fullName username profileImage isOnline lastSeen');
  }

  return conversation;
};

module.exports = {
  getOrCreateConversation
};
