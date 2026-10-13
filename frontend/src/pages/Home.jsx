import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const agents = [
  {
    icon: "🔍",
    title: "Research Agent",
    desc: "Gathers latest facts, trends & statistics using Groq",
  },
  {
    icon: "📋",
    title: "Planner Agent",
    desc: "Creates structured, engaging outlines",
  },
  {
    icon: "📈",
    title: "SEO Agent",
    desc: "Keywords, titles & meta optimization",
  },
  {
    icon: "✍️",
    title: "Writer Agent",
    desc: "Writes full, high-quality drafts",
  },
  {
    icon: "✏️",
    title: "Editor Agent",
    desc: "Polishes for clarity & consistency",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-semibold text-primary-300 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
          5 AI agents · one click
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
          Write better blogs
          <br />
          <span className="bg-gradient-to-r from-primary-400 via-violet-400 to-accent-400 bg-clip-text text-transparent">
            with a team of AI agents
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          A team of specialized AI agents powered by{" "}
          <strong className="text-slate-200">Groq</strong> +{" "}
          <strong className="text-slate-200">LangChain</strong> researches,
          plans, optimizes, writes, and edits high-quality blog posts for you —
          automatically.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {user ? (
            <>
              <Link
                to="/generate"
                className="btn btn-primary text-base px-8 py-3"
              >
                Generate New Blog
              </Link>
              <Link
                to="/dashboard"
                className="btn btn-outline text-base px-8 py-3"
              >
                My Blogs
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="btn btn-primary text-base px-8 py-3"
              >
                Start Free
              </Link>
              <Link to="/login" className="btn btn-outline text-base px-8 py-3">
                Login
              </Link>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {agents.map((agent) => (
          <motion.div
            key={agent.title}
            variants={item}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="card hover:border-primary-500/50 transition-colors"
          >
            <div className="text-3xl mb-3">{agent.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{agent.title}</h3>
            <p className="text-slate-400 text-sm">{agent.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;
