import { supabase } from "../supabase";
import { Task, CreateTaskDTO, UpdateTaskDTO } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const STORAGE_KEY = 'task_manager_tasks_v1';

const parseDates = (task: any): Task => ({
  ...task,
  createdAt: new Date(task.created_at || task.createdAt),
  updatedAt: new Date(task.updated_at || task.updatedAt)
});

const getTasksFromStorage = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveTasksToStorage = (tasks: Task[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      const stored = getTasksFromStorage();
      if (stored.length > 0) return stored;
      return [];
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const tasks = (data || []).map(parseDates);
    saveTasksToStorage(tasks);
    return tasks;
  } catch (error) {
    console.error('[API] Error fetching tasks:', error);
    const stored = getTasksFromStorage();
    if (stored.length > 0) return stored;
    return [];
  }
};

export const createTask = async (data: CreateTaskDTO): Promise<Task> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('Not authenticated');

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        completed: false,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;

    const newTask = parseDates(task);
    const tasks = getTasksFromStorage();
    saveTasksToStorage([...tasks, newTask]);
    return newTask;
  } catch (error) {
    console.error('[API] Error creating task:', error);
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

export const updateTask = async (id: string, updates: UpdateTaskDTO): Promise<Task> => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        completed: updates.completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const updatedTask = parseDates(task);
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      saveTasksToStorage(tasks);
    }
    return updatedTask;
  } catch (error) {
    console.error('[API] Error updating task:', error);
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() };
      saveTasksToStorage(tasks);
      return tasks[index];
    }
    throw new Error('Task not found');
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const tasks = getTasksFromStorage();
    saveTasksToStorage(tasks.filter(t => t.id !== id));
  } catch (error) {
    console.error('[API] Error deleting task:', error);
    const tasks = getTasksFromStorage();
    saveTasksToStorage(tasks.filter(t => t.id !== id));
  }
};

export const toggleTaskCompletion = async (id: string): Promise<Task> => {
  const tasks = getTasksFromStorage();
  const task = tasks.find(t => t.id === id);
  if (!task) throw new Error('Task not found');

  return updateTask(id, { completed: !task.completed });
};

export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('tasks').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

export const login = async (email: string, password: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Invalid credentials');
  }

  if (user.password !== password) {
    throw new Error('Invalid credentials');
  }

  localStorage.setItem('userId', user.id);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
};

export const register = async (email: string, password: string, name?: string) => {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    throw new Error('Email already exists');
  }

  const { data: user, error } = await supabase
    .from('users')
    .insert({ email, password, name })
    .select()
    .single();

  if (error) throw error;

  localStorage.setItem('userId', user.id);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
};

export const logout = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
};