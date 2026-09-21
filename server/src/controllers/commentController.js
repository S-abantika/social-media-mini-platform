const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createNotification } = require('../services/notificationService');

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'fullName username profileImage department isOnline')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/comments/post/:postId
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required.'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentComment || null
    });

    // Increment commentsCount on Post
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'fullName username profileImage department isOnline');

    // Trigger notification to post author
    await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      comment: comment._id
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: populatedComment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }

    const post = await Post.findById(comment.post);

    // Ownership check: must be comment author, post author, or admin
    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You cannot delete this comment.'
      });
    }

    await Comment.findByIdAndDelete(comment._id);

    // Decrement post commentsCount
    if (post) {
      await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: -1 } });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  addComment,
  deleteComment
};
