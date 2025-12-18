import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { Client, Post, DailyMetric, Alert } from '@/types'
import { subDays, format } from 'date-fns'

interface AppState {
  clients: Client[]
  posts: Post[]
  metrics: DailyMetric[]
  alerts: Alert[]
  isLoading: boolean
  isScraping: boolean
  scrapingStatus: Record<string, string>
  triggerGlobalScrape: () => Promise<void>
  refreshData: () => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [metrics, setMetrics] = useState<DailyMetric[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isScraping, setIsScraping] = useState(false)
  const [scrapingStatus, setScrapingStatus] = useState<Record<string, string>>(
    {},
  )

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const generateMockData = () => {
    // Clients
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
          'https://img.usecurling.com/i?q=plaenge&color=green&shape=fill',
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
          'https://img.usecurling.com/i?q=vanguard&color=blue&shape=outline',
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

    // Metrics (Last 15 days)
    const mockMetrics: DailyMetric[] = []
    const today = new Date()

    mockClients.forEach((client) => {
      for (let i = 0; i < 15; i++) {
        const date = subDays(today, 14 - i)
        const dateStr = format(date, 'yyyy-MM-dd')

        let baseSentiment = client.type === 'own' ? 0.6 : 0.4
        const randomVar = (Math.random() - 0.5) * 0.4
        const trend = Math.sin(i / 3) * 0.1

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

    // Posts
    const mockPosts: Post[] = []
    mockClients.forEach((client) => {
      const postCount =
        client.type === 'own' ? 45 : Math.floor(Math.random() * 30) + 20

      for (let i = 0; i < postCount; i++) {
        mockPosts.push({
          id: `${client.id}-post-${i}`,
          clientId: client.id,
          content: `Post content for ${client.name} - ${i}. Análise de reputação e impacto de marca no mercado.`,
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10),
          views: Math.floor(Math.random() * 1000),
          sentimentScore: Math.random() * 2 - 1,
          sentimentExplanation: 'Generated mock post',
          postedAt: subDays(
            new Date(),
            Math.floor(Math.random() * 30),
          ).toISOString(),
          url: '#',
          vehicle: Math.random() > 0.5 ? 'LinkedIn' : 'News',
        })
      }
    })

    // Alerts
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'sentiment_drop',
        message: 'Queda de sentimento detectada na última semana.',
        severity: 'medium',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: 'competitor_move',
        message: 'Novo pico de engajamento do concorrente Vanguard.',
        severity: 'low',
        createdAt: subDays(new Date(), 2).toISOString(),
        isRead: true,
      },
    ]

    setClients(mockClients)
    setMetrics(mockMetrics)
    setPosts(mockPosts)
    setAlerts(mockAlerts)
    setIsLoading(false)
  }

  const fetchFromSupabase = async () => {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not found. Using mock data.')
      generateMockData()
      return
    }

    try {
      const headers = {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      }

      // Parallel Fetch
      const [clientsRes, postsRes, metricsRes, alertsRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/clients?select=*`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/posts?select=*&order=posted_at.desc`, {
          headers,
        }),
        fetch(`${supabaseUrl}/rest/v1/daily_metrics?select=*&order=date.asc`, {
          headers,
        }),
        fetch(`${supabaseUrl}/rest/v1/alerts?select=*&order=created_at.desc`, {
          headers,
        }),
      ])

      if (!clientsRes.ok || !postsRes.ok || !metricsRes.ok || !alertsRes.ok) {
        throw new Error('Failed to fetch from Supabase')
      }

      const clientsData = await clientsRes.json()
      const postsData = await postsRes.json()
      const metricsData = await metricsRes.json()
      const alertsData = await alertsRes.json()

      // Map to Types
      setClients(
        clientsData.map((c: any) => ({
          id: c.id,
          name: c.name,
          url: c.url,
          type: c.type,
          industry: c.industry,
          status: c.status,
          lastUpdated: c.last_updated,
          avatarUrl: c.avatar_url,
        })),
      )

      setPosts(
        postsData.map((p: any) => ({
          id: p.id,
          clientId: p.client_id,
          content: p.content,
          likes: p.likes,
          comments: p.comments,
          shares: p.shares,
          views: p.views,
          sentimentScore: p.sentiment_score,
          sentimentExplanation: p.sentiment_explanation,
          postedAt: p.posted_at,
          url: p.url,
          vehicle: p.vehicle,
          category: p.category,
        })),
      )

      setMetrics(
        metricsData.map((m: any) => ({
          date: m.date,
          clientId: m.client_id,
          sentimentScore: m.sentiment_score,
          engagementRate: m.engagement_rate,
          postsCount: m.posts_count,
        })),
      )

      setAlerts(
        alertsData.map((a: any) => ({
          id: a.id,
          type: a.type,
          message: a.message,
          severity: a.severity,
          createdAt: a.created_at,
          isRead: a.is_read,
        })),
      )

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      generateMockData() // Fallback
    }
  }

  const triggerGlobalScrape = async () => {
    setIsScraping(true)
    setScrapingStatus({
      linkedin: 'loading',
      instagram: 'pending',
    })

    // Simulate scraping process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setScrapingStatus((prev) => ({ ...prev, linkedin: 'success' }))
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setScrapingStatus((prev) => ({ ...prev, instagram: 'success' }))

    setIsScraping(false)
    fetchFromSupabase()
  }

  useEffect(() => {
    fetchFromSupabase()
  }, [])

  return React.createElement(
    AppContext.Provider,
    {
      value: {
        clients,
        posts,
        metrics,
        alerts,
        isLoading,
        isScraping,
        scrapingStatus,
        triggerGlobalScrape,
        refreshData: fetchFromSupabase,
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
