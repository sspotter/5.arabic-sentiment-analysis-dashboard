import React from 'react';
import { SavedProject } from '../types';
import { Folder, Trash2, Play, Calendar, FileText } from 'lucide-react';

interface SavedProjectsListProps {
  projects: SavedProject[];
  onLoad: (project: SavedProject) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function SavedProjectsList({ projects, onLoad, onDelete, onClose }: SavedProjectsListProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white dark:bg-slate-900/50">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center">
          <Folder className="w-6 h-6 mr-2 text-purple-400" />
          Saved Projects
        </h2>
        <button onClick={onClose} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 transition-colors">
          Close
        </button>
      </div>
      <div className="p-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No saved projects</h3>
            <p className="text-slate-500 mt-1">Projects you save will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:bg-white dark:bg-slate-800/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name}</h3>
                  <div className="flex items-center mt-1 text-sm text-slate-500 dark:text-slate-400 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(p.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {p.data.stats.total} comments
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
                      {(p.data.stats.total > 0 ? (p.data.stats.positive / p.data.stats.total) * 100 : 0).toFixed(1)}% Positive
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => onLoad(p)} 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#6a11cb] to-[#2575fc] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all shadow-md"
                    title="Load Project"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Load
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this project?')) {
                        onDelete(p.id);
                      }
                    }} 
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
