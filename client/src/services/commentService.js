import api from './api';

export const commentService = {
  getComments: async (postId) => {
    const res = await api.get(`/comments/post/${postId}`);
    return res.data;
  },

  addComment: async (postId, { content, parentComment = null }) => {
    const res = await api.post(`/comments/post/${postId}`, {
      content,
      parentComment
    });
    return res.data;
  },

  deleteComment: async (commentId) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  }
};
