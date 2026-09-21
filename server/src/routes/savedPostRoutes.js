const express = require('express');
const router = express.Router();
const {
  getSavedPosts,
  savePost,
  unsavePost
} = require('../controllers/savedPostController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSavedPosts);
router.post('/:postId', protect, savePost);
router.delete('/:postId', protect, unsavePost);

module.exports = router;
