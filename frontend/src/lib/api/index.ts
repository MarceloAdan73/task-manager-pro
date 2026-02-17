// TYPESCRIPT BACKEND CONNECTION - Task Manager Pro
// Connects to real backend using environment variables
import { Task, CreateTaskDTO, UpdateTaskDTO } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
const STORAGE_KEY = 'task_manager_tasks_v1';

// Get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Parse dates from backend response
const parseDates = (task: any): Task => ({
  ...task,
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt)
});

// Helper for fetch with error handling + JWT
async function fetchWithError<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    throw new Error(
      errorData.error?.message ||
      errorData.message ||
      `HTTP error ${response.status}`
    );
  }

  const data = await response.json();

  if (data.success && data.data !== undefined) {
    return data.data;
  }

  return data;
}

// Read tasks from localStorage
const getTasksFromStorage = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save tasks to localStorage
const saveTasksToStorage = (tasks: Task[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

// Get default fallback tasks
const getDefaultTasks = (): Task[] => [
  {
    id: 'default-1',
    title: '⚠️ Backend unavailable - Using sample data',
    description: 'Connect the backend to manage your tasks',
    priority: 'MEDIUM',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Fetch all tasks FROM BACKEND with localStorage fallback
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    console.log('[API] Connecting to backend at:', API_BASE_URL);
    const tasks = await fetchWithError<Task[]>(`${API_BASE_URL}/tasks`);
    console.log(`[API] ${tasks.length} tasks received`);
    
    // Save to localStorage as backup
    saveTasksToStorage(tasks);
    
    return tasks.map(parseDates);
  } catch (error) {
    console.error('[API] Error connecting to backend, using localStorage:', error);
    
    // Try to get from localStorage
    const storedTasks = getTasksFromStorage();
    if (storedTasks.length > 0) {
      return storedTasks.map(parseDates);
    }
    
    // If no localStorage, use default tasks
    return getDefaultTasks();
  }
};

// Create new task IN BACKEND with localStorage fallback
export const createTask = async (data: CreateTaskDTO): Promise<Task> => {
  try {
    console.log('[API] Sending task to backend...');

    const taskData = {
      ...data,
      priority: data.priority.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW'
    };

    const task = await fetchWithError<Task>(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData)
    });

    console.log(`[API] Task created: "${task.title}"`);
    
    // Update localStorage
    const tasks = getTasksFromStorage();
    saveTasksToStorage([...tasks, task]);
    
    return parseDates(task);
  } catch (error) {
    console.error('[API] Error creating task, saving to localStorage:', error);
    
    // Create task in localStorage
    const newTask: Task = {
      id: `local-${Date.now()}`,
      ...data,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const tasks = getTasksFromStorage();
    saveTasksToStorage([...tasks, newTask]);
    
    return newTask;
  }
};

// Update task IN BACKEND with localStorage fallback
export const updateTask = async (
  id: string,
  updates: UpdateTaskDTO
): Promise<Task> => {
  try {
    console.log(`[API] Updating task ${id}...`);

    const updateData = { ...updates };
    if (updateData.priority) {
      updateData.priority = updateData.priority.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW';
    }

    const task = await fetchWithError<Task>(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    console.log(`[API] Task updated: "${task.title}"`);
    
    // Update localStorage
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = task;
      saveTasksToStorage(tasks);
    }
    
    return parseDates(task);
  } catch (error) {
    console.error('[API] Error updating task, updating localStorage:', error);
    
    // Update in localStorage
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() };
      saveTasksToStorage(tasks);
      return tasks[index];
    }
    
    throw new Error('Task not found in localStorage');
  }
};

// Delete task IN BACKEND with localStorage fallback
export const deleteTask = async (id: string): Promise<void> => {
  try {
    console.log(`[API] Deleting task ${id}...`);

    await fetchWithError(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE'
    });

    console.log(`[API] Task ${id} deleted`);
    
    // Delete from localStorage
    const tasks = getTasksFromStorage();
    saveTasksToStorage(tasks.filter(t => t.id !== id));
  } catch (error) {
    console.error('[API] Error deleting task, removing from localStorage:', error);
    
    // Delete from localStorage
    const tasks = getTasksFromStorage();
    saveTasksToStorage(tasks.filter(t => t.id !== id));
  }
};

// Toggle task completion IN BACKEND
export const toggleTaskCompletion = async (id: string): Promise<Task> => {
  try {
    console.log(`[API] Toggling completion for task ${id}...`);

    const task = await fetchWithError<Task>(`${API_BASE_URL}/tasks/${id}/toggle`, {
      method: 'PATCH'
    });

    console.log(`[API] Task ${id} ${task.completed ? 'completed' : 'incomplete'}`);
    
    // Update localStorage
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = task;
      saveTasksToStorage(tasks);
    }
    
    return parseDates(task);
  } catch (error) {
    console.error('[API] Error toggling completion:', error);
    throw error;
  }
};

// Verify backend connection
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
