export interface Client {
  id: string
  name: string
  url: string
  type: 'own' | 'competitor'
  industry: string
  status: 'idle' | 'processing' | 'success' | 'error'
  lastUpdated: string
  avatarUrl: string
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
  type: 'sentiment_drop' | 'engagement_spike' | 'competitor_move' | 'custom'
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
}

export interface Settings {
  apiKeys: {
    apify: string
    anthropic: string
    telegramBot: string
    supabaseUrl: string
    supabaseKey: string
  }
  platforms: {
    linkedin: boolean
    instagram: boolean
    facebook: boolean
    twitter: boolean
    youtube: boolean
  }
  notifications: {
    telegramChatId: string
    alertOnNegative: boolean
    alertOnCompetitor: boolean
    alertOnSpike: boolean
  }
  scraping: {
    frequency: 'hourly' | 'daily' | 'weekly'
    retentionDays: number
  }
}

export interface DashboardWidget {
  id: string
  type: 'kpi' | 'chart' | 'list' | 'table'
  title: string
  config: Record<string, any>
  position: { x: number; y: number; w: number; h: number }
  visible: boolean
}

export interface ApiConfig {
  apifyApiKey?: string
  telegramBotToken?: string
  telegramChatId?: string
}
