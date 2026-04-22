'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { useTasks } from '@/hooks/useTasks';

export default function ExportButton() {
  const { tasks } = useTasks();
  const [isExporting, setIsExporting] = useState(false);

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

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const csv = convertToCSV(tasks);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `tasks-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('[CSV Export] Error:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tasks Export - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #333; color: white; }
            .completed { color: green; }
            .pending { color: orange; }
            .high { color: red; }
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
                  <td class="${(task.priority || '').toLowerCase()}">${task.priority || 'MEDIUM'}</td>
                  <td class="${task.completed ? 'completed' : 'pending'}">${task.completed ? 'Completed' : 'Pending'}</td>
                  <td>${task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    } catch (error) {
      console.error('[PDF Export] Error:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
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
        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition"
      >
        {isExporting ? 'Exporting...' : 'CSV'}
      </button>
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition"
      >
        {isExporting ? 'Exporting...' : 'PDF'}
      </button>
    </div>
  );
}