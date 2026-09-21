import api from './api';

export const postService = {
  getFeed: async (page = 1) => {
    const res = await api.get(`/posts/feed?page=${page}`);
    return res.data;
  },

  getExplore: async ({ page = 1, tag = '', search = '' } = {}) => {
    let url = `/posts/explore?page=${page}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await api.get(url);
    return res.data;
  },

  getUserPosts: async (username, page = 1) => {
    const res = await api.get(`/posts/user/${username}?page=${page}`);
    return res.data;
  },

  getPostById: async (id) => {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },

  createPost: async (formData) => {
    // If formData is an instance of FormData, send multipart header
    const isFormData = formData instanceof FormData;
    const res = await api.post('/posts', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return res.data;
  },

  updatePost: async (id, postData) => {
    const isFormData = postData instanceof FormData;
    const res = await api.put(`/posts/${id}`, postData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return res.data;
  },

  deletePost: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },

  toggleLike: async (id) => {
    const res = await api.post(`/posts/${id}/like`);
    return res.data;
  }
};
