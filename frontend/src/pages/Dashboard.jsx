import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchBlogs, deleteBlog } from '../features/blogs/blogsSlice';

const statusColors = {
  pending: 'bg-slate-700 text-slate-300',
  researching: 'bg-blue-900/60 text-blue-300',
  planning: 'bg-blue-900/60 text-blue-300',
  writing: 'bg-indigo-900/60 text-indigo-300',
  editing: 'bg-purple-900/60 text-purple-300',
  completed: 'bg-emerald-900/60 text-emerald-300',
  failed: 'bg-red-900/60 text-red-300',
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { blogs, loading } = useSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(fetchBlogs());
    const interval = setInterval(() => dispatch(fetchBlogs()), 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      await dispatch(deleteBlog(id)).unwrap();
      toast.success('Blog deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading blogs...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Blogs</h1>
        <Link to="/generate" className="btn btn-primary">
          + New Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <h3 className="text-xl font-semibold mb-2">No blogs yet</h3>
          <p className="text-slate-400 mb-6">Generate your first AI-powered blog post</p>
          <Link to="/generate" className="btn btn-primary">
            Generate Blog
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogs.map((blog, i) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="card hover:border-primary-500/40 transition-colors"
            >
              <span className={`badge ${statusColors[blog.status] || statusColors.pending}`}>
                {blog.status}
              </span>
              <h3 className="text-lg font-semibold mt-3 mb-1 line-clamp-2">
                {blog.title || blog.topic}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                {new Date(blog.createdAt).toLocaleDateString()} · {blog.audience}
              </p>
              <div className="flex gap-2">
                <Link to={`/blogs/${blog._id}`} className="btn btn-outline flex-1 text-sm py-2">
                  View
                </Link>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="btn btn-danger text-sm py-2 px-3"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
