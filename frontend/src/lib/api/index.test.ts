// Test for API connecting to real backend
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  toggleTaskCompletion,
  checkBackendConnection 
} from './index';
import type { TaskFormData } from '@/lib/types';

// Silencing console.error for these tests
jest.spyOn(console, 'error').mockImplementation(() => {});

// Global fetch mock
global.fetch = jest.fn() as jest.Mock;

// localStorage mock (for fallback)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {    
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Layer (Backend Connection)', () => {
  const STORAGE_KEY = 'task_manager_tasks_v1';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (fetch as jest.Mock).mockClear();
  });

  describe('checkBackendConnection', () => {
    it('returns true when backend responds OK', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      const result = await checkBackendConnection();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3005/api/health');
    });

    it('returns false when backend fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await checkBackendConnection();
      expect(result).toBe(false);
    });
  });

  describe('fetchTasks', () => {
    it('fetches tasks from backend successfully', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Backend Task',
          description: 'Description',
          priority: 'HIGH',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      });

      const tasks = await fetchTasks();

      expect(fetch).toHaveBeenCalledWith("http://localhost:3005/api/tasks", expect.objectContaining({ headers: { "Content-Type": "application/json" } }));
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Backend Task');
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
    });

    it('uses localStorage as fallback when backend fails', async () => {
      // Mock fetch to fail
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Setup localStorage fallback data
      const fallbackTasks = [
        {
          id: 'fallback-1',
          title: 'Local Task',
          description: 'Local Description',
          priority: 'MEDIUM',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackTasks));

      // Mock localStorage.getItem to return data
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify(fallbackTasks));

      const tasks = await fetchTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Local Task');
    });

    it('uses default tasks when both backend and localStorage are empty', async () => {
      // Mock fetch to fail
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // localStorage.getItem returns null (empty)
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

      const tasks = await fetchTasks();

      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].title).toContain('Backend unavailable');
    });
  });

  describe('createTask', () => {
    it('creates task in backend successfully', async () => {
      const taskData: TaskFormData = {
        title: 'New Task',
        description: 'Description',
        priority: 'MEDIUM'
      };

      const mockResponse = {
        id: '123',
        title: 'New Task',
        description: 'Description',
        priority: 'MEDIUM',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const task = await createTask(taskData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3005/api/tasks',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Task',
            description: 'Description',
            priority: 'MEDIUM'
          })
        })
      );
      expect(task.title).toBe('New Task');
      expect(task.completed).toBe(false);
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('uses localStorage when backend fails', async () => {
      const taskData: TaskFormData = {
        title: 'Local Task',
        description: 'Desc',
        priority: 'HIGH'
      };

      // Mock fetch to fail
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Mock localStorage.getItem (empty initially)
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

      const task = await createTask(taskData);

      expect(task.title).toBe('Local Task');
      expect(task.id).toBeDefined();
      expect(task.id).toContain('local-');
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('updates task in backend successfully', async () => {
      const taskId = '123';
      const updates = {
        title: 'Updated Title',
        completed: true
      };

      const mockResponse = {
        id: taskId,
        title: 'Updated Title',
        description: 'Original Description',
        priority: 'MEDIUM',
        completed: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const task = await updateTask(taskId, updates);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:3005/api/tasks/${taskId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
      );
      expect(task.title).toBe('Updated Title');
      expect(task.completed).toBe(true);
    });

    it('uses localStorage when backend fails', async () => {
      const taskData: TaskFormData = {
        title: 'Original Task',
        description: 'Desc',
        priority: 'MEDIUM'
      };

      // Mock fetch to fail in createTask
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Mock localStorage.getItem (empty initially)
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

      const createdTask = await createTask(taskData);

      // Mock fetch to fail in updateTask
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Mock localStorage.getItem when updateTask reads localStorage
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify([createdTask]));

      const updates = { title: 'Updated' };
      const updatedTask = await updateTask(createdTask.id, updates);

      expect(updatedTask.title).toBe('Updated');
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('deletes task from backend successfully', async () => {
      const taskId = '123';

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({})
      });

      await deleteTask(taskId);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:3005/api/tasks/${taskId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('deletes from localStorage when backend fails', async () => {
      const taskData: TaskFormData = {
        title: 'Task to delete',
        description: 'Desc',
        priority: 'MEDIUM'
      };

      // Create task in localStorage (fetch fails)
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Mock localStorage.getItem (empty initially)
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

      const createdTask = await createTask(taskData);

      // Mock localStorage.getItem when reading task before deletion
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify([createdTask]));

      // Now delete (will also fail)
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await deleteTask(createdTask.id);

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('toggleTaskCompletion', () => {
    it('toggles task status using backend', async () => {
      const taskId = '123';

      const mockTask = {
        id: taskId,
        title: 'Test Task',
        description: 'Desc',
        priority: 'MEDIUM',
        completed: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask
      });

      const result = await toggleTaskCompletion(taskId);

      expect(result.completed).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3005/api/tasks/123/toggle',
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });
  });
});
