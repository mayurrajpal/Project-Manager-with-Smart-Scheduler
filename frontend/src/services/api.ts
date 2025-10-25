import axios from 'axios';
import { 
  AuthResponse, 
  CreateProjectRequest, 
  CreateTaskRequest, 
  Project, 
  UpdateTaskRequest,
  ScheduleResponse,
  TaskConflict,
  ProductivityInsights
} from '../types';

// Backend configured to run on http://localhost:5211 (see ProjectManager.API/Properties/launchSettings.json)
const API_BASE_URL = 'http://localhost:5211/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  createTask: async (projectId: number, data: CreateTaskRequest): Promise<void> => {
    await api.post(`/projects/${projectId}/tasks`, data);
  },
};

// Tasks API
export const tasksAPI = {
  update: async (taskId: number, data: UpdateTaskRequest): Promise<void> => {
    await api.put(`/tasks/${taskId}`, data);
  },
  delete: async (taskId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },
};

// Scheduler API
export const schedulerAPI = {
  autoSchedule: async (): Promise<ScheduleResponse> => {
    const response = await api.post<ScheduleResponse>('/scheduler/auto-schedule');
    return response.data;
  },

  getConflicts: async (): Promise<TaskConflict[]> => {
    const response = await api.get<TaskConflict[]>('/scheduler/conflicts');
    return response.data;
  },

  getInsights: async (): Promise<ProductivityInsights> => {
    const response = await api.get<ProductivityInsights>('/scheduler/insights');
    return response.data;
  },
};

export default api;