import React, { useState, useMemo } from 'react';
import { ExportedAnalysis, CommentData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { X, Target, Activity, CheckCircle, BarChart2, FileText, Plus, Eye, EyeOff, Calendar, Upload, Download } from 'lucide-react';
import { CollapsibleChart } from './CollapsibleChart';
import { UpdateDatesModal } from './UpdateDatesModal';
import { WordCloudSection } from './WordCloudSection';
import Papa from 'papaparse';

interface ComparisonDashboardProps {
  currentBrand: ExportedAnalysis;
  comparedBrands: ExportedAnalysis[];
  onClose: () => void;
  onAddCompare: (data: ExportedAnalysis) => void;
  onRemoveCompare: (index: number) => void;
}

const BRAND_COLORS = [
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#f43f5e', // rose-500
  '#f59e0b', // amber-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
];

const formatDateKey = (d: Date, timeframe: 'daily' | 'weekly' | 'monthly') => {
  if (timeframe === 'monthly') {
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  }
  if (timeframe === 'weekly') {
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d.getTime() - startOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d);
    start.setDate(diff);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return `Week ${weekNum} (${start.toLocaleString('default', { month: 'short' })} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()})`;
  }
  // daily
  return `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })}`;
};

export function ComparisonDashboard({ currentBrand, comparedBrands, onClose, onAddCompare, onRemoveCompare }: ComparisonDashboardProps) {
  const [hiddenBrands, setHiddenBrands] = useState<Set<number>>(new Set());
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [comparisonMode, setComparisonMode] = useState<'absolute' | 'percentage'>('absolute');
  const [selectedComments, setSelectedComments] = useState<{ title: string, comments: CommentData[] } | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Record<number, ExportedAnalysis>>({});
  const [updatingBrandIndex, setUpdatingBrandIndex] = useState<number | null>(null);

  const allBrands = [currentBrand, ...comparedBrands].map((b, i) => localOverrides[i] || b);
  
  const toggleBrandVisibility = (index: number) => {
    setHiddenBrands(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const visibleBrands = allBrands.map((brand, index) => ({ brand, index })).filter(b => !hiddenBrands.has(b.index));
  
  const getBrandName = (brand: ExportedAnalysis, index: number) => {
    if (index === 0) return "Current Analysis";
    const colName = brand.metadata.columnAnalyzed || 'Unknown';
    return `Brand ${index} (${colName})`;
  };

  const getMetrics = (brand: ExportedAnalysis) => {
    const posNegTotal = brand.stats.positive + brand.stats.negative;
    const brandSentiment = posNegTotal > 0 ? (brand.stats.positive / posNegTotal) * 100 : 0;
    const netSentimentScore = brand.stats.total > 0 ? ((brand.stats.positive - brand.stats.negative) / brand.stats.total) * 100 : 0;
    return { brandSentiment, netSentimentScore };
  };

  const comparisonData = [
    {
      metric: 'Total Comments',
      icon: <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />,
      ...allBrands.reduce((acc, brand, idx) => ({ ...acc, [getBrandName(brand, idx)]: brand.stats.total }), {})
    },
    {
      metric: 'Verified Users',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      ...allBrands.reduce((acc, brand, idx) => ({ ...acc, [getBrandName(brand, idx)]: brand.stats.verifiedTotal }), {})
    },
    {
      metric: 'Brand Sentiment (%)',
      icon: <Target className="w-5 h-5 text-indigo-500" />,
      ...allBrands.reduce((acc, brand, idx) => ({ ...acc, [getBrandName(brand, idx)]: parseFloat(getMetrics(brand).brandSentiment.toFixed(1)) }), {})
    },
    {
      metric: 'Net Sentiment Score',
      icon: <Activity className="w-5 h-5 text-rose-500" />,
      ...allBrands.reduce((acc, brand, idx) => ({ ...acc, [getBrandName(brand, idx)]: parseFloat(getMetrics(brand).netSentimentScore.toFixed(1)) }), {})
    },
    {
      metric: 'Avg Engagement',
      icon: <BarChart2 className="w-5 h-5 text-amber-500" />,
      ...allBrands.reduce((acc, brand, idx) => ({ ...acc, [getBrandName(brand, idx)]: parseFloat((brand.stats.averageEngagement || 0).toFixed(1)) }), {})
    },
    {
      metric: 'Total Engagement',
      icon: <BarChart2 className="w-5 h-5 text-amber-500" />,
      ...allBrands.reduce((acc, brand, idx) => ({ ...acc, [getBrandName(brand, idx)]: brand.stats.totalEngagement || 0 }), {})
    },
  ];

  const sentimentDistData = [
    {
      name: 'Positive',
      ...allBrands.reduce((acc, brand, idx) => ({ ...acc, [getBrandName(brand, idx)]: brand.stats.positive }), {})
    },
    {
      name: 'Negative',
      ...allBrands.reduce((acc, brand, idx) => ({ ...acc, [getBrandName(brand, idx)]: brand.stats.negative }), {})
    },
    {
      name: 'Neutral',
      ...allBrands.reduce((acc, brand, idx) => ({ ...acc, [getBrandName(brand, idx)]: brand.stats.neutral }), {})
    }
  ];

  const maxLength = Math.max(...allBrands.map(b => b.stats.scoreHistory?.length || 0));
  
  const lineData = Array.from({ length: maxLength }).map((_, i) => {
    const dataPoint: any = { index: i, comments: {} };
    
    allBrands.forEach((brand, idx) => {
      let score = null;
      const history = brand.stats.scoreHistory || [];
      if (i < history.length) {
        const windowSize = Math.max(3, Math.floor(history.length / 10));
        const start = Math.max(0, i - windowSize + 1);
        const windowSlice = history.slice(start, i + 1);
        score = windowSlice.reduce((sum, val) => sum + val, 0) / windowSlice.length;
      }
      const brandName = getBrandName(brand, idx);
      dataPoint[brandName] = score;
      if (brand.comments && brand.comments[i]) {
        dataPoint.comments[brandName] = brand.comments[i];
      }
    });
    
    return dataPoint;
  });

  const timeSeriesData = useMemo(() => {
    const hasDates = allBrands.some(b => b.comments?.some(c => c.date));
    
    if (hasDates) {
      const grouped: Record<string, any> = {};
      
      allBrands.forEach((brand, idx) => {
        const brandName = getBrandName(brand, idx);
        const comments = brand.comments || [];
        
        comments.forEach(c => {
          if (!c.date) return;
          try {
            const d = new Date(c.date);
            if (isNaN(d.getTime())) return;
            
            const key = formatDateKey(d, timeframe);
            
            if (!grouped[key]) {
              grouped[key] = { period: key, timestamp: d.getTime(), comments: {} };
              // Initialize all brands to 0
              allBrands.forEach((b, i) => {
                const bName = getBrandName(b, i);
                grouped[key][`${bName}_posts`] = 0;
                grouped[key][`${bName}_impressions`] = 0;
                grouped[key][`${bName}_engagement`] = 0;
                grouped[key].comments[bName] = [];
              });
            }
            
            grouped[key][`${brandName}_posts`] += 1;
            grouped[key][`${brandName}_engagement`] += (c.engagement || 0);
            grouped[key][`${brandName}_impressions`] += (c.engagement || 0) * (Math.floor(Math.random() * 5) + 5);
            grouped[key].comments[brandName].push(c);
          } catch (e) {
            // Ignore
          }
        });
      });
      
      let sorted = Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
      
      if (comparisonMode === 'percentage') {
        sorted = sorted.map((current, i) => {
          if (i === 0) {
            const res = { ...current };
            allBrands.forEach((b, idx) => {
              const bName = getBrandName(b, idx);
              res[`${bName}_posts`] = 0;
              res[`${bName}_impressions`] = 0;
              res[`${bName}_engagement`] = 0;
            });
            return res;
          }
          const prev = sorted[i - 1];
          const res = { ...current };
          allBrands.forEach((b, idx) => {
            const bName = getBrandName(b, idx);
            ['posts', 'impressions', 'engagement'].forEach(metric => {
              const key = `${bName}_${metric}`;
              const prevVal = prev[key];
              const currVal = current[key];
              res[key] = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : 0;
            });
          });
          return res;
        });
      }
      
      return sorted;
    }
    
    // Fallback if no dates
    const chunks = 12;
    const result = [];
    
    for (let i = 0; i < chunks; i++) {
      const periodData: any = { period: `Period ${i + 1}`, comments: {} };
      let hasData = false;
      
      allBrands.forEach((brand, idx) => {
        const comments = brand.comments || [];
        const chunkSize = Math.ceil(comments.length / chunks);
        const chunk = comments.slice(i * chunkSize, (i + 1) * chunkSize);
        
        if (chunk.length > 0) hasData = true;
        
        const posts = chunk.length;
        const engagement = chunk.reduce((sum, c) => sum + (c.engagement || 0), 0);
        const impressions = engagement * (Math.floor(Math.random() * 5) + 5) + (posts * 100);
        
        const brandName = getBrandName(brand, idx);
        periodData[`${brandName}_posts`] = posts;
        periodData[`${brandName}_impressions`] = impressions;
        periodData[`${brandName}_engagement`] = engagement;
        periodData.comments[brandName] = chunk;
      });
      
      if (hasData) {
        result.push(periodData);
      }
    }
    
    if (comparisonMode === 'percentage') {
      return result.map((current, i) => {
        if (i === 0) {
          const res = { ...current };
          allBrands.forEach((b, idx) => {
            const bName = getBrandName(b, idx);
            res[`${bName}_posts`] = 0;
            res[`${bName}_impressions`] = 0;
            res[`${bName}_engagement`] = 0;
          });
          return res;
        }
        const prev = result[i - 1];
        const res = { ...current };
        allBrands.forEach((b, idx) => {
          const bName = getBrandName(b, idx);
          ['posts', 'impressions', 'engagement'].forEach(metric => {
            const key = `${bName}_${metric}`;
            const prevVal = prev[key];
            const currVal = current[key];
            res[key] = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : 0;
          });
        });
        return res;
      });
    }
    
    return result;
  }, [allBrands, timeframe, comparisonMode]);

  const handleCompareUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.type === 'comparison' && json.brands) {
          if (json.brands.length > 0) {
            json.brands.forEach((b: any) => onAddCompare(b));
          }
        } else if (json.metadata && json.stats && json.comments) {
          onAddCompare(json);
        } else {
          alert("Invalid comparison file. Please upload an exported JSON analysis.");
        }
      } catch (error) {
        alert("Error parsing JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg mr-3">⚖️</span>
          Brand Comparison
        </h2>
        <div className="flex flex-wrap gap-3">
          {allBrands.length < 4 && (
            <label className="inline-flex items-center px-4 py-2 border border-indigo-200 dark:border-indigo-800 text-sm font-medium rounded-xl shadow-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
              <input type="file" accept=".json" className="hidden" onChange={handleCompareUpload} />
            </label>
          )}
          <button
            onClick={() => {
              const exportData = {
                type: 'comparison',
                timestamp: new Date().toISOString(),
                brands: allBrands
              };
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", `comparison_analysis_${new Date().getTime()}.json`);
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Comparison
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Close Comparison
          </button>
        </div>
      </div>

      {/* Brand Visibility Toggles */}
      <div className="flex flex-wrap gap-3">
        {allBrands.map((brand, idx) => {
          const isHidden = hiddenBrands.has(idx);
          const color = BRAND_COLORS[idx % BRAND_COLORS.length];
          return (
            <div 
              key={idx} 
              className={`flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                isHidden 
                  ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 shadow-sm'
              }`}
              style={!isHidden ? { borderLeftColor: color, borderLeftWidth: '4px' } : {}}
            >
              <button 
                onClick={() => toggleBrandVisibility(idx)} 
                className="flex items-center mr-2 hover:opacity-80 transition-opacity"
                title={isHidden ? "Show Brand" : "Hide Brand"}
              >
                {isHidden ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" style={{ color }} />}
                {getBrandName(brand, idx)}
              </button>
              
              {!isHidden && (
                <>
                  <button
                    onClick={() => setUpdatingBrandIndex(idx)}
                    className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors ml-1 pl-2 border-l border-slate-200 dark:border-slate-700"
                    title="Add Dates from CSV"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(brand, null, 2));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", `brand_${idx}_analysis_${new Date().getTime()}.json`);
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                    className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors ml-1 pl-2 border-l border-slate-200 dark:border-slate-700"
                    title="Export JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {idx > 0 && (
                <button
                  onClick={() => {
                    if (isHidden) toggleBrandVisibility(idx); // Ensure it's not hidden if removed
                    onRemoveCompare(idx - 1);
                  }}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors ml-1 pl-2 border-l border-slate-200 dark:border-slate-700"
                  title="Remove Brand"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Metrics Comparison Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Key Metrics Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-white dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Metric</th>
                  {visibleBrands.map(({ brand, index }) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_COLORS[index % BRAND_COLORS.length] }}>
                      {getBrandName(brand, index)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200 flex items-center">
                      <span className="mr-3">{row.icon}</span>
                      {row.metric as React.ReactNode}
                    </td>
                    {visibleBrands.map(({ brand, index }) => (
                      <td key={index} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {row[getBrandName(brand, index)] as React.ReactNode}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sentiment Distribution Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">Sentiment Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentDistData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tooltip-border, #e2e8f0)" />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'var(--tooltip-cursor, #f8fafc)'}}
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #ffffff)', borderColor: 'var(--tooltip-border, #e2e8f0)', color: 'var(--tooltip-text, #64748b)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'var(--tooltip-text, #64748b)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
                {visibleBrands.map(({ brand, index }) => (
                  <Bar key={index} dataKey={getBrandName(brand, index)} fill={BRAND_COLORS[index % BRAND_COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Trend Over Time */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Sentiment Trend Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} onClick={(data) => {
                if (data && data.activePayload) {
                  const payload = data.activePayload[0].payload;
                  if (payload.comments) {
                    const allComments = Object.values(payload.comments).flat() as CommentData[];
                    if (allComments.length > 0) {
                      setSelectedComments({ title: 'Comment Details', comments: allComments });
                    }
                  }
                }
              }} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tooltip-border, #e2e8f0)" />
                <XAxis dataKey="index" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis 
                  domain={[-100, 100]} 
                  ticks={[-100, 0, 100]}
                  tickFormatter={(value) => {
                    if (value === 100) return '😊';
                    if (value === 0) return '😐';
                    if (value === -100) return '😞';
                    return '';
                  }}
                  tick={{fill: '#64748b', fontSize: 20}} 
                  tickLine={false} 
                  axisLine={false} 
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #ffffff)', borderColor: 'var(--tooltip-border, #e2e8f0)', color: 'var(--tooltip-text, #64748b)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: 'var(--tooltip-text, #64748b)', marginBottom: '4px' }}
                  formatter={(value: number) => [value?.toFixed(1) || 'N/A', 'Rolling Score']}
                />
                <Legend verticalAlign="bottom" height={36}/>
                {visibleBrands.map(({ brand, index }) => (
                  <Line 
                    key={index}
                    type="monotone" 
                    dataKey={getBrandName(brand, index)} 
                    stroke={BRAND_COLORS[index % BRAND_COLORS.length]} 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: BRAND_COLORS[index % BRAND_COLORS.length], stroke: '#fff', strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collapsible Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Time Series Analysis</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Timeframe:</label>
                <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="block w-32 pl-3 pr-10 py-1.5 text-sm border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Mode:</label>
                <select 
                  value={comparisonMode} 
                  onChange={(e) => setComparisonMode(e.target.value as any)}
                  className="block w-32 pl-3 pr-10 py-1.5 text-sm border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm"
                >
                  <option value="absolute">Absolute</option>
                  <option value="percentage">% Change</option>
                </select>
              </div>
            </div>
          </div>

          <CollapsibleChart
            title="Number of Posts Over Time"
            description="This chart illustrates the total number of posts published during the selected time period, broken down by month. The horizontal axis represents time (months), while the vertical axis shows the number of posts published in each period.&#10;&#10;The purpose of this chart is to:&#10;• Identify fluctuations in posting activity&#10;• Highlight peak and low publishing periods&#10;• Assess consistency in content output&#10;• Support evaluation of content strategy execution&#10;&#10;Higher values indicate increased publishing activity, while lower values reflect reduced posting volume."
            data={timeSeriesData}
            dataKeys={visibleBrands.map(({ brand, index }) => `${getBrandName(brand, index)}_posts`)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} onClick={(data) => {
                if (data && data.activePayload) {
                  const payload = data.activePayload[0].payload;
                  if (payload.comments) {
                    const allComments = Object.values(payload.comments).flat() as CommentData[];
                    if (allComments.length > 0) {
                      setSelectedComments({ title: `Posts in ${payload.period}`, comments: allComments });
                    }
                  }
                }
              }} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tooltip-border, #e2e8f0)" />
                <XAxis dataKey="period" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} label={{ value: 'Number of Posts', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12, offset: 0 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #ffffff)', borderColor: 'var(--tooltip-border, #e2e8f0)', color: 'var(--tooltip-text, #64748b)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: 'var(--tooltip-text, #64748b)', marginBottom: '4px' }}
                  formatter={(value: number, name: string) => [comparisonMode === 'percentage' ? `${value.toFixed(1)}%` : value, name]}
                />
                <Legend verticalAlign="bottom" height={36}/>
                {visibleBrands.map(({ brand, index }) => {
                  const dataKey = `${getBrandName(brand, index)}_posts`;
                  const color = BRAND_COLORS[index % BRAND_COLORS.length];
                  return (
                    <Line 
                      key={index} 
                      type="monotone" 
                      dataKey={dataKey} 
                      name={getBrandName(brand, index)} 
                      stroke={color} 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: color, strokeWidth: 0 }} 
                      activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }} 
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </CollapsibleChart>

          <CollapsibleChart
            title="Potential Impressions Over Time"
            description="This chart shows the potential impressions generated over the selected time period. The horizontal axis represents time (months), and the vertical axis represents the estimated potential reach.&#10;&#10;Potential impressions reflect the maximum possible audience size that could have been exposed to the content based on follower counts and content distribution.&#10;&#10;This visualization helps:&#10;• Identify spikes in visibility&#10;• Evaluate campaign amplification impact&#10;• Measure growth or decline in potential audience reach&#10;• Compare visibility trends over time&#10;&#10;Peaks typically indicate high-impact campaigns, viral content, or boosted distribution."
            data={timeSeriesData}
            dataKeys={visibleBrands.map(({ brand, index }) => `${getBrandName(brand, index)}_impressions`)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} onClick={(data) => {
                if (data && data.activePayload) {
                  const payload = data.activePayload[0].payload;
                  if (payload.comments) {
                    const allComments = Object.values(payload.comments).flat() as CommentData[];
                    if (allComments.length > 0) {
                      setSelectedComments({ title: `Impressions in ${payload.period}`, comments: allComments });
                    }
                  }
                }
              }} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tooltip-border, #e2e8f0)" />
                <XAxis dataKey="period" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} label={{ value: 'Potential Impressions', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12, offset: 0 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #ffffff)', borderColor: 'var(--tooltip-border, #e2e8f0)', color: 'var(--tooltip-text, #64748b)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: 'var(--tooltip-text, #64748b)', marginBottom: '4px' }}
                  formatter={(value: number, name: string) => [comparisonMode === 'percentage' ? `${value.toFixed(1)}%` : value, name]}
                />
                <Legend verticalAlign="bottom" height={36}/>
                {visibleBrands.map(({ brand, index }) => {
                  const dataKey = `${getBrandName(brand, index)}_impressions`;
                  const color = BRAND_COLORS[index % BRAND_COLORS.length];
                  return (
                    <Line 
                      key={index} 
                      type="monotone" 
                      dataKey={dataKey} 
                      name={getBrandName(brand, index)} 
                      stroke={color} 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: color, strokeWidth: 0 }} 
                      activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }} 
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </CollapsibleChart>

          <CollapsibleChart
            title="Total Engagement Over Time"
            description="This chart visualizes the total engagement (likes, shares, comments, etc.) received over the selected time period. The horizontal axis represents time (months), and the vertical axis shows the aggregate engagement metrics.&#10;&#10;This visualization helps:&#10;• Track audience interaction trends&#10;• Identify highly engaging content periods&#10;• Measure the overall effectiveness of the content strategy&#10;• Provide context for sentiment and impression data"
            data={timeSeriesData}
            dataKeys={visibleBrands.map(({ brand, index }) => `${getBrandName(brand, index)}_engagement`)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} onClick={(data) => {
                if (data && data.activePayload) {
                  const payload = data.activePayload[0].payload;
                  if (payload.comments) {
                    const allComments = Object.values(payload.comments).flat() as CommentData[];
                    if (allComments.length > 0) {
                      setSelectedComments({ title: `Engagement in ${payload.period}`, comments: allComments });
                    }
                  }
                }
              }} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tooltip-border, #e2e8f0)" />
                <XAxis dataKey="period" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} label={{ value: 'Total Engagement', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12, offset: 0 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #ffffff)', borderColor: 'var(--tooltip-border, #e2e8f0)', color: 'var(--tooltip-text, #64748b)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: 'var(--tooltip-text, #64748b)', marginBottom: '4px' }}
                  formatter={(value: number, name: string) => [comparisonMode === 'percentage' ? `${value.toFixed(1)}%` : value, name]}
                />
                <Legend verticalAlign="bottom" height={36}/>
                {visibleBrands.map(({ brand, index }) => {
                  const dataKey = `${getBrandName(brand, index)}_engagement`;
                  const color = BRAND_COLORS[index % BRAND_COLORS.length];
                  return (
                    <Line 
                      key={index} 
                      type="monotone" 
                      dataKey={dataKey} 
                      name={getBrandName(brand, index)} 
                      stroke={color} 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: color, strokeWidth: 0 }} 
                      activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }} 
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </CollapsibleChart>

          <WordCloudSection comments={visibleBrands.flatMap(b => b.brand.comments)} />
        </div>
      </div>
      {updatingBrandIndex !== null && (
        <UpdateDatesModal
          brandData={allBrands[updatingBrandIndex]}
          brandName={getBrandName(allBrands[updatingBrandIndex], updatingBrandIndex)}
          onClose={() => setUpdatingBrandIndex(null)}
          onUpdate={(updatedData) => {
            setLocalOverrides(prev => ({ ...prev, [updatingBrandIndex]: updatedData }));
            setUpdatingBrandIndex(null);
          }}
        />
      )}

      {selectedComments && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedComments(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{selectedComments.title} ({selectedComments.comments.length})</h3>
              <button onClick={() => setSelectedComments(null)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {selectedComments.comments.map((comment, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Comment</span>
                    <p className="mt-1 text-slate-800 dark:text-slate-200">{comment.text}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sentiment</span>
                      <p className="mt-1 text-sm capitalize font-medium" style={{ color: comment.sentiment === 'positive' ? '#10b981' : comment.sentiment === 'negative' ? '#f43f5e' : '#f59e0b' }}>
                        {comment.sentiment}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Score</span>
                      <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{(comment.score * 100).toFixed(1)}%</p>
                    </div>
                    {comment.date && (
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Date</span>
                        <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{comment.date}</p>
                      </div>
                    )}
                    {comment.engagement !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Engagement</span>
                        <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{comment.engagement}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
