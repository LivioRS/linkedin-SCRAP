export interface Client {
  id: string
  name: string
  url: string
  type: 'own' | 'competitor'
  industry: string
  status: 'idle' | 'processing' | 'success' | 'error'
  lastUpdated: string
  avatarUrl: string
  platform?: 'linkedin' | 'instagram' | 'facebook' | 'twitter' | 'youtube'
  platformConfig?: {
    enabled: boolean
    apiKey?: string
    accessToken?: string
    taskId?: string
  }
}

export interface Post {
  id: string
  clientId: string
  content: string
  likes: number
  comments: number
  shares: number
  views: number
  sentimentScore: number // -1 to 1
  sentimentExplanation: string
  postedAt: string
  url: string
}

export interface Comment {
  id: string
  postId: string
  author: string
  content: string
  sentimentScore: number
  postedAt: string
}

export interface Alert {
  id: string
  type: 'sentiment_drop' | 'engagement_spike' | 'competitor_move'
  message: string
  severity: 'low' | 'medium' | 'high'
  createdAt: string
  isRead: boolean
}

export interface DailyMetric {
  date: string
  clientId: string
  sentimentScore: number
  engagementRate: number
  postsCount: number
}

export interface ScrapingLog {
  id: string
  date: string
  status: 'success' | 'failed'
  itemsCollected: number
  durationMs: number
  platform?: string
  clientId?: string
  error?: string
}

export interface ApiConfig {
  apifyApiKey?: string
  apifyTaskId?: string
  claudeApiKey?: string
  claudeModel?: string
  telegramBotToken?: string
  telegramChatId?: string
}

export interface DashboardWidget {
  id: string
  type: 'kpi' | 'chart' | 'table' | 'list'
  title: string
  config: any
  position: { x: number; y: number; w: number; h: number }
  visible: boolean
}
