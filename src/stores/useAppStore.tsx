import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { Client, Post, Alert, DailyMetric } from '@/types'
import { toast } from '@/hooks/use-toast'

interface AppState {
  clients: Client[]
  posts: Post[]
  alerts: Alert[]
  metrics: DailyMetric[]
  isScraping: boolean
  addClient: (
    client: Omit<Client, 'id' | 'status' | 'lastUpdated' | 'avatarUrl'>,
  ) => void
  triggerGlobalScrape: () => void
  markAlertRead: (id: string) => void
  getMetricsByClient: (clientId: string) => DailyMetric[]
  getClientById: (id: string) => Client | undefined
}

const AppContext = createContext<AppState | undefined>(undefined)

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'TechFlow Solutions',
    url: 'https://linkedin.com/company/techflow',
    type: 'own',
    industry: 'Technology',
    status: 'success',
    lastUpdated: new Date().toISOString(),
    avatarUrl: 'https://img.usecurling.com/i?q=tech&color=blue&shape=fill',
  },
  {
    id: '2',
    name: 'Innovate Corp',
    url: 'https://linkedin.com/company/innovate',
    type: 'competitor',
    industry: 'Technology',
    status: 'idle',
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    avatarUrl:
      'https://img.usecurling.com/i?q=innovation&color=red&shape=outline',
  },
  {
    id: '3',
    name: 'NextGen Systems',
    url: 'https://linkedin.com/company/nextgen',
    type: 'competitor',
    industry: 'Technology',
    status: 'success',
    lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    avatarUrl:
      'https://img.usecurling.com/i?q=systems&color=green&shape=lineal-color',
  },
]

const GENERATE_MOCK_POSTS = (clientId: string): Post[] => {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: `${clientId}-post-${i}`,
    clientId,
    content:
      i % 2 === 0
        ? `Temos o orgulho de anunciar nossa nova funcionalidade de IA! #Tech #Inovação 🚀`
        : `Infelizmente, estamos passando por uma instabilidade momentânea em nossos servidores. Pedimos desculpas. ⚠️`,
    likes: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 50) + 2,
    shares: Math.floor(Math.random() * 20),
    views: Math.floor(Math.random() * 5000) + 1000,
    sentimentScore: i % 2 === 0 ? 0.8 : -0.6,
    sentimentExplanation:
      i % 2 === 0
        ? 'O post destaca conquistas e inovação, gerando resposta positiva da audiência.'
        : 'O post admite falhas técnicas, resultando em frustração e preocupação dos usuários.',
    postedAt: new Date(Date.now() - i * 86400000).toISOString(),
    url: '#',
  }))
}

const GENERATE_MOCK_METRICS = (clients: Client[]): DailyMetric[] => {
  const metrics: DailyMetric[] = []
  const days = 30
  clients.forEach((client) => {
    for (let i = 0; i < days; i++) {
      metrics.push({
        date: new Date(Date.now() - (days - i) * 86400000)
          .toISOString()
          .split('T')[0],
        clientId: client.id,
        sentimentScore: Math.random() * 1.5 - 0.5, // range -0.5 to 1
        engagementRate: Math.random() * 0.1,
        postsCount: Math.floor(Math.random() * 3),
      })
    }
  })
  return metrics
}

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'sentiment_drop',
    message: 'Queda súbita de sentimento detectada para Innovate Corp (-20%).',
    severity: 'high',
    createdAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: '2',
    type: 'engagement_spike',
    message: 'Pico de engajamento detectado em TechFlow Solutions.',
    severity: 'medium',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
  },
]

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [posts, setPosts] = useState<Post[]>([])
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [metrics, setMetrics] = useState<DailyMetric[]>([])
  const [isScraping, setIsScraping] = useState(false)

  // Initialize data
  useEffect(() => {
    const allPosts = clients.flatMap((c) => GENERATE_MOCK_POSTS(c.id))
    setPosts(allPosts)
    setMetrics(GENERATE_MOCK_METRICS(clients))
  }, [])

  const addClient = (
    newClientData: Omit<Client, 'id' | 'status' | 'lastUpdated' | 'avatarUrl'>,
  ) => {
    const newClient: Client = {
      ...newClientData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'idle',
      lastUpdated: new Date().toISOString(),
      avatarUrl: `https://img.usecurling.com/i?q=${newClientData.industry}&shape=outline`,
    }
    setClients((prev) => [...prev, newClient])

    // Generate initial data for new client
    const newPosts = GENERATE_MOCK_POSTS(newClient.id)
    setPosts((prev) => [...prev, ...newPosts])

    // Generate metrics
    const newMetrics: DailyMetric[] = []
    for (let i = 0; i < 30; i++) {
      newMetrics.push({
        date: new Date(Date.now() - (30 - i) * 86400000)
          .toISOString()
          .split('T')[0],
        clientId: newClient.id,
        sentimentScore: Math.random() * 1.5 - 0.5,
        engagementRate: Math.random() * 0.1,
        postsCount: Math.floor(Math.random() * 3),
      })
    }
    setMetrics((prev) => [...prev, ...newMetrics])

    toast({
      title: 'Cliente Adicionado',
      description: `${newClient.name} foi adicionado ao monitoramento.`,
    })
  }

  const triggerGlobalScrape = () => {
    setIsScraping(true)
    setClients((prev) => prev.map((c) => ({ ...c, status: 'processing' })))

    setTimeout(() => {
      setIsScraping(false)
      setClients((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'success',
          lastUpdated: new Date().toISOString(),
        })),
      )

      // Add a new alert randomly
      const newAlert: Alert = {
        id: Math.random().toString(),
        type: 'competitor_move',
        message: 'Novo movimento estratégico detectado na Innovate Corp.',
        severity: 'medium',
        createdAt: new Date().toISOString(),
        isRead: false,
      }
      setAlerts((prev) => [newAlert, ...prev])

      toast({
        title: 'Atualização Concluída',
        description: 'Todos os dados foram sincronizados com sucesso.',
      })
    }, 3000)
  }

  const markAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    )
  }

  const getMetricsByClient = (clientId: string) => {
    return metrics.filter((m) => m.clientId === clientId)
  }

  const getClientById = (id: string) => clients.find((c) => c.id === id)

  return (
    <AppContext.Provider
      value={{
        clients,
        posts,
        alerts,
        metrics,
        isScraping,
        addClient,
        triggerGlobalScrape,
        markAlertRead,
        getMetricsByClient,
        getClientById,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider')
  }
  return context
}
