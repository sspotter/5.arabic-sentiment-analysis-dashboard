import React, { useMemo, useState } from 'react';
import WordCloud from 'react-d3-cloud';
import { CommentData } from '../types';
import { MessageSquare } from 'lucide-react';

interface WordCloudSectionProps {
  comments: CommentData[];
}

const ARABIC_STOP_WORDS = new Set([
  'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'أن', 'لا', 'ما', 'هل', 'كيف', 'متى', 'أين', 'لماذا', 'كم', 'يا', 'و', 'أو', 'ثم', 'لكن', 'بل', 'كل', 'بعض', 'أي', 'هو', 'هي', 'هم', 'هن', 'أنت', 'أنا', 'نحن', 'الذي', 'التي', 'الذين', 'اللاتي', 'كان', 'كانت', 'يكون', 'ليس', 'إن', 'قد', 'لقد', 'ب', 'ل', 'ك', 'ف', 'حتى', 'إذا', 'لو', 'لولا', 'لوما', 'لما', 'إلا', 'غير', 'سوى', 'مثل', 'شبه', 'نحو', 'بين', 'قبل', 'بعد', 'عند', 'لدى', 'حيث', 'دون', 'أمام', 'خلف', 'وراء', 'فوق', 'تحت', 'يمين', 'يسار', 'شمال', 'جنوب', 'شرق', 'غرب', 'داخل', 'خارج', 'حول', 'معظم', 'أغلب', 'جميع', 'كافة', 'عامة', 'أحد', 'إحدى', 'آخر', 'أخرى', 'نفس', 'عين', 'ذات', 'كلا', 'كلتا', 'بضع', 'بضعة', 'عدة', 'كثير', 'قليل', 'جدا', 'فقط', 'أيضا', 'كذلك', 'هكذا', 'هنا', 'هناك', 'هنالك', 'الآن', 'غدا', 'أمس', 'اليوم', 'الليلة', 'صباحا', 'مساء', 'ظهرا', 'عصرا', 'ليلا', 'نهارا', 'دائما', 'أبدا', 'قط', 'أجل', 'نعم', 'بلى', 'إي', 'كلا', 'ربما', 'لعل', 'عسى', 'ليت', 'يا', 'أيا', 'هيا', 'وا', 'آه', 'أف', 'وي', 'واها', 'بخ', 'صه', 'مه', 'آمين', 'اللهم', 'الله', 'والله', 'بالله', 'تالله', 'اللي', 'وش', 'ايش', 'شو', 'شنو', 'شلون', 'كيف', 'عشان', 'عبالي', 'علشان', 'بس', 'عن', 'حق', 'تبع', 'مال', 'بتاع', 'زي', 'متل', 'شبه', 'كأن', 'كأنه', 'كأنها', 'كأنهم', 'كأنكم', 'كأننا', 'كأني', 'كأنك', 'كأنكن', 'كأنهن', 'كأنما', 'إنما', 'أنما', 'لأن', 'لأنه', 'لأنها', 'لأنهم', 'لأنكم', 'لأننا', 'لأني', 'لأنك', 'لأنكن', 'لأنهن', 'لأنما', 'بما', 'بماذا', 'بما', 'بمن', 'بمن', 'عما', 'عمن', 'مما', 'ممن', 'فيما', 'فيمن', 'إلام', 'إلام', 'علام', 'علام', 'حتام', 'حتام', 'إلى', 'إلى', 'على', 'على', 'حتى', 'حتى', 'بلى', 'بلى', 'متى', 'متى', 'أنى', 'أنى', 'لدى', 'لدى', 'سوى', 'سوى', 'عسى', 'عسى', 'ألا', 'ألا', 'إلا', 'إلا', 'هلا', 'هلا', 'لولا', 'لولا', 'لوما', 'لوما', 'أما', 'أما', 'إما', 'إما', 'كلما', 'كلما', 'لما', 'لما', 'بينما', 'بينما', 'ريثما', 'ريثما', 'طالما', 'طالما', 'قلما', 'قلما', 'كثرما', 'كثرما', 'حيثما', 'حيثما', 'كيفما', 'كيفما', 'أينما', 'أينما', 'أنما', 'أنما', 'إنما', 'إنما', 'كأنما', 'كأنما', 'لأنما', 'لأنما', 'لكنما', 'لكنما', 'ليتما', 'ليتما', 'لعلما', 'لعلما', 'ربما', 'ربما', 'سيما', 'سيما', 'لاسيما', 'لاسيما'
]);

export function WordCloudSection({ comments }: WordCloudSectionProps) {
  const [topCount, setTopCount] = useState<number>(50);

  const wordData = useMemo(() => {
    if (!comments || comments.length === 0) return [];

    // Sort comments by engagement (descending)
    const sortedComments = [...comments].sort((a, b) => (b.engagement || 0) - (a.engagement || 0));
    
    // Take top N comments based on engagement
    const topComments = sortedComments.slice(0, topCount);

    const wordCounts: Record<string, number> = {};

    topComments.forEach(comment => {
      // Basic tokenization: split by non-word characters (Arabic letters are \u0600-\u06FF)
      const words = comment.text
        .replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2) // Ignore very short words
        .map(w => w.toLowerCase());

      const engagementScore = Math.max(1, comment.engagement || 1);

      words.forEach(word => {
        if (!ARABIC_STOP_WORDS.has(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + engagementScore;
        }
      });
    });

    // Convert to array and sort by frequency
    const data = Object.entries(wordCounts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 100); // Max 100 words in the cloud

    return data;
  }, [comments, topCount]);

  if (wordData.length === 0) {
    return null;
  }

  // Calculate font sizes based on values
  const maxValue = Math.max(...wordData.map(d => d.value));
  const minValue = Math.min(...wordData.map(d => d.value));
  
  const fontSizeMapper = (word: any) => {
    const minSize = 14;
    const maxSize = 60;
    if (maxValue === minValue) return (maxSize + minSize) / 2;
    return minSize + ((word.value - minValue) / (maxValue - minValue)) * (maxSize - minSize);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
          Word Cloud (Most Engaged Comments)
        </h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-slate-500 dark:text-slate-400">Analyze Top:</label>
          <select
            value={topCount}
            onChange={(e) => setTopCount(Number(e.target.value))}
            className="pl-3 pr-8 py-1 text-sm border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm appearance-none"
          >
            <option value={10}>10 Comments</option>
            <option value={50}>50 Comments</option>
            <option value={100}>100 Comments</option>
            <option value={500}>500 Comments</option>
          </select>
        </div>
      </div>
      <div className="p-6 h-[400px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 overflow-hidden">
        {wordData.length > 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <WordCloud
              data={wordData}
              width={800}
              height={350}
              font="Inter"
              fontWeight="bold"
              fontSize={fontSizeMapper}
              rotate={0}
              padding={4}
              fill={(d: any, i: number) => {
                const colors = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
                return colors[i % colors.length];
              }}
            />
          </div>
        ) : (
          <div className="text-slate-500 dark:text-slate-400">Not enough data to generate word cloud.</div>
        )}
      </div>
    </div>
  );
}
