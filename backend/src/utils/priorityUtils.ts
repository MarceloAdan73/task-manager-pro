export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const normalizePriority = (priority: string): Priority => {
  const priorityMap: Record<string, Priority> = {
    'alta': 'HIGH',
    'media': 'MEDIUM', 
    'baja': 'LOW',
    'urgente': 'URGENT',
    'high': 'HIGH',
    'medium': 'MEDIUM',
    'low': 'LOW',
    'urgent': 'URGENT',
  };
  
  return priorityMap[priority.toLowerCase()] || 'MEDIUM';
};

export const formatTaskForFrontend = (task: any) => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  priority: task.priority.toLowerCase(),
  completed: task.completed,
  dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});
