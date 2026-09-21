import api from './api';

export const followService = {
  followUser: async (userId) => {
    const res = await api.post(`/follow/${userId}`);
    return res.data;
  },

  unfollowUser: async (userId) => {
    const res = await api.delete(`/follow/${userId}`);
    return res.data;
  },

  getFollowStatus: async (userId) => {
    const res = await api.get(`/follow/status/${userId}`);
    return res.data;
  }
};
