const express = require('express');
const router = express.Router();
const {
  getFeed,
  getExplore,
  getUserPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/feed', protect, getFeed);
router.get('/explore', protect, getExplore);
router.get('/user/:username', protect, getUserPosts);
router.get('/:id', protect, getPostById);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
