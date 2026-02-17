import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks } from './useTasks';
import type { CreateTaskDTO } from '@/lib/types';

// Complete API module mock
jest.mock('@/lib/api', () => ({
  fetchTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  toggleTaskCompletion: jest.fn(),
}));

import * as api from '@/lib/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  priority: 'MEDIUM' as const,
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('useTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.fetchTasks as jest.Mock).mockResolvedValue([mockTask]);
  });

  it('should load tasks correctly', async () => {
    const { result } = renderHook(() => useTasks(), { 
      wrapper: createWrapper() 
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Test Task');
  });

  it('should create a task', async () => {
    const newTask: CreateTaskDTO = {
      title: 'New Task',
      description: 'Description',
      priority: 'HIGH' as const
    };
    
    (api.createTask as jest.Mock).mockResolvedValue({
      id: 'new-1',
      ...newTask,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const { result } = renderHook(() => useTasks(), { 
      wrapper: createWrapper() 
    });
    
    await waitFor(() => {
      expect(result.current.tasks).toBeDefined();
    });
    
    await act(async () => {
      await result.current.createTask(newTask);
    });
    
    expect((api.createTask as jest.Mock).mock.calls[0][0]).toEqual(newTask);
  });

  it('should handle task creation error', async () => {
    (api.createTask as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useTasks(), { 
      wrapper: createWrapper() 
    });
    
    await waitFor(() => {
      expect(result.current.tasks).toBeDefined();
    });
    
    // Silence console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    await act(async () => {
      try {
        await result.current.createTask({
          title: 'Test',
          description: 'Test',
          priority: 'MEDIUM' as const
        });
      } catch {
        // Expected error, do nothing
      }
    });
    
    console.error = originalError;
    
    expect(api.createTask as jest.Mock).toHaveBeenCalled();
  });

  it('should delete a task', async () => {
    (api.deleteTask as jest.Mock).mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useTasks(), { 
      wrapper: createWrapper() 
    });
    
    await waitFor(() => {
      expect(result.current.tasks.length).toBeGreaterThan(0);
    });
    
    await act(async () => {
      await result.current.deleteTask('1');
    });
    
    expect((api.deleteTask as jest.Mock).mock.calls[0][0]).toBe('1');
  });

  it('should update a task', async () => {
    const updates = { title: 'Updated Title' };
    (api.updateTask as jest.Mock).mockResolvedValue({
      ...mockTask,
      ...updates
    });
    
    const { result } = renderHook(() => useTasks(), { 
      wrapper: createWrapper() 
    });
    
    await waitFor(() => {
      expect(result.current.tasks.length).toBeGreaterThan(0);
    });
    
    await act(async () => {
      await result.current.updateTask({ 
        id: '1', 
        updates 
      });
    });
    
    expect((api.updateTask as jest.Mock)).toHaveBeenCalledWith('1', updates);
  });

  it('should toggle task completion', async () => {
    (api.toggleTaskCompletion as jest.Mock).mockResolvedValue({
      ...mockTask,
      completed: true,
    });
    
    const { result } = renderHook(() => useTasks(), { 
      wrapper: createWrapper() 
    });
    
    await waitFor(() => {
      expect(result.current.tasks.length).toBeGreaterThan(0);
    });
    
    await act(async () => {
      if (result.current.toggleTask) {
        await result.current.toggleTask('1');
      }
    });
    
    expect((api.toggleTaskCompletion as jest.Mock).mock.calls[0][0]).toBe('1');
  });
});
