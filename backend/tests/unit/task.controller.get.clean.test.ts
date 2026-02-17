jest.mock('../../src/database/prisma', () => {
  const mockPrisma = {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  };
  return { prisma: mockPrisma };
});

// Mock authentication middleware
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.userId = 'test-user-123'; // Simulate authenticated user
    next();
  }
}));

import { getTasks } from '../../src/controllers/task.controller';
import { prisma } from '../../src/database/prisma';

describe('Task Controller - getTasks (CLEAN)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return empty list when no tasks exist', async () => {
    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

    const req = { userId: 'test-user-123' }; // Added by mock middleware
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getTasks(req as any, res as any);

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: { userId: 'test-user-123' },
      orderBy: { createdAt: 'desc' }
    });
    
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: []
    });
  });

  test('should return tasks when they exist', async () => {
    const mockTasks = [{
      id: 'test-1',
      title: 'Test Task 1',
      description: 'Description 1',
      priority: 'HIGH',
      completed: false,
      dueDate: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      userId: 'test-user-123',
    }];

    (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

    const req = { userId: 'test-user-123' }; // Added by mock middleware
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getTasks(req as any, res as any);

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: { userId: 'test-user-123' },
      orderBy: { createdAt: 'desc' }
    });
    expect(res.json).toHaveBeenCalled();
    
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].title).toBe('Test Task 1');
  });

  test('should handle database error', async () => {
    (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    const req = { userId: 'test-user-123' }; // Added by mock middleware
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getTasks(req as any, res as any);

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: { userId: 'test-user-123' },
      orderBy: { createdAt: 'desc' }
    });
    expect(res.status).toHaveBeenCalledWith(500);
    
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.error).toBe('Error fetching tasks');
  });
});