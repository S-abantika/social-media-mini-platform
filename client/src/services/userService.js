import api from './api';

export const userService = {
  getProfile: async (username) => {
    const res = await api.get(`/users/profile/${username}`);
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/users/profile', profileData);
    return res.data;
  },

  uploadAvatar: async (formData) => {
    const res = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getFollowers: async (userId, page = 1) => {
    const res = await api.get(`/users/${userId}/followers?page=${page}`);
    return res.data;
  },

  getFollowing: async (userId, page = 1) => {
    const res = await api.get(`/users/${userId}/following?page=${page}`);
    return res.data;
  },

  searchUsers: async (query) => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  getSuggestedUsers: async () => {
    const res = await api.get('/users/suggested');
    return res.data;
  }
};
