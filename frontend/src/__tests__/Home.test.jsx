import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Home from '../pages/Home.jsx';
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

describe('Home Page', () => {
  it('renders the main heading', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText(/Multi-Agent AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Blog Content Platform/i)).toBeInTheDocument();
  });

  it('shows agent cards', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText('Research Agent')).toBeInTheDocument();
    expect(screen.getByText('Writer Agent')).toBeInTheDocument();
    expect(screen.getByText('Editor Agent')).toBeInTheDocument();
  });

  it('shows Start Free when not logged in', () => {
    const store = createTestStore({ auth: { user: null, token: null } });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText(/Start Free/i)).toBeInTheDocument();
  });
});
