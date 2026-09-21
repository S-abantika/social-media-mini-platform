import api from './api';

export const savedService = {
  getSavedPosts: async (page = 1) => {
    const res = await api.get(`/saved?page=${page}`);
    return res.data;
  },

  savePost: async (postId) => {
    const res = await api.post(`/saved/${postId}`);
    return res.data;
  },

  unsavePost: async (postId) => {
    const res = await api.delete(`/saved/${postId}`);
    return res.data;
  }
};
