import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Navbar from '../components/Navbar.jsx';
import authReducer from '../features/auth/authSlice.js';
import blogsReducer from '../features/blogs/blogsSlice.js';

const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      blogs: blogsReducer,
    },
    preloadedState,
  });

describe('Navbar', () => {
  it('renders logo', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByRole('link', { name: /BlogCraft AI/i })).toBeInTheDocument();
  });

  it('shows Login when not authenticated', () => {
    const store = createTestStore({ auth: { user: null, token: null } });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    const store = createTestStore({
      auth: { user: { name: 'Test User', email: 'test@example.com' }, token: 'fake' },
    });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText(/Hi, Test User/i)).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
