// General utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateId = (prefix = 'task'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const simulateDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isClient = (): boolean => {
  return typeof window !== 'undefined';
};

// Format priority - NO EMOJIS, only text
export const formatPriority = (priority: 'HIGH' | 'MEDIUM' | 'LOW'): string => {
  return priority;
};

// Utilities for lucide-react icons (icon names)
export const getPriorityIcon = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
  const iconMap = {
    'HIGH': 'AlertTriangle',
    'MEDIUM': 'Activity',  
    'LOW': 'CheckCircle'
  };
  return iconMap[priority];
};

export const getPriorityColor = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
  const colorMap = {
    'HIGH': 'text-red-500 bg-red-50 dark:bg-red-900/20',
    'MEDIUM': 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    'LOW': 'text-green-500 bg-green-50 dark:bg-green-900/20'
  };
  return colorMap[priority];
};

// Validations
export const validateTaskTitle = (title: string): { valid: boolean; message?: string } => {
  if (!title || title.trim() === '') {
    return { valid: false, message: 'Title is required' };
  }
  if (title.length > 100) {
    return { valid: false, message: 'Title cannot exceed 100 characters' };
  }
  return { valid: true };
};

export const validateTaskDescription = (description: string): { valid: boolean; message?: string } => {
  if (description.length > 500) {
    return { valid: false, message: 'Description cannot exceed 500 characters' };
  }
  return { valid: true };
};
