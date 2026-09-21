const express = require('express');
const router = express.Router();
const { getStats, getUsers, deletePostAdmin } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/posts/:id', deletePostAdmin);

module.exports = router;
