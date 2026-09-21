const SavedPost = require('../models/SavedPost');
const Post = require('../models/Post');
const { getPagination, formatPaginationResponse } = require('../utils/pagination');

// @desc    Get user's saved posts
// @route   GET /api/saved
// @access  Private
const getSavedPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, 12);
    const userId = req.user._id;

    const total = await SavedPost.countDocuments({ user: userId });
    const savedRecords = await SavedPost.find({ user: userId })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'fullName username profileImage department isOnline'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Extract posts, mark isLiked and isSaved: true
    const posts = savedRecords
      .filter(record => record.post) // Filter out nulls if post was deleted
      .map(record => {
        const postObj = record.post.toObject();
        const isLiked = postObj.likes && postObj.likes.some(
          id => id.toString() === userId.toString()
        );
        return {
          ...postObj,
          isLiked: !!isLiked,
          isSaved: true
        };
      });

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(posts, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a post
// @route   POST /api/saved/:postId
// @access  Private
const savePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const existingSave = await SavedPost.findOne({ user: userId, post: postId });
    if (existingSave) {
      return res.status(200).json({
        success: true,
        message: 'Post already saved.',
        data: { isSaved: true }
      });
    }

    await SavedPost.create({ user: userId, post: postId });

    res.status(201).json({
      success: true,
      message: 'Post saved to your collection.',
      data: { isSaved: true }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave a post
// @route   DELETE /api/saved/:postId
// @access  Private
const unsavePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    await SavedPost.findOneAndDelete({ user: userId, post: postId });

    res.status(200).json({
      success: true,
      message: 'Post removed from saved collection.',
      data: { isSaved: false }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSavedPosts,
  savePost,
  unsavePost
};
