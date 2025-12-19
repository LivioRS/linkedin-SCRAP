import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { Client, Post, DailyMetric, Alert, Settings, Comment } from '@/types'
import { subDays, format } from 'date-fns'

interface AppState {
  clients: Client[]
  posts: Post[]
  metrics: DailyMetric[]
  alerts: Alert[]
  comments: Comment[]
  settings: Settings
  isLoading: boolean
  isScraping: boolean
  scrapingStatus: Record<string, string>
  addClient: (
    client: Omit<Client, 'id' | 'status' | 'lastUpdated' | 'avatarUrl'>,
  ) => void
  removeClient: (id: string) => void
  updateClient: (id: string, data: Partial<Client>) => void
  updateSettings: (settings: Partial<Settings>) => void
  markAlertRead: (id: string) => void
  triggerGlobalScrape: () => Promise<void>
  refreshData: () => void
  testTelegramConnection: () => Promise<boolean>
  testApifyConnection: () => Promise<boolean>
  testClaudeConnection: () => Promise<boolean>
  testSupabaseConnection: () => Promise<boolean>
}

const defaultSettings: Settings = {
  apiKeys: {
    apify: '',
    anthropic: '',
    telegramBot: '',
    supabaseUrl: '',
    supabaseKey: '',
  },
  platforms: {
    linkedin: true,
    instagram: false,
    facebook: false,
    twitter: false,
    youtube: false,
  },
  notifications: {
    telegramChatId: '',
    alertOnNegative: true,
    alertOnCompetitor: true,
    alertOnSpike: true,
  },
  scraping: {
    frequency: 'daily',
    retentionDays: 90,
  },
  targetUrls: [],
}

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [metrics, setMetrics] = useState<DailyMetric[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isScraping, setIsScraping] = useState(false)
  const [scrapingStatus, setScrapingStatus] = useState<Record<string, string>>(
    {},
  )

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const generateMockData = useCallback(() => {
    // Mock Clients
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Grupo Plaenge',
        url: 'https://linkedin.com/company/grupo-plaenge',
        type: 'own',
        industry: 'Construção Civil',
        status: 'success',
        lastUpdated: new Date().toISOString(),
        avatarUrl:
          'https://img.usecurling.com/i?q=plaenge&color=violet&shape=fill',
      },
      {
        id: '2',
        name: 'Vanguard',
        url: 'https://linkedin.com/company/vanguard-home',
        type: 'competitor',
        industry: 'Construção Civil',
        status: 'success',
        lastUpdated: new Date().toISOString(),
        avatarUrl:
          'https://img.usecurling.com/i?q=vanguard&color=blue&shape=fill',
      },
      {
        id: '3',
        name: 'A.Yoshii',
        url: 'https://linkedin.com/company/a-yoshii',
        type: 'competitor',
        industry: 'Construção Civil',
        status: 'success',
        lastUpdated: new Date().toISOString(),
        avatarUrl: 'https://img.usecurling.com/i?q=yoshii&color=red&shape=fill',
      },
    ]

    // Mock Metrics (Last 30 days)
    const mockMetrics: DailyMetric[] = []
    const today = new Date()

    mockClients.forEach((client) => {
      for (let i = 0; i < 30; i++) {
        const date = subDays(today, 29 - i)
        const dateStr = format(date, 'yyyy-MM-dd')

        let baseSentiment = client.type === 'own' ? 0.6 : 0.4
        const randomVar = (Math.random() - 0.5) * 0.4
        const trend = Math.sin(i / 5) * 0.2

        mockMetrics.push({
          date: dateStr,
          clientId: client.id,
          sentimentScore: Math.max(
            -1,
            Math.min(1, baseSentiment + randomVar + trend),
          ),
          engagementRate: 0.03 + Math.random() * 0.05,
          postsCount: Math.floor(Math.random() * 5),
        })
      }
    })

    // Mock Posts
    const mockPosts: Post[] = []
    mockClients.forEach((client) => {
      const postCount =
        client.type === 'own' ? 45 : Math.floor(Math.random() * 30) + 20

      for (let i = 0; i < postCount; i++) {
        const sentiment = Math.random() * 2 - 1
        mockPosts.push({
          id: `${client.id}-post-${i}`,
          clientId: client.id,
          content: `${client.name} está inovando no mercado de ${client.industry}. Confira os novos lançamentos e projetos sustentáveis que estão mudando o cenário urbano. #${client.industry} #inovação`,
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 20),
          views: Math.floor(Math.random() * 5000) + 500,
          sentimentScore: sentiment,
          sentimentExplanation:
            'Análise baseada em palavras-chave positivas como "inovação" e "sustentável".',
          postedAt: subDays(
            new Date(),
            Math.floor(Math.random() * 30),
          ).toISOString(),
          url: 'https://linkedin.com',
          vehicle: Math.random() > 0.7 ? 'News' : 'LinkedIn',
          category: Math.random() > 0.5 ? 'Corporativo' : 'Produtos',
        })
      }
    })

    // Mock Alerts
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'sentiment_drop',
        message:
          'Queda de sentimento detectada na última semana para Grupo Plaenge.',
        severity: 'medium',
        createdAt: subDays(new Date(), 1).toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: 'competitor_move',
        message:
          'Novo pico de engajamento do concorrente Vanguard em posts sobre sustentabilidade.',
        severity: 'low',
        createdAt: subDays(new Date(), 2).toISOString(),
        isRead: true,
      },
      {
        id: '3',
        type: 'engagement_spike',
        message:
          'Seu post sobre "Lançamento 2025" está com engajamento 40% acima da média.',
        severity: 'low',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ]

    setClients(mockClients)
    setMetrics(mockMetrics)
    setPosts(mockPosts)
    setAlerts(mockAlerts)
    setIsLoading(false)
  }, [])

  const fetchFromSupabase = useCallback(async () => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not found. Using mock data.')
      generateMockData()
      return
    }

    try {
      // In a real scenario, use supabase client here.
      // Since we are mocking for stability as per User Story:
      generateMockData()
    } catch (error) {
      console.error('Error fetching data:', error)
      generateMockData() // Fallback to mock data on error
    }
  }, [supabaseUrl, supabaseKey, generateMockData])

  const addClient = (
    client: Omit<Client, 'id' | 'status' | 'lastUpdated' | 'avatarUrl'>,
  ) => {
    const newClient: Client = {
      ...client,
      id: Math.random().toString(36).substr(2, 9),
      status: 'processing',
      lastUpdated: new Date().toISOString(),
      avatarUrl: `https://img.usecurling.com/i?q=${client.name}&shape=fill&color=gray`,
    }
    setClients((prev) => [...prev, newClient])
  }

  const removeClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('planin_settings', JSON.stringify(updated))
      return updated
    })
  }

  const markAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    )
  }

  const triggerGlobalScrape = async () => {
    if (isScraping) return
    setIsScraping(true)
    setScrapingStatus({ linkedin: 'loading', instagram: 'pending' })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setScrapingStatus((prev) => ({
      ...prev,
      linkedin: 'success',
      instagram: 'loading',
    }))
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setScrapingStatus((prev) => ({ ...prev, instagram: 'success' }))
    setIsScraping(false)

    // Simulate new data arriving
    const newAlert: Alert = {
      id: Date.now().toString(),
      type: 'competitor_move',
      message: 'Nova atividade detectada após scraping manual.',
      severity: 'low',
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    setAlerts((prev) => [newAlert, ...prev])
  }

  const testTelegramConnection = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }
  const testApifyConnection = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }
  const testClaudeConnection = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }
  const testSupabaseConnection = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }

  useEffect(() => {
    const savedSettings = localStorage.getItem('planin_settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
    fetchFromSupabase()
  }, [fetchFromSupabase])

  return React.createElement(
    AppContext.Provider,
    {
      value: {
        clients,
        posts,
        metrics,
        alerts,
        comments,
        settings,
        isLoading,
        isScraping,
        scrapingStatus,
        addClient,
        removeClient,
        updateClient,
        updateSettings,
        markAlertRead,
        triggerGlobalScrape,
        refreshData: fetchFromSupabase,
        testTelegramConnection,
        testApifyConnection,
        testClaudeConnection,
        testSupabaseConnection,
      },
    },
    children,
  )
}

export const useAppStore = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider')
  }
  return context
}

export default useAppStore
