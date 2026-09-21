const User = require('../models/User');
const Follow = require('../models/Follow');
const { createNotification } = require('../services/notificationService');

// @desc    Follow a user
// @route   POST /api/follow/:userId
// @access  Private
const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User to follow not found.'
      });
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId
    });

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: 'You are already following this user.'
      });
    }

    await Follow.create({
      follower: currentUserId,
      following: targetUserId
    });

    // Increment follower & following counts
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });
    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });

    // Trigger notification
    await createNotification({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'follow'
    });

    res.status(200).json({
      success: true,
      message: `You are now following @${targetUser.username}.`,
      data: {
        isFollowing: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/follow/:userId
// @access  Private
const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const followRecord = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId
    });

    if (!followRecord) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user.'
      });
    }

    // Decrement counts (ensure non-negative)
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });
    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Unfollowed successfully.',
      data: {
        isFollowing: false
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get follow status between current user and target user
// @route   GET /api/follow/status/:userId
// @access  Private
const getFollowStatus = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const followRecord = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId
    });

    res.status(200).json({
      success: true,
      data: {
        isFollowing: !!followRecord
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowStatus
};
