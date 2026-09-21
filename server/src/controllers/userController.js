const User = require('../models/User');
const Follow = require('../models/Follow');
const { getPagination, formatPaginationResponse } = require('../utils/pagination');

// @desc    Get public profile by username
// @route   GET /api/users/profile/:username
// @access  Private
const getProfileByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    let isFollowing = false;
    if (req.user) {
      const followRecord = await Follow.findOne({
        follower: req.user._id,
        following: user._id
      });
      isFollowing = !!followRecord;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        isFollowing,
        isSelf: req.user ? req.user._id.toString() === user._id.toString() : false
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, location, department, website, coverImage } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (fullName) user.fullName = fullName.trim();
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (department !== undefined) user.department = department;
    if (website !== undefined) user.website = website;
    if (coverImage !== undefined) user.coverImage = coverImage;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.'
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: avatarUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully.',
      data: {
        profileImage: avatarUrl,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get followers of a user
// @route   GET /api/users/:id/followers
// @access  Private
const getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, skip } = getPagination(req.query, 15);

    const total = await Follow.countDocuments({ following: id });
    const follows = await Follow.find({ following: id })
      .skip(skip)
      .limit(limit)
      .populate('follower', 'fullName username profileImage department bio isOnline lastSeen')
      .sort({ createdAt: -1 });

    const followers = follows.map(f => f.follower).filter(Boolean);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(followers, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users followed by a user
// @route   GET /api/users/:id/following
// @access  Private
const getFollowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, skip } = getPagination(req.query, 15);

    const total = await Follow.countDocuments({ follower: id });
    const follows = await Follow.find({ follower: id })
      .skip(skip)
      .limit(limit)
      .populate('following', 'fullName username profileImage department bio isOnline lastSeen')
      .sort({ createdAt: -1 });

    const following = follows.map(f => f.following).filter(Boolean);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(following, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by name or username
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q ? req.query.q.trim() : '';
    if (!query) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } }
      ]
    })
      .select('fullName username profileImage department bio isOnline')
      .limit(10);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested users to follow
// @route   GET /api/users/suggested
// @access  Private
const getSuggestedUsers = async (req, res, next) => {
  try {
    // Find who the current user is already following
    const followingRecords = await Follow.find({ follower: req.user._id }).select('following');
    const followingIds = followingRecords.map(f => f.following);
    followingIds.push(req.user._id); // Exclude self

    const suggested = await User.find({
      _id: { $nin: followingIds }
    })
      .select('fullName username profileImage department bio followersCount')
      .sort({ followersCount: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: suggested
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfileByUsername,
  updateProfile,
  uploadAvatar,
  getFollowers,
  getFollowing,
  searchUsers,
  getSuggestedUsers
};
