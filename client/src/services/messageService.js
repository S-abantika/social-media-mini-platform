import api from './api';

export const messageService = {
  getConversations: async () => {
    const res = await api.get('/messages/conversations');
    return res.data;
  },

  startConversation: async (recipientId) => {
    const res = await api.post('/messages/conversations', { recipientId });
    return res.data;
  },

  getMessages: async (conversationId) => {
    const res = await api.get(`/messages/${conversationId}`);
    return res.data;
  },

  sendMessage: async ({ conversationId, receiverId, content, messageType = 'text' }) => {
    const res = await api.post('/messages', {
      conversationId,
      receiverId,
      content,
      messageType
    });
    return res.data;
  }
};
