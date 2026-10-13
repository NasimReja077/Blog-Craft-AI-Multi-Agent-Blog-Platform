const express = require('express');
const router = express.Router();
const {
  generateBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getBlogs);
router.route('/generate').post(protect, generateBlog);
router.route('/:id').get(protect, getBlogById).put(protect, updateBlog).delete(protect, deleteBlog);

module.exports = router;
