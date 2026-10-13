import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import blogsReducer from '../features/blogs/blogsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    blogs: blogsReducer,
  },
});
