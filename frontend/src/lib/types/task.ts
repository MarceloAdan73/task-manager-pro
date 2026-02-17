export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskFormData = {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type CreateTaskDTO = Omit<TaskFormData, 'priority'> & {
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type UpdateTaskDTO = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;