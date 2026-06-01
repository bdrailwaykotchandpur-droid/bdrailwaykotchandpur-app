// src/services/api.js
// Use direct backend URL - bypass Vercel proxy completely
const API_BASE_URL = 'https://bdrailwaykotchandpur.onrender.com';

console.log('API Base URL:', API_BASE_URL);

import localforage from 'localforage';

const apiCall = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const isFormData = options.body instanceof FormData;
  
  const config = {
    method: options.method || 'GET',
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  };

  if (isFormData && config.headers['Content-Type']) {
    delete config.headers['Content-Type'];
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !isFormData && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const cacheKey = `api_cache_${cleanEndpoint}`;

  try {
    console.log(`API Request: ${config.method} ${url}`);
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    // Cache successful GET responses
    if (config.method === 'GET') {
      try {
        await localforage.setItem(cacheKey, data);
      } catch (err) {
        console.error('Cache save error:', err);
      }
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // If GET request fails (e.g. offline), try to serve from cache
    if (config.method === 'GET') {
      console.log(`Attempting to load from cache for ${cleanEndpoint}`);
      try {
        const cachedData = await localforage.getItem(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      } catch (err) {
        console.error('Cache read error:', err);
      }
    }

    throw error;
  }
};

// Export all your API methods
export const healthAPI = {
  check: () => apiCall('/api/health'),
};

export const authAPI = {
  login: (credentials) => apiCall('/api/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiCall('/api/auth/register', { method: 'POST', body: userData }),
};

export const trainsAPI = {
  getAll: () => apiCall('/api/trains'),
  getById: (id) => apiCall(`/api/trains/${id}`),
  create: (trainData) => apiCall('/api/trains', { method: 'POST', body: trainData }),
  update: (id, trainData) => apiCall(`/api/trains/${id}`, { method: 'PUT', body: trainData }),
  delete: (id) => apiCall(`/api/trains/${id}`, { method: 'DELETE' }),
};

export const newsAPI = {
  getAll: () => apiCall('/api/news'),
  getById: (id) => apiCall(`/api/news/${id}`),
  create: (newsData) => apiCall('/api/news', { method: 'POST', body: newsData }),
  update: (id, newsData) => apiCall(`/api/news/${id}`, { method: 'PUT', body: newsData }),
  delete: (id) => apiCall(`/api/news/${id}`, { method: 'DELETE' }),
};

export const productsAPI = {
  getAll: () => apiCall('/api/products'),
  getById: (id) => apiCall(`/api/products/${id}`),
  create: (productData) => apiCall('/api/products', { method: 'POST', body: productData }),
  update: (id, productData) => apiCall(`/api/products/${id}`, { method: 'PUT', body: productData }),
  delete: (id) => apiCall(`/api/products/${id}`, { method: 'DELETE' }),
};

export const submissionsAPI = {
  getAll: () => apiCall('/api/submissions'),
  getById: (id) => apiCall(`/api/submissions/${id}`),
  create: (submissionData) => apiCall('/api/submissions', { method: 'POST', body: submissionData }),
  update: (id, submissionData) => apiCall(`/api/submissions/${id}`, { method: 'PUT', body: submissionData }),
  delete: (id) => apiCall(`/api/submissions/${id}`, { method: 'DELETE' }),
};

export const adminAPI = {
  getStats: () => apiCall('/api/admin/dashboard/stats'),
  getUsers: () => apiCall('/api/admin/users'),
  updateUser: (id, userData) => apiCall(`/api/admin/users/${id}`, { method: 'PUT', body: userData }),
  deleteUser: (id) => apiCall(`/api/admin/users/${id}`, { method: 'DELETE' }),
};
// Add to api.js - Admin Import API
export const adminImportAPI = {
  importStations: () => apiCall('/api/import/stations', { method: 'POST' }),
  importTrains: () => apiCall('/api/import/trains', { method: 'POST' }),
  getStatus: () => apiCall('/api/import/status'),
};

export const locationsAPI = {
  submit: (data) => apiCall('/api/locations/submit', { method: 'POST', body: data }),
  getTrainLocation: (trainId) => apiCall(`/api/locations/train/${trainId}`),
  getAllLocations: () => apiCall('/api/locations/all'),
  getPendingUpdates: () => apiCall('/api/locations/admin/pending'),
  getAllUpdates: (status) => apiCall(`/api/locations/admin/all${status ? `?status=${status}` : ''}`),
  approveUpdate: (id) => apiCall(`/api/locations/admin/approve/${id}`, { method: 'PATCH' }),
  rejectUpdate: (id, rejectionReason) => apiCall(`/api/locations/admin/reject/${id}`, { method: 'PATCH', body: { rejectionReason } }),
  deleteUpdate: (id) => apiCall(`/api/locations/admin/${id}`, { method: 'DELETE' }),
};

export const trainRoutesAPI = {
  getByTrainId: (trainId) => apiCall(`/api/train-routes/${trainId}`),
  create: (routeData) => apiCall('/api/train-routes', { method: 'POST', body: routeData }),
  updateLocation: (trainId, currentStation) => apiCall(`/api/train-routes/${trainId}/location`, { method: 'PUT', body: { currentStation } }),
  delete: (trainId) => apiCall(`/api/train-routes/${trainId}`, { method: 'DELETE' }),
};

export const citiesAPI = {
  getAll: () => apiCall('/api/cities'),
  search: (city, type = 'both') => apiCall(`/api/cities/search?city=${encodeURIComponent(city)}&type=${type}`),
  create: (cityData) => apiCall('/api/cities', { method: 'POST', body: cityData }),
  update: (id, cityData) => apiCall(`/api/cities/${id}`, { method: 'PUT', body: cityData }),
  delete: (id) => apiCall(`/api/cities/${id}`, { method: 'DELETE' }),
  getAllAdmin: () => apiCall('/api/cities/admin/all'),
};
// Station CRUD API
export const stationsAPI = {
  getAll: () => apiCall('/api/stations'),
  getById: (id) => apiCall(`/api/stations/${id}`),
  create: (stationData) => apiCall('/api/stations', { method: 'POST', body: stationData }),
  update: (id, stationData) => apiCall(`/api/stations/${id}`, { method: 'PUT', body: stationData }),
  delete: (id) => apiCall(`/api/stations/${id}`, { method: 'DELETE' }),
};

export default apiCall;
