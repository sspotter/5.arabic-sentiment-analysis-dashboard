import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, Play } from 'lucide-react';
import { cn } from './FileUpload';

interface DataPreviewProps {
  data: any[];
  columns: string[];
  onStartAnalysis: (column: string, verifiedColumn: string, engagementColumn: string, dateColumn: string, batchSize: number, delayMs: number) => void;
}

const detectColumn = (cols: string[], keywords: string[]) => {
  const lowerCols = cols.map(c => c.toLowerCase());
  for (const keyword of keywords) {
    const idx = lowerCols.findIndex(c => c.includes(keyword));
    if (idx !== -1) return cols[idx];
  }
  return '';
};

export function DataPreview({ data, columns, onStartAnalysis }: DataPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const [selectedColumn, setSelectedColumn] = useState<string>(() => 
    detectColumn(columns, ['comment', 'text', 'review', 'content', 'body', 'message', 'tweet']) || (columns.length > 3 ? columns[3] : columns[0])
  );
  
  const [verifiedColumn, setVerifiedColumn] = useState<string>(() => 
    detectColumn(columns, ['verified', 'is_verified', 'isverified', 'blue_tick'])
  );
  
  const [engagementColumn, setEngagementColumn] = useState<string>(() => 
    detectColumn(columns, ['engagement', 'likes', 'retweets', 'shares', 'views', 'score'])
  );
  
  const [dateColumn, setDateColumn] = useState<string>(() => 
    detectColumn(columns, ['date', 'time', 'created', 'timestamp', 'published'])
  );
  
  const [batchSize, setBatchSize] = useState<number>(10);
  const [delayMs, setDelayMs] = useState<number>(1000);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:bg-white dark:bg-slate-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Preview Uploaded Data</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total rows: {data.length}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 max-h-96">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-50 dark:bg-white dark:bg-slate-800/50 sticky top-0 z-10">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-800">
                {data.slice(0, 100).map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50 dark:bg-white dark:bg-slate-800/50">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 truncate max-w-xs">
                        {String(row[col] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-right">Showing top 100 rows</p>
        </div>
      )}

      <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-white dark:bg-slate-900/50">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Analysis Settings</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label htmlFor="column-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select the column containing comments to analyze:
            </label>
            <div className="relative">
              <select
                id="column-select"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm appearance-none"
              >
                {columns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {idx}: {col}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="verified-column-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Verified status column (Optional):
            </label>
            <div className="relative">
              <select
                id="verified-column-select"
                value={verifiedColumn}
                onChange={(e) => setVerifiedColumn(e.target.value)}
                className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm appearance-none"
              >
                <option value="">-- None --</option>
                {columns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {idx}: {col}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="engagement-column-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Engagement column (Optional):
            </label>
            <div className="relative">
              <select
                id="engagement-column-select"
                value={engagementColumn}
                onChange={(e) => setEngagementColumn(e.target.value)}
                className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm appearance-none"
              >
                <option value="">-- None --</option>
                {columns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {idx}: {col}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="date-column-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Date column (Optional):
            </label>
            <div className="relative">
              <select
                id="date-column-select"
                value={dateColumn}
                onChange={(e) => setDateColumn(e.target.value)}
                className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm appearance-none"
              >
                <option value="">-- None --</option>
                {columns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {idx}: {col}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex-1">
            <label htmlFor="batch-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Batch Size (comments per request):
            </label>
            <input
              type="number"
              id="batch-size"
              min="1"
              max="100"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="block w-full px-3 py-2.5 text-base border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="delay-ms" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Delay between batches (ms):
            </label>
            <input
              type="number"
              id="delay-ms"
              min="0"
              step="100"
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
              className="block w-full px-3 py-2.5 text-base border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => onStartAnalysis(selectedColumn, verifiedColumn, engagementColumn, dateColumn, batchSize, delayMs)}
              className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-[#6a11cb] to-[#2575fc] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all w-full sm:w-auto"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
