import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  generating: false,
  error: null,
};

export const fetchBlogs = createAsyncThunk('blogs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/blogs');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch blogs');
  }
});

export const fetchBlogById = createAsyncThunk('blogs/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/blogs/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch blog');
  }
});

export const generateBlog = createAsyncThunk(
  'blogs/generate',
  async ({ topic, audience, tone }, { rejectWithValue }) => {
    try {
      const res = await api.post('/blogs/generate', { topic, audience, tone });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Generation failed');
    }
  }
);

export const deleteBlog = createAsyncThunk('blogs/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/blogs/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Delete failed');
  }
});

const blogsSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateBlog.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateBlog.fulfilled, (state, action) => {
        state.generating = false;
      })
      .addCase(generateBlog.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b) => b._id !== action.payload);
      });
  },
});

export const { clearCurrentBlog, clearError } = blogsSlice.actions;
export default blogsSlice.reducer;
