import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { generateBlog } from '../features/blogs/blogsSlice';

const Generate = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('AI engineers and content creators');
  const [tone, setTone] = useState('professional yet conversational');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { generating } = useSelector((state) => state.blogs);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    try {
      const result = await dispatch(generateBlog({ topic, audience, tone })).unwrap();
      toast.success('Generation started! Agents are working...');
      navigate(`/blogs/${result.blogId}`);
    } catch (err) {
      toast.error(err || 'Failed to start generation');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Generate Blog Post</h1>
        <p className="text-slate-400 mb-8">
          Our multi-agent team (powered by Groq + LangChain) will research, plan, optimize, write, and edit a complete post.
        </p>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Topic *</label>
              <input
                type="text"
                className="input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How Multi-Agent AI is Transforming Content Creation in 2026"
                required
              />
            </div>

            <div>
              <label className="label">Target Audience</label>
              <input
                type="text"
                className="input"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Who is this for?"
              />
            </div>

            <div>
              <label className="label">Tone</label>
              <select
                className="input"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="professional yet conversational">Professional yet conversational</option>
                <option value="casual and friendly">Casual and friendly</option>
                <option value="authoritative and technical">Authoritative and technical</option>
                <option value="inspirational and engaging">Inspirational and engaging</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3" disabled={generating}>
              {generating ? 'Starting agents...' : '🚀 Start Multi-Agent Generation'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Generate;
