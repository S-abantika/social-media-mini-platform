import api from './api';

export const notificationService = {
  getNotifications: async (page = 1) => {
    const res = await api.get(`/notifications?page=${page}`);
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  }
};
