import axios from 'axios';

// Kehityksessä: http://localhost:3001/api, tuotannossa: /api (sama palvelin)
const API_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

// Lisää token automaattisesti kaikkiin pyyntöihin
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jos 401, poista token -> ohjaa loginiin
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.endsWith('/login')) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const login = async (password) => {
  const response = await axios.post(`${API_URL}/login`, { password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`);
  } finally {
    localStorage.removeItem('token');
  }
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

export const fetchData = async () => {
  const response = await axios.get(`${API_URL}/data`);
  return response.data;
};

export const saveData = async (data) => {
  const response = await axios.post(`${API_URL}/data`, data);
  return response.data;
};

export const addPlace = async (cityKey, place) => {
  const response = await axios.post(`${API_URL}/places`, { cityKey, place });
  return response.data;
};

export const updatePlace = async (id, updates) => {
  const response = await axios.put(`${API_URL}/places/${id}`, updates);
  return response.data;
};

export const deletePlace = async (id) => {
  const response = await axios.delete(`${API_URL}/places/${id}`);
  return response.data;
};
