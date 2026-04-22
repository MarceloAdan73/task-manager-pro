'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { useTasks } from '@/hooks/useTasks';

export default function ExportButton() {
  const { tasks } = useTasks();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const convertToCSV = (data: typeof tasks): string => {
    if (!data.length) return '';

    const headers = ['ID', 'Title', 'Description', 'Priority', 'Completed', 'Created At', 'Updated At'];
    const rows = data.map(task => [
      task.id,
      `"${(task.title || '').replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      task.priority || 'MEDIUM',
      task.completed ? 'Yes' : 'No',
      task.createdAt ? new Date(task.createdAt).toISOString() : '',
      task.updatedAt ? new Date(task.updatedAt).toISOString() : '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      const csv = convertToCSV(tasks);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `tasks-${new Date().toISOString().split('T')[0]}.csv`);
      setExportSuccess('CSV');
      setTimeout(() => setExportSuccess(null), 2000);
    } catch (error) {
      console.error('[CSV Export] Error:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tasks - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #333; color: white; }
            .completed { color: green; }
            .pending { color: orange; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>Tasks - ${new Date().toLocaleDateString()}</h1>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map(task => `
                <tr>
                  <td>${task.title || ''}</td>
                  <td>${task.description || ''}</td>
                  <td>${task.priority || 'MEDIUM'}</td>
                  <td class="${task.completed ? 'completed' : 'pending'}">${task.completed ? 'Completed' : 'Pending'}</td>
                  <td>${task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([printContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      
      if (win) {
        win.onload = () => {
          win.print();
        };
      }
      setExportSuccess('PDF');
      setTimeout(() => setExportSuccess(null), 2000);
    } catch (error) {
      console.error('[PDF Export] Error:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  if (!tasks.length) {
    return (
      <div className="flex gap-2">
        <button
          disabled
          className="px-3 py-1.5 bg-gray-400 text-white text-sm rounded cursor-not-allowed"
        >
          CSV
        </button>
        <button
          disabled
          className="px-3 py-1.5 bg-gray-400 text-white text-sm rounded cursor-not-allowed"
        >
          PDF
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        disabled={isExporting}
        className={`px-3 py-1.5 text-white text-sm rounded transition-all ${
          exportSuccess === 'CSV' 
            ? 'bg-green-500 scale-105' 
            : 'bg-green-600 hover:bg-green-700'
        } disabled:opacity-50`}
      >
        {isExporting ? '...' : exportSuccess === 'CSV' ? '✓' : 'CSV'}
      </button>
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className={`px-3 py-1.5 text-white text-sm rounded transition-all ${
          exportSuccess === 'PDF' 
            ? 'bg-green-500 scale-105' 
            : 'bg-red-600 hover:bg-red-700'
        } disabled:opacity-50`}
      >
        {isExporting ? '...' : exportSuccess === 'PDF' ? '✓' : 'PDF'}
      </button>
    </div>
  );
}