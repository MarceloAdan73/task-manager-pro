// Mock de Prisma para tests con tipos
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Crear mock profundo de PrismaClient
const prismaMock = mockDeep<PrismaClient>();

// Resetear el mock antes de cada test
beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
