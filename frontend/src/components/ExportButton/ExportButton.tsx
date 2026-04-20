'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const token = getAuthToken();
      
      console.log('[CSV Export] Token exists:', !!token);
      console.log('[CSV Export] API URL:', API_URL);
      
      if (!token) {
        alert('Please log in first');
        setIsExporting(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/export/csv`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[CSV Export] Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CSV Export] Error:', errorText);
        alert('Export failed. Check console for details.');
        setIsExporting(false);
        return;
      }

      const blob = await response.blob();
      console.log('[CSV Export] Blob size:', blob.size);
      saveAs(blob, 'tasks.csv');
    } catch (error) {
      console.error('[CSV Export] Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const token = getAuthToken();
      
      console.log('[PDF Export] Token exists:', !!token);
      console.log('[PDF Export] API URL:', API_URL);
      
      if (!token) {
        alert('Please log in first');
        setIsExporting(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[PDF Export] Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[PDF Export] Error:', errorText);
        alert('Export failed. Check console for details.');
        setIsExporting(false);
        return;
      }

      const blob = await response.blob();
      console.log('[PDF Export] Blob size:', blob.size);
      saveAs(blob, 'tasks.pdf');
    } catch (error) {
      console.error('[PDF Export] Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

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