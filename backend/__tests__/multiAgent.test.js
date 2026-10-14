import { jest } from '@jest/globals';

const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockInvoke = jest.fn();

jest.unstable_mockModule('../models/Blog.js', () => ({
  default: {
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
  },
}));

jest.unstable_mockModule('@langchain/groq', () => ({
  ChatGroq: jest.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}));

const { default: multiAgent } = await import('../utils/multiAgent.js');

describe('Multi-agent blog generation', () => {
  beforeEach(() => {
    mockFindById.mockResolvedValue({
      topic: 'AI in education',
      audience: 'teachers',
      tone: 'informative',
    });
    mockFindByIdAndUpdate.mockResolvedValue({});
    mockInvoke.mockReset();
  });

  it('persists each agent result and completes the blog', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'Research brief' })
      .mockResolvedValueOnce({ content: 'Blog outline' })
      .mockResolvedValueOnce({
        content: JSON.stringify({
          primaryKeyword: 'AI in education',
          secondaryKeywords: ['teaching'],
          titleOptions: ['AI in Education'],
          metaDescription: 'An informative guide to AI in education.',
          slug: 'ai-in-education',
        }),
      })
      .mockResolvedValueOnce({ content: 'Draft content' })
      .mockResolvedValueOnce({ content: 'Final content' });

    await multiAgent.generateBlogWithAgents('blog-id');

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('blog-id', {
      status: 'completed',
      content: 'Final content',
      title: 'AI in Education',
    });
    expect(mockFindByIdAndUpdate).toHaveBeenCalledTimes(8);
  });

  it('marks the blog failed when an agent fails', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Agent failed'));

    await expect(multiAgent.generateBlogWithAgents('blog-id'))
      .rejects.toThrow('Agent failed');

    expect(mockFindByIdAndUpdate).toHaveBeenLastCalledWith('blog-id', {
      status: 'failed',
      errorMessage: 'Agent failed',
    });
  });
});
