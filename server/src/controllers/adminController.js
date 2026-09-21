const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Conversation = require('../models/Conversation');
const { getPagination, formatPaginationResponse } = require('../utils/pagination');

// @desc    Get system-wide analytics and statistics
// @route   GET /api/admin/stats
// @access  Private / Admin
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalConversations = await Conversation.countDocuments();
    const activeUsers = await User.countDocuments({ isOnline: true });

    const recentUsers = await User.find()
      .select('fullName username email department createdAt isOnline')
      .sort({ createdAt: -1 })
      .limit(5);

    const popularPosts = await Post.find()
      .populate('author', 'fullName username profileImage')
      .sort({ likesCount: -1, commentsCount: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalPosts,
          totalComments,
          totalConversations,
          activeUsers
        },
        recentUsers,
        popularPosts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for moderation
// @route   GET /api/admin/users
// @access  Private / Admin
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, 10);
    const { search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search.trim(), $options: 'i' } },
        { username: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('fullName username email role department followersCount followingCount postsCount isOnline createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(users, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post as admin
// @route   DELETE /api/admin/posts/:id
// @access  Private / Admin
const deletePostAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ post: id });
    await User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Post removed by administrator.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  deletePostAdmin
};
