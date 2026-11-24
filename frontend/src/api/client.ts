import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set initial token if already stored
const initialToken = localStorage.getItem('lumina_token');
if (initialToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumina_token');
  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    delete api.defaults.headers.common['Authorization'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthUrl =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');
      if (!isAuthUrl && localStorage.getItem('lumina_token')) {
        localStorage.removeItem('lumina_token');
        localStorage.removeItem('lumina_user');
        delete api.defaults.headers.common['Authorization'];
      }
    }
    return Promise.reject(error);
  }
);

export default api;
