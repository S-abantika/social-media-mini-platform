const Post = require('../models/Post');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Comment = require('../models/Comment');
const SavedPost = require('../models/SavedPost');
const { createNotification } = require('../services/notificationService');
const { getPagination, formatPaginationResponse } = require('../utils/pagination');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../services/cloudinaryService');

// Helper to attach isLiked & isSaved flags for current user
const enrichPostsWithUserFlags = async (posts, userId) => {
  if (!userId || !posts.length) return posts;

  const postIds = posts.map(p => p._id);
  const savedRecords = await SavedPost.find({
    user: userId,
    post: { $in: postIds }
  }).select('post');

  const savedSet = new Set(savedRecords.map(s => s.post.toString()));

  return posts.map(post => {
    const postObj = post.toObject ? post.toObject() : post;
    const isLiked = postObj.likes && postObj.likes.some(
      likeId => likeId.toString() === userId.toString()
    );
    const isSaved = savedSet.has(postObj._id.toString());

    return {
      ...postObj,
      isLiked: !!isLiked,
      isSaved
    };
  });
};

// @desc    Get personalized home feed
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { page, limit, skip } = getPagination(req.query, 10);

    // Get list of followed user IDs
    const follows = await Follow.find({ follower: currentUserId }).select('following');
    const followingIds = follows.map(f => f.following);
    // Include user's own posts
    followingIds.push(currentUserId);

    const total = await Post.countDocuments({ author: { $in: followingIds } });
    const posts = await Post.find({ author: { $in: followingIds } })
      .populate('author', 'fullName username profileImage department isOnline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enrichedPosts = await enrichPostsWithUserFlags(posts, currentUserId);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(enrichedPosts, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get explore / discover feed
// @route   GET /api/posts/explore
// @access  Private
const getExplore = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, 12);
    const { tag, search } = req.query;

    const filter = {};
    if (tag) {
      filter.tags = tag.toLowerCase().trim();
    }
    if (search) {
      filter.content = { $regex: search.trim(), $options: 'i' };
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('author', 'fullName username profileImage department isOnline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enrichedPosts = await enrichPostsWithUserFlags(posts, req.user ? req.user._id : null);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(enrichedPosts, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts by a specific user
// @route   GET /api/posts/user/:username
// @access  Private
const getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const { page, limit, skip } = getPagination(req.query, 10);
    const total = await Post.countDocuments({ author: user._id });
    const posts = await Post.find({ author: user._id })
      .populate('author', 'fullName username profileImage department isOnline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enrichedPosts = await enrichPostsWithUserFlags(posts, req.user ? req.user._id : null);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(enrichedPosts, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName username profileImage department bio isOnline');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const [enrichedPost] = await enrichPostsWithUserFlags([post], req.user ? req.user._id : null);

    res.status(200).json({
      success: true,
      data: enrichedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      if (isCloudinaryConfigured()) {
        const cloudUrl = await uploadToCloudinary(req.file.path, 'connectly/posts');
        if (cloudUrl) {
          imageUrl = cloudUrl;
        }
      }
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required.'
      });
    }

    // Extract hashtags like #campus #engineering #project
    const hashtagRegex = /#[a-z0-9_]+/gi;
    const extractedTags = (content.match(hashtagRegex) || []).map(t =>
      t.substring(1).toLowerCase()
    );

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      image: imageUrl,
      tags: [...new Set(extractedTags)]
    });

    // Increment user post counter
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'fullName username profileImage department isOnline');

    const [enrichedPost] = await enrichPostsWithUserFlags([populatedPost], req.user._id);

    res.status(201).json({
      success: true,
      message: 'Post published successfully.',
      data: enrichedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Authorization check
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit your own posts.'
      });
    }

    if (content) {
      post.content = content.trim();
      const hashtagRegex = /#[a-z0-9_]+/gi;
      const extractedTags = (content.match(hashtagRegex) || []).map(t =>
        t.substring(1).toLowerCase()
      );
      post.tags = [...new Set(extractedTags)];
    }

    if (req.file) {
      let postImage = `/uploads/${req.file.filename}`;
      if (isCloudinaryConfigured()) {
        const cloudUrl = await uploadToCloudinary(req.file.path, 'connectly/posts');
        if (cloudUrl) {
          postImage = cloudUrl;
        }
      }
      post.image = postImage;
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'fullName username profileImage department isOnline');

    const [enrichedPost] = await enrichPostsWithUserFlags([populatedPost], req.user._id);

    res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      data: enrichedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Authorization check
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only delete your own posts.'
      });
    }

    await Post.findByIdAndDelete(post._id);

    // Decrement user posts count
    await User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } });

    // Clean up associated comments and saved references
    await Comment.deleteMany({ post: post._id });
    await SavedPost.deleteMany({ post: post._id });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like/unlike on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Post unliked.',
        data: {
          isLiked: false,
          likesCount: post.likesCount
        }
      });
    } else {
      // Like
      post.likes.push(userId);
      post.likesCount += 1;
      await post.save();

      // Trigger notification if liking someone else's post
      await createNotification({
        recipient: post.author,
        sender: userId,
        type: 'like',
        post: post._id
      });

      return res.status(200).json({
        success: true,
        message: 'Post liked.',
        data: {
          isLiked: true,
          likesCount: post.likesCount
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeed,
  getExplore,
  getUserPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike
};
