import { makeExecutableSchema } from '@graphql-tools/schema';
import { prisma } from '../database/prisma';

const typeDefs = `
  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  type User {
    id: ID!
    email: String!
    name: String
    createdAt: String!
    updatedAt: String!
    tasks: [Task!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    priority: Priority!
    dueDate: String
    createdAt: String!
    updatedAt: String!
    userId: String!
    user: User!
  }

  type Query {
    tasks(userId: String!): [Task!]!
    task(id: ID!, userId: String!): Task
    users: [User!]!
    user(id: ID!): User
  }

  input CreateTaskInput {
    title: String!
    description: String
    priority: Priority
    dueDate: String
  }

  input UpdateTaskInput {
    title: String
    description: String
    completed: Boolean
    priority: Priority
    dueDate: String
  }

  type Mutation {
    createTask(userId: String!, input: CreateTaskInput!): Task!
    updateTask(id: ID!, userId: String!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!, userId: String!): Boolean!
    toggleTaskComplete(id: ID!, userId: String!): Task!
  }
`;

const resolvers = {
  Query: {
    tasks: async (_: any, { userId }: { userId: string }) => {
      return await prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    },
    task: async (_: any, { id, userId }: { id: string; userId: string }) => {
      return await prisma.task.findFirst({
        where: { id, userId },
      });
    },
    users: async () => {
      return await prisma.user.findMany();
    },
    user: async (_: any, { id }: { id: string }) => {
      return await prisma.user.findUnique({ where: { id } });
    },
  },
  Task: {
    user: async (parent: any) => {
      return await prisma.user.findUnique({ where: { id: parent.userId } });
    },
  },
  User: {
    tasks: async (parent: any) => {
      return await prisma.task.findMany({
        where: { userId: parent.id },
      });
    },
  },
  Mutation: {
    createTask: async (_: any, { userId, input }: { userId: string; input: any }) => {
      return await prisma.task.create({
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority || 'MEDIUM',
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          userId,
        },
      });
    },
    updateTask: async (_: any, { id, userId, input }: { id: string; userId: string; input: any }) => {
      return await prisma.task.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description,
          completed: input.completed,
          priority: input.priority,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        },
      });
    },
    deleteTask: async (_: any, { id, userId }: { id: string; userId: string }) => {
      const task = await prisma.task.findFirst({ where: { id, userId } });
      if (!task) return false;
      await prisma.task.delete({ where: { id } });
      return true;
    },
    toggleTaskComplete: async (_: any, { id, userId }: { id: string; userId: string }) => {
      const task = await prisma.task.findFirst({ where: { id, userId } });
      if (!task) throw new Error('Task not found');
      return await prisma.task.update({
        where: { id },
        data: { completed: !task.completed },
      });
    },
  },
};

export const graphqlSchema = makeExecutableSchema({ typeDefs, resolvers });