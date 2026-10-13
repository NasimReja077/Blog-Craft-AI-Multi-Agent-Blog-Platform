import { Router } from 'express';
const router = Router();
import { generateBlog, getBlogs, getBlogById, updateBlog, deleteBlog } from '../controllers/blogController.js';
import { protect } from '../middleware/auth.js';

router.route('/').get(protect, getBlogs);
router.route('/generate').post(protect, generateBlog);
router.route('/:id').get(protect, getBlogById).put(protect, updateBlog).delete(protect, deleteBlog);

export default router;
