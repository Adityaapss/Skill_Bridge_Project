import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me'),
};

// Skills API
export const skillsAPI = {
    getAll: (active) => api.get('/skills', { params: { active } }),
    getById: (id) => api.get(`/skills/${id}`),
    getByCategory: (category) => api.get(`/skills/category/${category}`),
    create: (data) => api.post('/skills', data),
    update: (id, data) => api.put(`/skills/${id}`, data),
    delete: (id) => api.delete(`/skills/${id}`),
    deactivate: (id) => api.delete(`/skills/${id}`),
};

// Employees API
export const employeesAPI = {
    getAll: () => api.get('/employees'),
    getById: (id) => api.get(`/employees/${id}`),
    create: (data) => api.post('/employees', data),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`),
    getDashboard: (id) => api.get(`/employees/${id}/dashboard`),
};

// Employee Skills API
export const employeeSkillsAPI = {
    getByEmployee: (employeeId) => api.get(`/employees/${employeeId}/skills`),
    add: (employeeId, data) => api.post(`/employees/${employeeId}/skills`, data),
    update: (employeeId, skillId, data) => api.put(`/employees/${employeeId}/skills/${skillId}`, data),
    delete: (employeeId, skillId) => api.delete(`/employees/${employeeId}/skills/${skillId}`),
    // Approval workflow
    getPendingForManager: (managerId) => api.get(`/employees/0/skills/pending/manager/${managerId}`),
    approve: (skillId, managerId) => api.post(`/employees/0/skills/${skillId}/approve`, { managerId }),
    reject: (skillId, managerId, rejectionReason) => api.post(`/employees/0/skills/${skillId}/reject`, { managerId, rejectionReason }),
};

// Roles & Projects API
export const rolesProjectsAPI = {
    getAll: (type, status) => api.get('/roles-projects', { params: { type, status } }),
    getById: (id) => api.get(`/roles-projects/${id}`),
    create: (data) => api.post('/roles-projects', data),
    update: (id, data) => api.put(`/roles-projects/${id}`, data),
    delete: (id) => api.delete(`/roles-projects/${id}`),
    getRequirements: (id) => api.get(`/roles-projects/${id}/requirements`),
    addRequirement: (id, data) => api.post(`/roles-projects/${id}/requirements`, data),
    updateRequirement: (id, skillId, data) => api.put(`/roles-projects/${id}/requirements/${skillId}`, data),
    deleteRequirement: (id, skillId) => api.delete(`/roles-projects/${id}/requirements/${skillId}`),
};

// Projects API (for project management)
export const projectsAPI = {
    getAll: () => api.get('/projects'),
    getOngoing: () => api.get('/projects/ongoing'),
    getUpcoming: () => api.get('/projects/upcoming'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    start: (id, requestData) => api.post(`/projects/${id}/start`, requestData),
    assignEmployee: (id, employeeId, allocationType) => api.post(`/projects/${id}/assign`, { employeeId, allocationType }),
    unassignEmployee: (id, employeeId) => api.post(`/projects/${id}/unassign`, { employeeId }),
};

// Learning Resources API
export const learningResourcesAPI = {
    getAll: (skillId, level, type) => api.get('/learning-resources', { params: { skillId, level, type } }),
    getById: (id) => api.get(`/learning-resources/${id}`),
    create: (data) => api.post('/learning-resources', data),
    update: (id, data) => api.put(`/learning-resources/${id}`, data),
    delete: (id) => api.delete(`/learning-resources/${id}`),
};

// Analytics API
export const analyticsAPI = {
    getGapAnalysis: (employeeId, roleProjectId) =>
        api.get(`/analytics/employee/${employeeId}/gap`, { params: { roleProjectId } }),
    getRecommendations: (employeeId, roleProjectId, limit = 10) =>
        api.get(`/analytics/employee/${employeeId}/recommendations`, { params: { roleProjectId, limit } }),
};

export default api;
