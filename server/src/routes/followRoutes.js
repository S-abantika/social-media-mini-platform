const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowStatus
} = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:userId', protect, followUser);
router.delete('/:userId', protect, unfollowUser);
router.get('/status/:userId', protect, getFollowStatus);

module.exports = router;
