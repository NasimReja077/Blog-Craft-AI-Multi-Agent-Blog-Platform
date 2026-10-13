import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { getMe } from './features/auth/authSlice';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import BlogDetail from './pages/BlogDetail';

const PrivateRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <PrivateRoute>
                <Generate />
              </PrivateRoute>
            }
          />
          <Route
            path="/blogs/:id"
            element={
              <PrivateRoute>
                <BlogDetail />
              </PrivateRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
