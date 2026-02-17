import { formatTaskForFrontend } from '../../src/utils/priorityUtils';

describe('formatTaskForFrontend', () => {
  test('formats task correctly with all fields', () => {
    const mockTask = {
      id: 'test-123',
      title: 'Test Task',
      description: 'Test Description',
      priority: 'HIGH',
      completed: false,
      dueDate: new Date('2024-12-31T00:00:00.000Z'),
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    };

    const formatted = formatTaskForFrontend(mockTask);

    expect(formatted.id).toBe('test-123');
    expect(formatted.title).toBe('Test Task');
    expect(formatted.description).toBe('Test Description');
    expect(formatted.priority).toBe('high'); // Converts to lowercase
    expect(formatted.completed).toBe(false);
    expect(formatted.dueDate).toBe('2024-12-31T00:00:00.000Z');
    expect(formatted.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(formatted.updatedAt).toBe('2024-01-02T00:00:00.000Z');
  });

  test('handles null/undefined values correctly', () => {
    const mockTask = {
      id: 'test-456',
      title: 'Task without description',
      description: null,
      priority: 'MEDIUM',
      completed: true,
      dueDate: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    const formatted = formatTaskForFrontend(mockTask);

    expect(formatted.id).toBe('test-456');
    expect(formatted.title).toBe('Task without description');
    expect(formatted.description).toBe(''); // null → empty string
    expect(formatted.priority).toBe('medium');
    expect(formatted.completed).toBe(true);
    expect(formatted.dueDate).toBeNull(); // null remains null
    expect(formatted.createdAt).toBe('2024-01-01T00:00:00.000Z');
  });

  test('always converts priority to lowercase', () => {
    const mockTask = {
      id: 'test-789',
      title: 'Mixed case priority task',
      description: 'Test',
      priority: 'UrGeNt', // Mixed case
      completed: false,
      dueDate: new Date('2024-12-31T00:00:00.000Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const formatted = formatTaskForFrontend(mockTask);
    expect(formatted.priority).toBe('urgent');
  });

  test('handles task without description property', () => {
    const mockTask = {
      id: 'test-999',
      title: 'No description property',
      priority: 'LOW',
      completed: false,
      dueDate: new Date('2024-12-31T00:00:00.000Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any; // Type cast for test

    const formatted = formatTaskForFrontend(mockTask);
    expect(formatted.description).toBe(''); // Undefined → empty string
  });
});
