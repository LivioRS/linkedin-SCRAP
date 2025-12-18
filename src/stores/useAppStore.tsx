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
  refreshData: () => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [metrics, setMetrics] = useState<DailyMetric[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

        // Random sentiment with some trends
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

    // Posts (For Share of Voice)
    const mockPosts: Post[] = []
    mockClients.forEach((client) => {
      // Generate random number of posts for SoV
      const postCount =
        client.type === 'own' ? 45 : Math.floor(Math.random() * 30) + 20

      for (let i = 0; i < postCount; i++) {
        mockPosts.push({
          id: `${client.id}-post-${i}`,
          clientId: client.id,
          content: `Post content for ${client.name} - ${i}`,
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10),
          views: Math.floor(Math.random() * 1000),
          sentimentScore: Math.random() * 2 - 1,
          sentimentExplanation: 'Generated mock post',
          postedAt: new Date().toISOString(),
          url: '#',
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

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      generateMockData()
    }, 800)
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
        refreshData: generateMockData,
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
