jest.mock('../../src/database/prisma', () => {
  const mockPrisma = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
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

import { createTask } from '../../src/controllers/task.controller';
import { prisma } from '../../src/database/prisma';

describe('Task Controller - createTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create task successfully', async () => {
    const mockTask = {
      id: 'new-task-123',
      title: 'New Task',
      description: 'Description',
      priority: 'MEDIUM',
      completed: false,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'test-user-123',
    };

    (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

    const req = {
      body: {
        title: 'New Task',
        description: 'Description',
        priority: 'MEDIUM',
      },
      userId: 'test-user-123', // Added by mock middleware
    };
    
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await createTask(req as any, res as any);

    expect(prisma.task.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.data.title).toBe('New Task');
  });

  test('should handle validation error (missing title)', async () => {
    const req = {
      body: {
        description: 'Description without title',
        priority: 'MEDIUM',
      },
      userId: 'test-user-123', // Added by mock middleware
    };
    
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await createTask(req as any, res as any);

    expect(prisma.task.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.error).toContain('Title');
  });

  test('should handle database error', async () => {
    (prisma.task.create as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    const req = {
      body: {
        title: 'New Task',
        description: 'Description',
        priority: 'MEDIUM',
      },
      userId: 'test-user-123', // Added by mock middleware
    };
    
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await createTask(req as any, res as any);

    expect(prisma.task.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.error).toBe('Error creating task');
  });
});