export interface CommentData {
  id: number;
  text: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  score?: number;
  isVerified?: boolean;
  engagement?: number;
  date?: string;
}

export interface AnalysisStats {
  total: number;
  processed: number;
  positive: number;
  negative: number;
  neutral: number;
  verifiedTotal: number;
  verifiedPositive: number;
  verifiedNegative: number;
  verifiedNeutral: number;
  totalEngagement: number;
  averageEngagement: number;
  currentScore: number;
  scoreHistory: number[];
  currentComment?: CommentData;
  startTime: number;
  endTime?: number;
}

export interface ExportedAnalysis {
  metadata: {
    columnAnalyzed: string;
    evaluationTime: number;
    processingSpeed: string | number;
    timestamp: string;
  };
  stats: AnalysisStats;
  comments: CommentData[];
}

export interface SavedProject {
  id: string;
  name: string;
  date: string;
  data: ExportedAnalysis;
}
