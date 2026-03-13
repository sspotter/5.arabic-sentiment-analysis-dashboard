import { SavedProject } from '../types';

export const defaultProjects: SavedProject[] = [
  {
    id: 'default-bad-engagement',
    name: 'Bad Engagement Sample',
    date: '2026-02-28T00:04:06.376Z',
    data: {
      metadata: {
        columnAnalyzed: 'Comment Text',
        evaluationTime: 4.047,
        processingSpeed: '2.5',
        timestamp: '2026-02-28T00:04:06.376Z'
      },
      stats: {
        total: 10,
        processed: 10,
        positive: 3,
        negative: 7,
        neutral: 0,
        verifiedTotal: 9,
        verifiedPositive: 3,
        verifiedNegative: 6,
        verifiedNeutral: 0,
        totalEngagement: 5115,
        averageEngagement: 511.5,
        currentScore: -40,
        scoreHistory: [-100, -100, -100, -100, -100, 100, -100, 100, -100, 100],
        startTime: 1772237028475,
        currentComment: {
          id: 10,
          text: 'Always stunning',
          sentiment: 'positive',
          score: 0.95,
          isVerified: true,
          engagement: 1014,
          date: '2/7/2026, 2:53:22 PM'
        },
        endTime: 1772237032522,
      },
      comments: [
        { id: 1, text: 'Hate That', sentiment: 'negative', score: -0.8, isVerified: false, engagement: 9, date: '2/9/2026, 2:05:38 PM' },
        { id: 2, text: 'BAAAADDDD', sentiment: 'negative', score: -0.9, isVerified: true, engagement: 9, date: '2/9/2026, 2:13:23 PM' },
        { id: 3, text: 'Hate That', sentiment: 'negative', score: -0.8, isVerified: true, engagement: 9, date: '2/9/2026, 2:40:39 PM' },
        { id: 4, text: 'Hate That', sentiment: 'negative', score: -0.8, isVerified: true, engagement: 9, date: '2/13/2026, 4:43:00 PM' },
        { id: 5, text: 'Hate That', sentiment: 'negative', score: -0.8, isVerified: true, engagement: 9, date: '2/9/2026, 2:13:19 PM' },
        { id: 6, text: 'Love it', sentiment: 'positive', score: 0.9, isVerified: true, engagement: 1014, date: '2/7/2026, 2:16:29 PM' },
        { id: 7, text: 'Hate That', sentiment: 'negative', score: -0.8, isVerified: true, engagement: 1014, date: '2/15/2026, 11:29:10 PM' },
        { id: 8, text: 'Love the style', sentiment: 'positive', score: 0.9, isVerified: true, engagement: 1014, date: '2/13/2026, 3:28:55 PM' },
        { id: 9, text: 'Hate That', sentiment: 'negative', score: -0.8, isVerified: true, engagement: 1014, date: '2/7/2026, 4:32:38 PM' },
        { id: 10, text: 'Always stunning', sentiment: 'positive', score: 0.95, isVerified: true, engagement: 1014, date: '2/7/2026, 2:53:22 PM' },
      ]
    }
  },
  {
    id: 'default-mid-engagement',
    name: 'Mid Engagement Sample',
    date: '2026-02-28T00:16:19.406Z',
    data: {
      metadata: {
        columnAnalyzed: 'Comment Text',
        evaluationTime: 8.595,
        processingSpeed: '1.6',
        timestamp: '2026-02-28T00:16:19.406Z'
      },
      stats: {
        total: 14,
        processed: 14,
        positive: 0,
        negative: 0,
        neutral: 14,
        verifiedTotal: 5,
        verifiedPositive: 0,
        verifiedNegative: 0,
        verifiedNeutral: 5,
        totalEngagement: 6228,
        averageEngagement: 444.85714285714283,
        currentScore: 0,
        scoreHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        startTime: 1772237277130,
        currentComment: {
          id: 14,
          text: '.',
          sentiment: 'neutral',
          score: 0,
          isVerified: true,
          engagement: 33,
          date: '2/6/2026, 5:08:40 PM'
        },
        endTime: 1772237285725,
      },
      comments: [
        { id: 1, text: '.', sentiment: 'neutral', score: 0, isVerified: false, engagement: 9, date: '2/9/2026, 2:05:38 PM' },
        { id: 2, text: '.', sentiment: 'neutral', score: 0, isVerified: true, engagement: 9, date: '2/9/2026, 2:13:23 PM' },
        { id: 3, text: '.', sentiment: 'neutral', score: 0, isVerified: false, engagement: 9, date: '2/9/2026, 2:40:39 PM' },
        { id: 4, text: '.', sentiment: 'neutral', score: 0, isVerified: false, engagement: 9, date: '2/13/2026, 4:43:00 PM' },
        { id: 5, text: '.', sentiment: 'neutral', score: 0, isVerified: true, engagement: 9, date: '2/9/2026, 2:13:19 PM' },
        { id: 6, text: '.', sentiment: 'neutral', score: 0, isVerified: true, engagement: 1014, date: '2/7/2026, 2:16:29 PM' },
        { id: 7, text: '.', sentiment: 'neutral', score: 0, isVerified: true, engagement: 1014, date: '2/15/2026, 11:29:10 PM' },
        { id: 8, text: '.', sentiment: 'neutral', score: 0, isVerified: false, engagement: 1014, date: '2/13/2026, 3:28:55 PM' },
        { id: 9, text: '.', sentiment: 'neutral', score: 0, isVerified: false, engagement: 1014, date: '2/7/2026, 4:32:38 PM' },
        { id: 10, text: '.', sentiment: 'neutral', score: 0, isVerified: false, engagement: 1014, date: '2/7/2026, 3:07:05 PM' },
        { id: 11, text: '.', sentiment: 'neutral', score: 0, isVerified: false, engagement: 1014, date: '2/7/2026, 2:53:22 PM' },
        { id: 12, text: '.', sentiment: 'neutral', score: 0, isVerified: false, engagement: 33, date: '2/6/2026, 8:45:54 PM' },
        { id: 13, text: '.', sentiment: 'neutral', score: 0, isVerified: false, engagement: 33, date: '2/6/2026, 8:23:08 PM' },
        { id: 14, text: '.', sentiment: 'neutral', score: 0, isVerified: true, engagement: 33, date: '2/6/2026, 5:08:40 PM' },
      ]
    }
  },
  {
    id: 'default-perfect-engagement',
    name: 'Perfect Engagement Sample',
    date: '2026-02-28T00:18:50.931Z',
    data: {
      metadata: {
        columnAnalyzed: 'Comment Text',
        evaluationTime: 11.62,
        processingSpeed: '1.2',
        timestamp: '2026-02-28T00:18:50.931Z'
      },
      stats: {
        total: 14,
        processed: 14,
        positive: 14,
        negative: 0,
        neutral: 0,
        verifiedTotal: 5,
        verifiedPositive: 5,
        verifiedNegative: 0,
        verifiedNeutral: 0,
        totalEngagement: 10234,
        averageEngagement: 731,
        currentScore: 100,
        scoreHistory: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        startTime: 1772237911538,
        currentComment: {
          id: 14,
          text: '❤️',
          sentiment: 'positive',
          score: 0.8,
          isVerified: true,
          engagement: 33,
          date: '2/10/2026, 5:08:40 PM'
        },
        endTime: 1772237923158,
      },
      comments: [
        { id: 1, text: '🔥🔥🔥', sentiment: 'positive', score: 0.8, isVerified: false, engagement: 9, date: '2/9/2026, 2:05:38 PM' },
        { id: 2, text: '🥳🥳🥳', sentiment: 'positive', score: 0.9, isVerified: true, engagement: 12, date: '2/15/2026, 2:13:23 PM' },
        { id: 3, text: '⚡️⚡️⚡️⚡️', sentiment: 'positive', score: 0.7, isVerified: false, engagement: 12, date: '2/15/2026, 2:40:39 PM' },
        { id: 4, text: '❤️❤️❤️❤️', sentiment: 'positive', score: 0.9, isVerified: false, engagement: 9, date: '2/13/2026, 4:43:00 PM' },
        { id: 5, text: 'Yesssss!', sentiment: 'positive', score: 0.85, isVerified: true, engagement: 9, date: '2/9/2026, 2:13:19 PM' },
        { id: 6, text: '😍😍😍', sentiment: 'positive', score: 0.9, isVerified: true, engagement: 1014, date: '2/7/2026, 2:16:29 PM' },
        { id: 7, text: '😂', sentiment: 'positive', score: 0.6, isVerified: true, engagement: 3014, date: '2/15/2026, 11:29:10 PM' },
        { id: 8, text: '😂', sentiment: 'positive', score: 0.6, isVerified: false, engagement: 1014, date: '2/13/2026, 3:28:55 PM' },
        { id: 9, text: '😂😂😂', sentiment: 'positive', score: 0.7, isVerified: false, engagement: 3014, date: '2/7/2026, 4:32:38 PM' },
        { id: 10, text: 'والله اميزنق 🤍🤣', sentiment: 'positive', score: 0.95, isVerified: false, engagement: 1014, date: '2/7/2026, 3:07:05 PM' },
        { id: 11, text: '❤️‍🔥❤️‍🔥❤️‍🔥❤️‍🔥جدة غييير', sentiment: 'positive', score: 0.95, isVerified: false, engagement: 1014, date: '2/7/2026, 2:53:22 PM' },
        { id: 12, text: '😝😜😜', sentiment: 'positive', score: 0.6, isVerified: false, engagement: 33, date: '2/2/2026, 8:45:54 PM' },
        { id: 13, text: '🤩🤩❤️‍🩹', sentiment: 'positive', score: 0.85, isVerified: false, engagement: 33, date: '2/10/2026, 8:23:08 PM' },
        { id: 14, text: '❤️', sentiment: 'positive', score: 0.8, isVerified: true, engagement: 33, date: '2/10/2026, 5:08:40 PM' },
      ]
    }
  },
  
];
