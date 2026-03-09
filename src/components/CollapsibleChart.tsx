import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

interface CollapsibleChartProps {
  title: string;
  description: string;
  children: React.ReactNode;
  data: any[];
  dataKeys: string[];
}

export function CollapsibleChart({ title, description, children, data, dataKeys }: CollapsibleChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async (format: 'png' | 'jpeg') => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      });
      const dataUrl = canvas.toDataURL(`image/${format}`);
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image.');
    }
    setShowExportMenu(false);
  };

  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF.');
    }
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    try {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV.');
    }
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mt-6">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
        <div className="flex items-center space-x-4">
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-6">
          <div className="flex justify-between items-start mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl whitespace-pre-wrap">
              {description}
            </p>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-10 border border-slate-200 dark:border-slate-700">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button onClick={() => handleExportImage('png')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700" role="menuitem">Save as PNG</button>
                    <button onClick={() => handleExportImage('jpeg')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700" role="menuitem">Save as JPEG</button>
                    <button onClick={handleExportPDF} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700" role="menuitem">Save as PDF</button>
                    <button onClick={handleExportCSV} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700" role="menuitem">Export Data (CSV)</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div ref={chartRef} className="h-80 w-full p-4 bg-white dark:bg-slate-900 rounded-xl">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
