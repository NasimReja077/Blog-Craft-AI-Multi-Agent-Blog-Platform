const request = require('supertest');
const app = require('../app');
const Blog = require('../models/Blog');
const User = require('../models/User');

// Mock the multi-agent generator so tests don't call the real AI API
jest.mock('../utils/multiAgent', () => ({
  generateBlogWithAgents: jest.fn().mockImplementation(async (blogId) => {
    const Blog = require('../models/Blog');
    await Blog.findByIdAndUpdate(blogId, {
      status: 'completed',
      title: 'Mocked Blog Title',
      content: '# Mocked Content\n\nThis is a mocked blog post for testing.',
      researchBrief: 'Mock research brief',
      outline: 'Mock outline',
      seoData: {
        primaryKeyword: 'mock keyword',
        secondaryKeywords: ['test'],
        titleOptions: ['Mocked Blog Title'],
        metaDescription: 'Mock meta description',
        slug: 'mocked-blog-title',
      },
    });
  }),
}));

describe('Blogs API', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Blog Tester',
        email: 'blogtester@example.com',
        password: 'password123',
      });
    token = res.body.token;
    userId = res.body._id;
  });

  describe('POST /api/blogs/generate', () => {
    it('should start blog generation and return blogId', async () => {
      const res = await request(app)
        .post('/api/blogs/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          topic: 'How Multi-Agent AI Works',
          audience: 'developers',
          tone: 'professional yet conversational',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('blogId');
      expect(res.body.message).toMatch(/started/i);
      expect(res.body.status).toBe('pending');

      // Wait a bit for the mocked async generation
      await new Promise((r) => setTimeout(r, 100));

      const blog = await Blog.findById(res.body.blogId);
      expect(blog).toBeTruthy();
      expect(blog.topic).toBe('How Multi-Agent AI Works');
      expect(blog.user.toString()).toBe(userId);
    });

    it('should fail without topic', async () => {
      const res = await request(app)
        .post('/api/blogs/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ audience: 'developers' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/topic is required/i);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/blogs/generate')
        .send({ topic: 'Some Topic' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/blogs', () => {
    it('should return empty array when no blogs', async () => {
      const res = await request(app)
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return user blogs', async () => {
      await Blog.create({
        user: userId,
        topic: 'Test Blog 1',
        status: 'completed',
        title: 'Test Blog 1',
        content: 'Content here',
      });
      await Blog.create({
        user: userId,
        topic: 'Test Blog 2',
        status: 'pending',
      });

      const res = await request(app)
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/blogs');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/blogs/:id', () => {
    let blogId;

    beforeEach(async () => {
      const blog = await Blog.create({
        user: userId,
        topic: 'Single Blog',
        status: 'completed',
        title: 'Single Blog Title',
        content: '# Hello World',
      });
      blogId = blog._id.toString();
    });

    it('should return a single blog', async () => {
      const res = await request(app)
        .get(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.topic).toBe('Single Blog');
      expect(res.body.title).toBe('Single Blog Title');
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/blogs/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

    it('should not allow access to another user\'s blog', async () => {
      // Create another user
      const other = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .get(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${other.body.token}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/blogs/:id', () => {
    let blogId;

    beforeEach(async () => {
      const blog = await Blog.create({
        user: userId,
        topic: 'Editable Blog',
        status: 'completed',
        title: 'Original Title',
        content: 'Original content',
      });
      blogId = blog._id.toString();
    });

    it('should update blog title and content', async () => {
      const res = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          content: 'Updated content here',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.content).toBe('Updated content here');
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    let blogId;

    beforeEach(async () => {
      const blog = await Blog.create({
        user: userId,
        topic: 'Deletable Blog',
        status: 'completed',
      });
      blogId = blog._id.toString();
    });

    it('should delete a blog', async () => {
      const res = await request(app)
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/removed/i);

      const deleted = await Blog.findById(blogId);
      expect(deleted).toBeNull();
    });
  });
});
