import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const baseURL = import.meta.env.DEV || !backendUrl
  ? '/api'
  : `${backendUrl}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
