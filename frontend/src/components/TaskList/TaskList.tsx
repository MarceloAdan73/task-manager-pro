'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertCircle, 
  Inbox, 
  Target, 
  CheckCircle2, 
  Clock, 
  Zap,
  Layout,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import TaskCard from '../TaskCard/TaskCard';
import { Task } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onToggleExpand?: (id: string) => void;
  expandedTaskId?: string | null;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  isError,
  error,
  onToggleComplete,
  onDelete,
  onEdit,
  onToggleExpand,
  expandedTaskId = null,
}) => {
  const [displayedTasks, setDisplayedTasks] = useState<Task[]>(tasks);
  
  // Sync displayed tasks with actual data
  useEffect(() => {
    setDisplayedTasks(tasks);
  }, [tasks]);

  const totalTasks = displayedTasks.length;
  const completedTasks = displayedTasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Get progress bar width class based on completion percentage
  const getProgressWidthClass = () => {
    if (completionPercentage >= 100) return 'w-full';
    if (completionPercentage >= 75) return 'w-3/4';
    if (completionPercentage >= 50) return 'w-1/2';
    if (completionPercentage >= 25) return 'w-1/4';
    if (completionPercentage >= 10) return 'w-[10%]';
    return 'w-0';
  };

  const progressWidthClass = getProgressWidthClass();

  // Handle delete with exit animation
  const handleDeleteWithAnimation = (id: string) => {
    // First animate removal from UI
    setDisplayedTasks(prev => prev.filter(task => task.id !== id));
    
    // Then actually delete after animation completes
    setTimeout(() => {
      if (onDelete) {
        onDelete(id);
      }
    }, 300);
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading tasks</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fetching your workflow data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Unable to load tasks</p>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
              {error?.message || 'An unexpected error occurred'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (displayedTasks.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50/50 to-gray-100/30 dark:from-gray-900/30 dark:to-gray-800/20 p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 mb-4">
          <Inbox className="h-8 w-8 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No tasks yet</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
          Start by creating your first task using the form on the left. 
          Your tasks will appear here once added.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Target className="h-4 w-4" />
          <span>Click "Create New Task" to begin</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Progress Overview</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{completionPercentage}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
          <div className={`bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700 ${progressWidthClass}`} />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Task List Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Layout className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Tasks</h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} total • {pendingTasks} pending
        </div>
      </div>

      {/* Task Cards Container */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayedTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                x: -100,
                transition: { duration: 0.2 }
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                opacity: { duration: 0.2 }
              }}
            >
              <TaskCard
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={handleDeleteWithAnimation}
                onEdit={onEdit}
                onToggleExpand={onToggleExpand}
                isExpanded={expandedTaskId === task.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty space for scroll */}
      <div className="h-4" />
    </div>
  );
};

export default TaskList;
