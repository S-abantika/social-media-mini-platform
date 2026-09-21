const express = require('express');
const router = express.Router();
const {
  getProfileByUsername,
  updateProfile,
  uploadAvatar,
  getFollowers,
  getFollowing,
  searchUsers,
  getSuggestedUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/search', protect, searchUsers);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/profile/:username', protect, getProfileByUsername);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);

module.exports = router;
