'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
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

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(18);
      doc.text('Task Manager Pro - Tasks Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });

      let y = 45;
      doc.setFontSize(12);
      doc.text('Tasks Summary', 14, y);
      y += 10;
      
      doc.setFontSize(10);
      const completed = tasks.filter(t => t.completed).length;
      const pending = tasks.filter(t => !t.completed).length;
      doc.text(`Total: ${tasks.length} | Completed: ${completed} | Pending: ${pending}`, 14, y);
      y += 15;

      const headers = ['Title', 'Priority', 'Status'];
      const colWidths = [100, 30, 30];
      let x = 14;
      
      doc.setFillColor(40, 40, 40);
      doc.rect(14, y - 5, pageWidth - 28, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      
      headers.forEach((header, i) => {
        doc.text(header, x, y);
        x += colWidths[i];
      });
      
      y += 8;
      doc.setTextColor(0, 0, 0);
      
      tasks.forEach((task, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        x = 14;
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
        }
        
        const title = task.title?.substring(0, 35) || '';
        doc.text(title, x, y);
        x += colWidths[0];
        
        const priority = task.priority || 'MEDIUM';
        doc.text(priority, x, y);
        x += colWidths[1];
        
        const status = task.completed ? 'Done' : 'Pending';
        doc.text(status, x, y);
        
        y += 8;
      });

      doc.save(`tasks_report_${new Date().toISOString().split('T')[0]}.pdf`);
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