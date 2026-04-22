'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ExportButton() {
  const { token, user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const exportToCSV = async () => {
    if (!token || !user) return;
    setIsExporting(true);
    try {
      const url = token === 'authenticated' && user?.id
        ? `/api/export/csv?userId=${user.id}`
        : '/api/export/csv';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportSuccess('CSV');
      setTimeout(() => setExportSuccess(null), 2000);
    } catch (error) {
      console.error('[CSV Export] Error:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  const exportToPDF = async () => {
    if (!token || !user) return;
    setIsExporting(true);
    try {
      const url = token === 'authenticated' && user?.id
        ? `/api/export/pdf?userId=${user.id}`
        : '/api/export/pdf';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportSuccess('PDF');
      setTimeout(() => setExportSuccess(null), 2000);
    } catch (error) {
      console.error('[PDF Export] Error:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  if (!token || !user) {
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