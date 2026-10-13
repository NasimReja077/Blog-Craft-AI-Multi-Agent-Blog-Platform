import asyncHandler from 'express-async-handler';
import Blog from '../models/Blog.js';
import multiAgent from '../utils/multiAgent.js';

const { generateBlogWithAgents } = multiAgent;

// @desc    Start AI blog generation (Multi-Agent)
// @route   POST /api/blogs/generate
// @access  Private
const generateBlog = asyncHandler(async (req, res) => {
  const { topic, audience, tone } = req.body;

  if (!topic) {
    res.status(400);
    throw new Error('Topic is required');
  }

  // Create blog document in pending state
  const blog = await Blog.create({
    user: req.user._id,
    topic,
    audience: audience || 'general audience',
    tone: tone || 'professional yet conversational',
    status: 'pending',
  });

  // Respond immediately so frontend can show "generating..."
  res.status(201).json({
    message: 'Blog generation started',
    blogId: blog._id,
    status: blog.status,
  });

  // Run multi-agent pipeline asynchronously
  try {
    await generateBlogWithAgents(blog._id);
  } catch (error) {
    console.error('Generation failed:', error.message);
    await Blog.findByIdAndUpdate(blog._id, {
      status: 'failed',
      errorMessage: error.message,
    });
  }
});

// @desc    Get all blogs for logged in user
// @route   GET /api/blogs
// @access  Private
const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(blogs);
});

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Private
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }

  // Make sure user owns the blog
  if (blog.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json(blog);
});

// @desc    Update blog (title / content)
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }

  if (blog.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title || blog.title,
      content: req.body.content || blog.content,
    },
    { new: true }
  );

  res.status(200).json(updatedBlog);
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }

  if (blog.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await blog.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Blog removed' });
});

export {
  generateBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
