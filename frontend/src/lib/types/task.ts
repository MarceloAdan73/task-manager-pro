export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  user_id?: string;
}

export type TaskFormData = {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
};

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type CreateTaskDTO = Omit<TaskFormData, 'priority'> & {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
};

export type UpdateTaskDTO = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;