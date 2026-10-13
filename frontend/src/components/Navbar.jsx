import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../features/auth/authSlice';

const linkClass = ({ isActive }) =>
  `relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
    isActive
      ? 'text-white bg-white/10'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-500/15 text-primary-300' : 'text-slate-300 hover:bg-white/5'
  }`;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    navigate('/');
  };

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || '?';

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'bg-dark-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 text-lg shadow-lg shadow-primary-500/30 transition-transform group-hover:rotate-6">
            ✍️
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            BlogCraft <span className="text-primary-400">AI</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>My Blogs</NavLink>
              <NavLink to="/generate" className={linkClass}>Generate</NavLink>

              <div className="mx-3 h-6 w-px bg-white/10" />

              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-accent-400 text-sm font-bold text-white">
                  {initial}
                </span>
                <span className="text-sm text-slate-300">Hi, {user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline text-sm py-1.5 px-3 ml-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <Link to="/register" className="btn btn-primary text-sm py-2 px-5 ml-2">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-200 hover:bg-white/5"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/5">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-accent-400 text-sm font-bold text-white">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <NavLink to="/dashboard" className={mobileLinkClass}>My Blogs</NavLink>
                  <NavLink to="/generate" className={mobileLinkClass}>Generate</NavLink>
                  <button onClick={handleLogout} className="btn btn-outline w-full mt-3">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={mobileLinkClass}>Login</NavLink>
                  <Link to="/register" className="btn btn-primary w-full mt-3">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;