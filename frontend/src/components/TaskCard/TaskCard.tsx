'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Calendar,
  AlertCircle,
  Loader2,
  Copy,
  CheckCircle,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onToggleExpand?: (id: string) => void;
  isExpanded?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onToggleExpand,
  isExpanded = false,
}) => {
  const { id, title, description, priority, completed, createdAt } = task;
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const priorityConfig = {
    HIGH: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800/50',
      accent: 'from-red-500 to-red-600',
      badgeBg: 'bg-red-500/10',
      badgeText: 'text-red-600 dark:text-red-400'
    },
    MEDIUM: {
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800/50',
      accent: 'from-amber-500 to-amber-600',
      badgeBg: 'bg-amber-500/10',
      badgeText: 'text-amber-600 dark:text-amber-400'
    },
    LOW: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      accent: 'from-emerald-500 to-emerald-600',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-600 dark:text-emerald-400'
    }
  };

  const style = priorityConfig[priority] || priorityConfig.MEDIUM;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (description) {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Eliminado: window.confirm
    // Ahora se borra directamente
    
    setIsDeleting(true);
    setTimeout(() => onDelete(id), 300);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(id);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) onToggleExpand(id);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDescriptionHeightClass = () => {
    return isExpanded ? 'max-h-48' : 'max-h-20';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`group relative rounded-2xl border transition-all duration-300 ${
        completed 
          ? 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 opacity-80' 
          : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg'
      }`}
      data-testid={`task-card-${id}`}
    >
      {/* Priority Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${style.accent} rounded-l-2xl`} />
      
      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          
          {/* Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleComplete(id); }}
            className={`mt-1 flex-shrink-0 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 active:scale-95 ${
              completed 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }`}
            aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
            data-testid="task-toggle-button"
          >
            {completed ? <Check className="h-3.5 w-3.5" /> : null}
          </button>

          <div className="flex-1 min-w-0">
            {/* Header with Title and Priority */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className={`text-base font-semibold leading-snug ${
                completed 
                  ? 'line-through text-gray-400 dark:text-gray-500' 
                  : 'text-gray-800 dark:text-gray-100'
              }`}>
                {title}
              </h3>
              
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${style.border} ${style.badgeBg} ${style.badgeText}`}>
                <AlertCircle className="h-3 w-3" />
                {priority}
              </div>
            </div>

            {/* Description Container */}
            {description && (
              <div className={`relative rounded-xl border ${style.border} ${style.bg} p-3 mb-3 transition-all`}>
                <div 
                  className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed overflow-y-auto pr-2 custom-scrollbar transition-all ${getDescriptionHeightClass()} ${
                    !isExpanded ? 'overflow-hidden' : ''
                  }`}
                >
                  <p className={isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}>
                    {description}
                  </p>
                  
                  {!isExpanded && description.length > 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
                  )}
                </div>

                {/* Description Controls */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {onToggleExpand && (
                    <button 
                      onClick={handleExpand}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      data-testid="expand-button"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          Read More
                        </>
                      )}
                    </button>
                  )}
                  
                  {isExpanded && (
                    <button 
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Text
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Footer with Date and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${completed ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                  {completed ? 'Completed' : 'In Progress'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {onEdit && (
                  <button 
                    onClick={handleEdit}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Edit task"
                    data-testid="edit-button"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  title="Delete task"
                  data-testid="delete-button"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;