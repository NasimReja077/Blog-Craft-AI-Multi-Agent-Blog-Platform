import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

const api = axios.create({
  baseURL: backendUrl ? `${backendUrl}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
