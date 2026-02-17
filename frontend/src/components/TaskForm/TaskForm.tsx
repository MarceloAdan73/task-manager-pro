'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import type { TaskFormData } from '@/lib/types';
import { Loader2, Plus, AlertCircle, Type, AlignLeft, BarChart3, Sparkles } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (formData: TaskFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

const INITIAL_FORM_DATA: TaskFormData = {
  title: '',
  description: '',
  priority: 'MEDIUM', // ← ÚNICO CAMBIO: 'Media' → 'MEDIUM'
};

export default function TaskForm({ onSubmit, isSubmitting = false, error }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Maximum 100 characters';
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Maximum 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof TaskFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const getCharacterCountColor = () => {
    const length = formData.description?.length || 0;
    if (length > 450) return 'text-red-500';
    if (length > 400) return 'text-amber-500';
    return 'text-gray-500 dark:text-gray-400';
  };

  const inputClasses = (hasError: boolean) => `
    w-full px-4 py-3 bg-white dark:bg-gray-900 
    border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} 
    rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none 
    transition-all duration-200 disabled:opacity-50
  `;

  const labelClasses = `
    flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300
  `;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-5">
      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className={labelClasses}>
            <Type className="w-4 h-4 text-blue-500" />
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={inputClasses(!!errors.title)}
            placeholder="Enter task title..."
            disabled={isSubmitting}
            maxLength={100}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {formData.title.length}/100 characters
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className={labelClasses}>
            <AlignLeft className="w-4 h-4 text-blue-500" />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`${inputClasses(!!errors.description)} min-h-[120px] resize-none`}
            placeholder="Add task details, notes, or requirements..."
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs font-medium ${getCharacterCountColor()}`}>
              {formData.description?.length || 0}/500 characters
            </span>
            {(formData.description?.length || 0) > 0 && (  // ← CAMBIO 3
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {500 - (formData.description?.length || 0)} remaining  // ← CAMBIO 4
              </span>
            )}
          </div>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Priority Select */}
        <div>
          <label htmlFor="priority" className={labelClasses}>
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Priority Level
          </label>
          <div className="relative">
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`${inputClasses(false)} appearance-none cursor-pointer pr-10`}
              disabled={isSubmitting}
            >
              <option value="LOW">Low Priority 🌱</option>      {/* ← CAMBIADO: 'Baja' → 'LOW' */}
              <option value="MEDIUM">Medium Priority ⚡</option> {/* ← CAMBIADO: 'Media' → 'MEDIUM' */}
              <option value="HIGH">High Priority 🔥</option>    {/* ← CAMBIADO: 'Alta' → 'HIGH' */}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <div className="w-3 h-3 border-b-2 border-r-2 border-gray-400 dark:border-gray-500 rotate-45" />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Choose the urgency level for this task
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !formData.title.trim()}
          className={`
            group relative w-full py-3.5 px-4 rounded-xl font-semibold text-white
            transition-all duration-300 transform active:scale-[0.98]
            ${isSubmitting || !formData.title.trim()
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25'
            }
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Task...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Create New Task</span>
              <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </button>
        
        {/* Helper Text */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tasks appear instantly with optimistic updates
          </p>
        </div>
      </div>
    </form>
  );
}