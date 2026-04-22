import { NextRequest, NextResponse } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/server/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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
    user: User
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

function formatTask(task: any) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    userId: task.user_id
  };
}

function formatUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

const resolvers = {
  Query: {
    tasks: async (_: any, { userId }: { userId: string }) => {
      const { data: tasks } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return (tasks || []).map(formatTask);
    },
    task: async (_: any, { id, userId }: { id: string; userId: string }) => {
      const { data: task } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      return task ? formatTask(task) : null;
    },
    users: async () => {
      const { data: users } = await supabaseAdmin.from('users').select('*');
      return (users || []).map(formatUser);
    },
    user: async (_: any, { id }: { id: string }) => {
      const { data: user } = await supabaseAdmin.from('users').select('*').eq('id', id).single();
      return user ? formatUser(user) : null;
    },
  },
  Task: {
    user: async (parent: any) => {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', parent.userId)
        .single();
      return user ? formatUser(user) : null;
    },
  },
  User: {
    tasks: async (parent: any) => {
      const { data: tasks } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('user_id', parent.id);
      return (tasks || []).map(formatTask);
    },
  },
  Mutation: {
    createTask: async (_: any, { userId, input }: { userId: string; input: any }) => {
      const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description,
          priority: input.priority || 'MEDIUM',
          due_date: input.dueDate ? new Date(input.dueDate).toISOString() : null,
          user_id: userId
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return formatTask(task);
    },
    updateTask: async (_: any, { id, userId, input }: { id: string; userId: string; input: any }) => {
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.completed !== undefined) updateData.completed = input.completed;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.dueDate !== undefined) updateData.due_date = input.dueDate ? new Date(input.dueDate).toISOString() : null;

      const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return formatTask(task);
    },
    deleteTask: async (_: any, { id, userId }: { id: string; userId: string }) => {
      const { error } = await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      return !error;
    },
    toggleTaskComplete: async (_: any, { id, userId }: { id: string; userId: string }) => {
      const { data: task } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (!task) throw new Error('Task not found');

      const { data: updated, error } = await supabaseAdmin
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return formatTask(updated);
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

function getUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  
  if (token === 'authenticated') {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

const apolloServer = new ApolloServer({ schema });

const startServer = startServerAndCreateNextHandler(apolloServer, {
  context: async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');
    const userIdParam = req.nextUrl.searchParams.get('userId');
    
    if (userIdParam) {
      return { userId: userIdParam };
    }
    
    if (authHeader && authHeader.startsWith('Bearer authenticated')) {
      return { userId: 'authenticated' };
    }
    
    const userId = getUserIdFromToken(authHeader);
    return { userId };
  },
});

export async function POST(request: NextRequest) {
  return startServer(request);
}

export async function GET(request: NextRequest) {
  return startServer(request);
}