import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchBlogById } from '../features/blogs/blogsSlice';

const STEPS = ['pending', 'researching', 'planning', 'writing', 'editing', 'completed'];

const statusColors = {
  pending: 'bg-slate-700 text-slate-300',
  researching: 'bg-blue-900/60 text-blue-300',
  planning: 'bg-blue-900/60 text-blue-300',
  writing: 'bg-indigo-900/60 text-indigo-300',
  editing: 'bg-purple-900/60 text-purple-300',
  completed: 'bg-emerald-900/60 text-emerald-300',
  failed: 'bg-red-900/60 text-red-300',
};

const BlogDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentBlog: blog, loading } = useSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(fetchBlogById(id));
    const interval = setInterval(() => {
      if (blog && !['completed', 'failed'].includes(blog.status)) {
        dispatch(fetchBlogById(id));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [dispatch, id, blog?.status]);

  if (loading && !blog) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-400">Loading...</div>;
  }

  if (!blog) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center">Blog not found</div>;
  }

  const currentStepIndex = STEPS.indexOf(blog.status);
  const wordCount = blog.content?.trim().split(/\s+/).filter(Boolean).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));
  const createdDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently created';

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/dashboard"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <span aria-hidden="true">←</span> Back to My Blogs
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-3xl border border-dark-700 bg-gradient-to-br from-dark-800 via-dark-800 to-primary-900/30 px-6 py-8 shadow-xl sm:px-10 sm:py-12"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="relative max-w-4xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className={`badge ${statusColors[blog.status] || statusColors.pending}`}>
              {blog.status}
            </span>
            {blog.tone && (
              <span className="rounded-full border border-dark-600 bg-dark-900/40 px-3 py-1 text-xs font-medium capitalize text-slate-300">
                {blog.tone}
              </span>
            )}
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary-300">
            BlogCraft · AI-generated article
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {blog.title || blog.topic}
          </h1>
          {blog.title && blog.topic && blog.title !== blog.topic && (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-400 sm:text-lg">
              {blog.topic}
            </p>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-sm text-slate-400">
            {blog.audience && (
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="text-primary-300">◉</span>
                For {blog.audience}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="text-primary-300">▦</span>
              {createdDate}
            </span>
            {blog.status === 'completed' && (
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="text-primary-300">◷</span>
                {readingTime} min read
              </span>
            )}
          </div>
        </div>
      </motion.header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="min-w-0"
        >
        {/* Progress steps */}
        {!['completed', 'failed'].includes(blog.status) && (
          <div className="mb-6 rounded-2xl border border-dark-700 bg-dark-800 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-white">Your article is in progress</h2>
                <p className="mt-1 text-sm text-slate-400">We’ll keep this page updated automatically.</p>
              </div>
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-primary-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {STEPS.slice(0, -1).map((step, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={step}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`rounded-xl border px-3 py-2.5 text-center text-xs font-semibold capitalize ${
                      isDone
                        ? 'border-emerald-800/70 bg-emerald-950/40 text-emerald-300'
                        : isCurrent
                          ? 'border-primary-500/60 bg-primary-600/20 text-primary-200'
                          : 'border-dark-700 bg-dark-900/50 text-slate-500'
                    }`}
                  >
                    {isDone && <span aria-hidden="true" className="mr-1">✓</span>}
                    {step}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {blog.status === 'failed' && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-800 bg-red-950/40 p-5 text-red-200">
            <strong>Generation failed:</strong> {blog.errorMessage || 'Unknown error'}
          </div>
        )}

        {blog.status === 'completed' && blog.content && (
          <article className="overflow-hidden rounded-2xl border border-dark-700 bg-dark-800 shadow-lg">
            <div className="flex items-center justify-between gap-4 border-b border-dark-700 px-6 py-4 sm:px-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">The article</p>
                <p className="mt-1 text-xs text-slate-500">{wordCount.toLocaleString()} words</p>
              </div>
              <span aria-hidden="true" className="text-xl text-primary-300">✦</span>
            </div>
            <div className="markdown-content px-6 py-7 sm:px-10 sm:py-10">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ node, ...props }) => (
                    <div className="markdown-table-wrap">
                      <table {...props} />
                    </div>
                  ),
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>
          </article>
        )}

        {blog.status !== 'completed' && blog.researchBrief && (
          <div className="rounded-2xl border border-dark-700 bg-dark-800 p-5 sm:p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">Research preview</p>
            <h2 className="mb-4 text-lg font-semibold text-white">The groundwork</h2>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-dark-600/70 bg-dark-900/70 p-4 text-sm leading-relaxed text-slate-300">
              {blog.researchBrief.slice(0, 900)}
              {blog.researchBrief.length > 900 ? '…' : ''}
            </pre>
          </div>
        )}
        </motion.section>

        <aside className="space-y-4">
          {blog.seoData?.primaryKeyword && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="rounded-2xl border border-dark-700 bg-dark-800 p-5"
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">Discoverability</p>
              <h2 className="mb-4 text-lg font-semibold text-white">SEO details</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Primary keyword</p>
                  <span className="inline-flex rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 font-medium text-primary-200">
                    {blog.seoData.primaryKeyword}
                  </span>
                </div>
                {blog.seoData.secondaryKeywords?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Related keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {blog.seoData.secondaryKeywords.map((keyword) => (
                        <span key={keyword} className="rounded-full border border-dark-600 bg-dark-900/50 px-2.5 py-1 text-xs text-slate-300">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {blog.seoData.metaDescription && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Meta description</p>
                    <p className="leading-relaxed text-slate-300">{blog.seoData.metaDescription}</p>
                  </div>
                )}
              </div>
            </motion.section>
          )}
          <div className="rounded-2xl border border-dark-700/80 bg-dark-800/50 p-5">
            <p className="text-sm font-semibold text-slate-200">Made with BlogCraft</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Research, planning, SEO, writing, and editing brought together in one workflow.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default BlogDetail;
