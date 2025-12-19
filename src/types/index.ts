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
  title?: string
  likes: number
  comments: number
  shares: number
  views: number
  sentimentScore: number // -1 to 1
  sentimentExplanation: string
  postedAt: string
  url: string
  vehicle?: string
  region?: string
  category?: string
  urgency?: 'baixa' | 'media' | 'alta'
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

export interface TargetUrl {
  id: string
  url: string
  description?: string
  platform: string
  createdAt: string
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
  targetUrls: TargetUrl[]
}

export interface DashboardWidget {
  id: string
  type: 'kpi' | 'chart' | 'list' | 'table'
  title: string
  config: Record<string, any>
  position: { x: number; y: number; w: number; h: number }
  visible: boolean
}

// Data structures for Analysis and Dashboard Hooks
export interface SparklineData {
  index: number
  value: number
}

export interface MetricCardData {
  id: string
  title: string
  value: string | number
  trend: number
  trendLabel: string
  data: SparklineData[]
  color: string
}

export interface HeatMapCell {
  day: string
  hourSlot: string
  value: number
}

export interface ClientChartData {
  date: string
  sentiment: number
  volume: number
}

export interface ClientDashboardData {
  id: string
  name: string
  url: string
  type: string
  industry: string
  status: string
  lastUpdated: string
  avatarUrl: string
  history: ClientChartData[]
  distribution: {
    positive: number
    neutral: number
    negative: number
  }
}
