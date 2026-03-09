const fs = require('fs');
const path = require('path');

const files = [
  'src/App.tsx',
  'src/components/FileUpload.tsx',
  'src/components/DataPreview.tsx',
  'src/components/AnalysisProgress.tsx',
  'src/components/FinalResults.tsx',
  'src/components/SavedProjectsList.tsx',
  'src/components/ComparisonDashboard.tsx'
];

const replacements = [
  { from: /bg-slate-950/g, to: 'bg-slate-50 dark:bg-slate-950' },
  { from: /bg-slate-900\/50/g, to: 'bg-slate-50 dark:bg-slate-900/50' },
  { from: /bg-slate-800\/50/g, to: 'bg-slate-50 dark:bg-slate-800/50' },
  { from: /bg-slate-800\/30/g, to: 'bg-slate-50 dark:bg-slate-800/30' },
  { from: /bg-slate-900/g, to: 'bg-white dark:bg-slate-900' },
  { from: /bg-slate-800/g, to: 'bg-white dark:bg-slate-800' },
  { from: /text-slate-100/g, to: 'text-slate-900 dark:text-slate-100' },
  { from: /text-slate-200/g, to: 'text-slate-800 dark:text-slate-200' },
  { from: /text-slate-300/g, to: 'text-slate-700 dark:text-slate-300' },
  { from: /text-slate-400/g, to: 'text-slate-500 dark:text-slate-400' },
  { from: /border-slate-800/g, to: 'border-slate-200 dark:border-slate-800' },
  { from: /border-slate-700/g, to: 'border-slate-300 dark:border-slate-700' },
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    fs.writeFileSync(file, content);
    console.log(`Processed ${file}`);
  }
});
