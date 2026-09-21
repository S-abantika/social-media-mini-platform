import api from './api';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (page = 1, search = '') => {
    let url = `/admin/users?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await api.get(url);
    return res.data;
  },

  deletePost: async (postId) => {
    const res = await api.delete(`/admin/posts/${postId}`);
    return res.data;
  }
};
