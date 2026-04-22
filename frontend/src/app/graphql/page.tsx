'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Play, Copy, Check, Loader2 } from 'lucide-react';

const defaultQuery = `query GetTasks {
  tasks(userId: "user-id") {
    id
    title
    completed
    priority
    createdAt
  }
}`;

export default function GraphiQLPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState(defaultQuery);
  const [variables, setVariables] = useState('{\n  "userId": "user-id"\n}');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId') || user?.id;
      
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          query,
          variables: JSON.parse(variables),
        }),
      });
      
      const data = await res.json();
      
      if (data.errors) {
        setError(JSON.stringify(data.errors, null, 2));
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
          <span>GraphQL API</span>
          <code className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-zinc-600 dark:text-zinc-400">
            POST /api/graphql
          </code>
        </h1>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Query Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Query</label>
              <button
                onClick={executeQuery}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Run
              </button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm bg-zinc-900 text-zinc-100 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
              spellCheck={false}
            />
          </div>

          {/* Variables Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Variables</label>
            <textarea
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              className="w-full h-32 p-4 font-mono text-sm bg-zinc-900 text-zinc-100 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
              spellCheck={false}
            />
            
            {/* Response */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Response</label>
                {response && (
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <pre className={`w-full h-48 p-4 font-mono text-xs rounded-lg border overflow-auto ${
                error 
                  ? 'bg-red-950 text-red-400 border-red-900' 
                  : response 
                    ? 'bg-zinc-900 text-emerald-400 border-zinc-700' 
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700'
              }`}>
                {error || response || 'Run a query to see the response...'}
              </pre>
            </div>
          </div>
        </div>

        {/* Schema Reference */}
        <div className="mt-8 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Schema Reference</h2>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Queries</p>
              <ul className="space-y-1 font-mono text-zinc-600 dark:text-zinc-400">
                <li>tasks(userId: String!)</li>
                <li>task(id: ID!, userId: String!)</li>
                <li>users</li>
                <li>user(id: ID!)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Mutations</p>
              <ul className="space-y-1 font-mono text-zinc-600 dark:text-zinc-400">
                <li>createTask(userId, input)</li>
                <li>updateTask(id, userId, input)</li>
                <li>deleteTask(id, userId)</li>
                <li>toggleTaskComplete(id, userId)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}