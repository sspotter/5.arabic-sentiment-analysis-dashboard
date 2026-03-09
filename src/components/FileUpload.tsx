import React, { useCallback } from 'react';
import { UploadCloud, FileType, FileSpreadsheet, FileJson } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv', // csv
      'application/json' // json
    ];
    
    // Also check extension as fallback
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['xlsx', 'xls', 'csv', 'json'];

    if (validTypes.includes(file.type) || (ext && validExts.includes(ext))) {
      onFileUpload(file);
    } else {
      alert('Please upload a valid Excel, CSV, or JSON file.');
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out bg-white dark:bg-slate-900",
        isDragging 
          ? "border-purple-500 bg-purple-500/10 scale-[1.02]" 
          : "border-slate-300 dark:border-slate-700 hover:border-purple-400 hover:bg-white dark:bg-slate-800/80"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept=".xlsx,.xls,.csv,.json"
      />
      
      <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
        <div className="p-4 bg-purple-500/20 rounded-full">
          <UploadCloud className="w-10 h-10 text-purple-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6a11cb] to-[#2575fc]">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Excel, CSV, or JSON files supported
          </p>
        </div>
        <div className="flex items-center space-x-4 text-slate-500 mt-4">
          <div className="flex items-center space-x-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="text-xs">Excel</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileType className="w-4 h-4" />
            <span className="text-xs">CSV</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileJson className="w-4 h-4" />
            <span className="text-xs">JSON</span>
          </div>
        </div>
      </div>
    </div>
  );
}
