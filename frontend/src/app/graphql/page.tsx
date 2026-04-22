'use client';

import { useState, useCallback } from 'react';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from '@graphiql/react';
import '@graphiql/react/dist/style.css';
import { useAuth } from '@/context/AuthContext';

const fetcher = createGraphiQLFetcher({
  url: '/api/graphql',
  fetchOptions: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    };
  },
});

export default function GraphiQLPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState(`# Query: Get all tasks
query GetTasks {
  tasks(userId: "${user?.id || 'user-id'}") {
    id
    title
    completed
    priority
    createdAt
  }
}

# Mutation: Create task
mutation CreateTask {
  createTask(userId: "${user?.id || 'user-id'}", input: {
    title: "New Task"
    description: "Task description"
    priority: MEDIUM
  }) {
    id
    title
    completed
  }
}
`);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-lg">API GraphQL</span>
        <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
          /api/graphql
        </span>
      </h1>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden h-[80vh]">
        <GraphiQL
          fetcher={fetcher}
          defaultQuery={query}
        />
      </div>
    </div>
  );
}