import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.REACT_APP_API_BASE_URL ||
                     'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout for production
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`📥 API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error: Please check if the backend server is running');
    }
    
    return Promise.reject(error);
  }
);

// Export API methods
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (course) => api.post('/courses', course),
  update: (id, course) => api.put(`/courses/${id}`, course),
  delete: (id) => api.delete(`/courses/${id}`),
  getAvailable: () => api.get('/courses/available'),
  search: (title) => api.get(`/courses/search?title=${encodeURIComponent(title)}`)
};

export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  getByStudentId: (studentId) => api.get(`/students/student-id/${studentId}`),
  create: (student) => api.post('/students', student),
  update: (id, student) => api.put(`/students/${id}`, student),
  delete: (id) => api.delete(`/students/${id}`),
  search: (name) => api.get(`/students/search?name=${encodeURIComponent(name)}`),
  getByMajor: (major) => api.get(`/students/major/${encodeURIComponent(major)}`)
};

export const registrationAPI = {
  getAll: () => api.get('/registrations'),
  getById: (id) => api.get(`/registrations/${id}`),
  create: (registration) => api.post('/registrations', registration),
  update: (id, registration) => api.put(`/registrations/${id}`, registration),
  delete: (id) => api.delete(`/registrations/${id}`),
  getByStudent: (studentId) => api.get(`/registrations/student/${studentId}`),
  getByCourse: (courseId) => api.get(`/registrations/course/${courseId}`),
  checkRegistration: (studentId, courseId) => api.get(`/registrations/check/${studentId}/${courseId}`)
};

// Health check
export const healthAPI = {
  check: () => axios.get(`${API_BASE_URL.replace('/api', '')}/health`)
};

export default api;
