// CORRECT PATTERN: Define mock INSIDE jest.mock
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

describe('Task Controller - getTasks', () => {
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
});