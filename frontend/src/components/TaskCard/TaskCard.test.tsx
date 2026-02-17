import { render, screen } from '@testing-library/react';
import TaskCard from './TaskCard';
import type { Task } from '@/lib/types';

describe('TaskCard - Tests básicos', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'MEDIUM',  
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const defaultProps = {
    task: mockTask,
    onToggleComplete: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  it('renderiza correctamente', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument(); 
  });

  it('muestra tarea completada', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskCard {...defaultProps} task={completedTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('muestra prioridad', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();  
  });

  it('muestra descripción', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();  
  });

  it('muestra diferentes prioridades correctamente', () => {
    const highTask = { ...mockTask, priority: 'HIGH' as const };
    const lowTask = { ...mockTask, priority: 'LOW' as const };

    const { rerender } = render(<TaskCard {...defaultProps} task={highTask} />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();

    rerender(<TaskCard {...defaultProps} task={lowTask} />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });
});