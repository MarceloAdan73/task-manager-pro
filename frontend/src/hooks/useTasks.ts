import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion
} from '@/lib/api';
import type { Task, TaskFormData } from '@/lib/types';

export function useTasks() {
  const queryClient = useQueryClient();

  // Query for fetching all tasks
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create task mutation with optimistic update
  const { mutateAsync: createTaskMutation, isPending: isCreating } = useMutation({
    mutationFn: createTask,
    onMutate: async (newTask: TaskFormData) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) || [];

      // Optimistic task with temporary ID
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority || 'MEDIUM',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<Task[]>(['tasks'], [...previousTasks, optimisticTask]);
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency with backend
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Toggle task completion mutation
  const { mutateAsync: toggleTaskMutation, isPending: isToggling } = useMutation({
    mutationFn: toggleTaskCompletion,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) || [];

      // Optimistically toggle completed status
      const updatedTasks = previousTasks.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      );

      queryClient.setQueryData(['tasks'], updatedTasks);
      return { previousTasks };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update task mutation
  const { mutateAsync: updateTaskMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) || [];

      // Optimistically update task
      const updatedTasks = previousTasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      );

      queryClient.setQueryData(['tasks'], updatedTasks);
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete task mutation
  const { mutateAsync: deleteTaskMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) || [];

      // Optimistically remove task
      const updatedTasks = previousTasks.filter(task => task.id !== id);
      queryClient.setQueryData(['tasks'], updatedTasks);

      return { previousTasks };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    // Data
    tasks,
    isLoading,
    isError,
    error,
    refetch,

    // Create operations
    createTask: createTaskMutation,
    isCreating,

    // Update operations
    updateTask: updateTaskMutation,
    isUpdating,

    // Toggle operations
    toggleTask: toggleTaskMutation,
    isToggling,

    // Delete operations
    deleteTask: deleteTaskMutation,
    isDeleting,

    // Combined mutation state
    isMutating: isCreating || isUpdating || isToggling || isDeleting,

    // Helper: get task by ID
    getTaskById: (id: string) => tasks.find(t => t.id === id),
  };
}
