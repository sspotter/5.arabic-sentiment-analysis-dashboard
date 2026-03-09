import React, { useState } from 'react';
import { X, Upload, Calendar } from 'lucide-react';
import Papa from 'papaparse';
import { ExportedAnalysis } from '../types';

interface UpdateDatesModalProps {
  brandData: ExportedAnalysis;
  brandName: string;
  onClose: () => void;
  onUpdate: (updatedData: ExportedAnalysis) => void;
}

export function UpdateDatesModal({ brandData, brandName, onClose, onUpdate }: UpdateDatesModalProps) {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [commentColumn, setCommentColumn] = useState<string>('');
  const [dateColumn, setDateColumn] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setCsvData(results.data);
          const cols = Object.keys(results.data[0] as object);
          setColumns(cols);
          
          // Try to auto-detect columns
          const commentCol = cols.find(c => c.toLowerCase().includes('comment') || c.toLowerCase().includes('text'));
          const dateCol = cols.find(c => c.toLowerCase().includes('date') || c.toLowerCase().includes('time') || c.toLowerCase().includes('created'));
          
          if (commentCol) setCommentColumn(commentCol);
          if (dateCol) setDateColumn(dateCol);
        } else {
          setError('The CSV file appears to be empty or invalid.');
        }
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
      }
    });
  };

  const handleUpdate = () => {
    if (!commentColumn || !dateColumn) {
      setError('Please select both a comment column and a date column.');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        const updatedComments = brandData.comments.map(comment => {
          // Find matching row in CSV
          // We use a simple includes or exact match. Exact match is safer but might fail on whitespace.
          const matchingRow = csvData.find(row => {
            const rowText = row[commentColumn];
            return rowText && (rowText.trim() === comment.text.trim() || rowText.includes(comment.text) || comment.text.includes(rowText));
          });

          if (matchingRow && matchingRow[dateColumn]) {
            return { ...comment, date: matchingRow[dateColumn] };
          }
          return comment;
        });

        const updatedData: ExportedAnalysis = {
          ...brandData,
          comments: updatedComments
        };

        onUpdate(updatedData);
      } catch (err: any) {
        setError(`Error updating dates: ${err.message}`);
        setIsProcessing(false);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            Add Dates to {brandName}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload the original CSV file to map dates to your analyzed comments. This allows you to view time-series charts without re-running the analysis.
          </p>

          {!csvData.length ? (
            <div className="flex justify-center">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">CSV files only</p>
                </div>
                <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-700 dark:text-emerald-400 flex justify-between items-center">
                <span>CSV loaded successfully ({csvData.length} rows)</span>
                <button onClick={() => setCsvData([])} className="text-emerald-700 dark:text-emerald-400 hover:underline text-xs">
                  Change File
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Comment Text Column (to match rows)
                </label>
                <select
                  value={commentColumn}
                  onChange={(e) => setCommentColumn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date/Time Column
                </label>
                <select
                  value={dateColumn}
                  onChange={(e) => setDateColumn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={!csvData.length || !commentColumn || !dateColumn || isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
          >
            {isProcessing ? 'Updating...' : 'Update Dates'}
          </button>
        </div>
      </div>
    </div>
  );
}
