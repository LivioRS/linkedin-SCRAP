import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import {
  Client,
  Post,
  Comment,
  Alert,
  DailyMetric,
  ScrapingLog,
  ApiConfig,
} from '@/types'
import { toast } from '@/hooks/use-toast'
import { getApiConfig } from './useAppStoreReal'
import { getPlatformMonitor, processPosts } from '@/services/platforms'
import { sendAlert } from '@/services/api/telegram'

interface AppState {
  clients: Client[]
  posts: Post[]
  comments: Comment[]
  alerts: Alert[]
  metrics: DailyMetric[]
  scrapingLogs: ScrapingLog[]
  settings: Settings
  isScraping: boolean
  addClient: (
    client: Omit<Client, 'id' | 'status' | 'lastUpdated' | 'avatarUrl'>,
  ) => void
  triggerGlobalScrape: () => void
  markAlertRead: (id: string) => void
  getMetricsByClient: (clientId: string) => DailyMetric[]
  getClientById: (id: string) => Client | undefined
  updateSettings: (newSettings: Partial<Settings>) => void
  testTelegramConnection: () => Promise<boolean>
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

const DEFAULT_SETTINGS: Settings = {
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
    alertOnSpike: false,
  },
  scraping: {
    frequency: 'daily',
    retentionDays: 90,
  },
}

const GENERATE_COMMENTS = (postId: string, count: number): Comment[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `comment-${postId}-${i}`,
    postId,
    author: `User ${Math.floor(Math.random() * 1000)}`,
    content:
      i % 2 === 0
        ? 'Ótima iniciativa! Parabéns pela inovação.'
        : 'Acho que poderiam melhorar o suporte neste aspecto.',
    sentimentScore: i % 2 === 0 ? 0.8 : -0.3,
    postedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }))
}

const GENERATE_MOCK_POSTS = (
  clientId: string,
): {
  posts: Post[]
  comments: Comment[]
} => {
  const posts: Post[] = []
  const comments: Comment[] = []

  Array.from({ length: 15 }).forEach((_, i) => {
    const postId = `${clientId}-post-${i}`
    const sentimentScore = i % 3 === 0 ? 0.8 : i % 3 === 1 ? -0.4 : 0.1
    const postComments = GENERATE_COMMENTS(
      postId,
      Math.floor(Math.random() * 8),
    )

    posts.push({
      id: postId,
      clientId,
      content:
        i % 2 === 0
          ? `Estamos expandindo nossas operações em IA para melhor atender o mercado! #Tech #Growth 🚀`
          : `Lamentamos a instabilidade recente. Nossa equipe técnica já resolveu o incidente. 🛠️`,
      likes: Math.floor(Math.random() * 500) + 10,
      comments: postComments.length,
      shares: Math.floor(Math.random() * 20),
      views: Math.floor(Math.random() * 5000) + 1000,
      sentimentScore,
      sentimentExplanation:
        sentimentScore > 0.5
          ? 'O conteúdo destaca crescimento e inovação, gerando reações positivas sobre o futuro da empresa.'
          : sentimentScore < -0.3
            ? 'O reconhecimento de falhas técnicas gerou frustração, embora a transparência tenha sido notada.'
            : 'Conteúdo informativo com recepção neutra pela audiência.',
      postedAt: new Date(Date.now() - i * 86400000).toISOString(),
      url: '#',
    })

    comments.push(...postComments)
  })

  return { posts, comments }
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
        engagementRate: Math.random() * 0.08 + 0.01,
        postsCount: Math.floor(Math.random() * 4),
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
]

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [metrics, setMetrics] = useState<DailyMetric[]>([])
  const [scrapingLogs, setScrapingLogs] = useState<ScrapingLog[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isScraping, setIsScraping] = useState(false)

  // Initialize data
  useEffect(() => {
    let allPosts: Post[] = []
    let allComments: Comment[] = []

    clients.forEach((c) => {
      const data = GENERATE_MOCK_POSTS(c.id)
      allPosts = [...allPosts, ...data.posts]
      allComments = [...allComments, ...data.comments]
    })

    setPosts(allPosts)
    setComments(allComments)
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
    const data = GENERATE_MOCK_POSTS(newClient.id)
    setPosts((prev) => [...prev, ...data.posts])
    setComments((prev) => [...prev, ...data.comments])
    setMetrics((prev) => [...prev, ...GENERATE_MOCK_METRICS([newClient])])

    toast({
      title: 'Cliente Adicionado',
      description: `${newClient.name} foi adicionado ao monitoramento.`,
    })
  }

<<<<<<< HEAD
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
    // In a real app, this would call Supabase to persist settings
    console.log('Settings persisted:', newSettings)
    toast({
      title: 'Configurações Salvas',
      description: 'As alterações foram aplicadas com sucesso.',
    })
  }

  const testTelegramConnection = async () => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.3 // 70% success rate mock
        if (success) {
          toast({
            title: 'Sucesso',
            description: 'Conexão com Telegram estabelecida.',
          })
        } else {
          toast({
            title: 'Erro',
            description: 'Falha ao conectar. Verifique o Token e Chat ID.',
            variant: 'destructive',
          })
        }
        resolve(success)
      }, 1000)
    })
  }

  const triggerGlobalScrape = () => {
=======
  const triggerGlobalScrape = async () => {
>>>>>>> 800f66c (feat: Conectar APIs reais e melhorar anÃ¡lise competitiva)
    setIsScraping(true)
    setClients((prev) => prev.map((c) => ({ ...c, status: 'processing' })))
    
    const apiConfig = getApiConfig()
    const startTime = Date.now()

    try {
      // Verificar se as APIs estão configuradas
      if (!apiConfig.apifyApiKey) {
        toast({
          title: 'API não configurada',
          description: 'Configure a API Key do Apify em Configurações.',
          variant: 'destructive',
        })
        setIsScraping(false)
        setClients((prev) => prev.map((c) => ({ ...c, status: 'error' })))
        return
      }

      toast({
        title: 'Iniciando Scraper (Apify)',
        description: 'Coletando dados das redes sociais...',
      })

      const allNewPosts: Post[] = []
      const allNewAlerts: Alert[] = []
      let totalItemsCollected = 0

      // Processar cada cliente
      for (const client of clients) {
        try {
          // Determinar plataforma do cliente
          const platform = client.platform || 'linkedin'
          const monitor = getPlatformMonitor(platform)

          // Configuração específica do cliente ou padrão
          const clientConfig = {
            apifyApiKey: apiConfig.apifyApiKey,
            apifyTaskId: apiConfig.apifyTaskId || client.platformConfig?.taskId,
            accessToken: client.platformConfig?.accessToken,
          }

          // Executar scraping
          const scrapeResult = await monitor.scrape(client, clientConfig)

          if (scrapeResult.success && scrapeResult.posts.length > 0) {
            totalItemsCollected += scrapeResult.posts.length

            // Processar posts com análise de sentimento (se Claude configurado)
            let processedPosts = scrapeResult.posts
            if (apiConfig.claudeApiKey) {
              toast({
                title: 'Análise de IA (Claude)',
                description: `Analisando ${scrapeResult.posts.length} posts de ${client.name}...`,
              })

              processedPosts = await processPosts(scrapeResult.posts, {
                claudeApiKey: apiConfig.claudeApiKey,
                claudeModel: apiConfig.claudeModel,
                telegramConfig: apiConfig.telegramBotToken && apiConfig.telegramChatId
                  ? {
                      botToken: apiConfig.telegramBotToken,
                      chatId: apiConfig.telegramChatId,
                    }
                  : undefined,
                alertThreshold: -0.3,
              })
            }

            allNewPosts.push(...processedPosts)

            // Verificar posts negativos e criar alertas
            const negativePosts = processedPosts.filter(
              (p) => p.sentimentScore < -0.3,
            )

            for (const post of negativePosts) {
              const alert: Alert = {
                id: Math.random().toString(),
                type: 'sentiment_drop',
                message: `Post com sentimento negativo detectado em ${client.name}: ${post.content.substring(0, 50)}...`,
                severity: post.sentimentScore < -0.6 ? 'high' : 'medium',
                createdAt: new Date().toISOString(),
                isRead: false,
              }
              allNewAlerts.push(alert)

              // Enviar para Telegram se configurado
              if (apiConfig.telegramBotToken && apiConfig.telegramChatId) {
                await sendAlert(
                  {
                    botToken: apiConfig.telegramBotToken,
                    chatId: apiConfig.telegramChatId,
                  },
                  {
                    type: 'sentiment_drop',
                    severity: alert.severity,
                    title: 'Queda de Sentimento Detectada',
                    message: alert.message,
                    clientName: client.name,
                    url: post.url,
                  },
                )
              }
            }

            // Alertas para movimentos de concorrentes
            if (client.type === 'competitor' && processedPosts.length > 0) {
              const alert: Alert = {
                id: Math.random().toString(),
                type: 'competitor_move',
                message: `${processedPosts.length} novo(s) post(s) detectado(s) em ${client.name}.`,
                severity: 'medium',
                createdAt: new Date().toISOString(),
                isRead: false,
              }
              allNewAlerts.push(alert)

              if (apiConfig.telegramBotToken && apiConfig.telegramChatId) {
                await sendAlert(
                  {
                    botToken: apiConfig.telegramBotToken,
                    chatId: apiConfig.telegramChatId,
                  },
                  {
                    type: 'competitor_move',
                    severity: 'medium',
                    title: 'Atividade de Concorrente',
                    message: alert.message,
                    clientName: client.name,
                  },
                )
              }
            }

            // Atualizar status do cliente
            setClients((prev) =>
              prev.map((c) =>
                c.id === client.id
                  ? {
                      ...c,
                      status: 'success',
                      lastUpdated: new Date().toISOString(),
                    }
                  : c,
              ),
            )
          } else if (!scrapeResult.success) {
            // Erro no scraping
            setClients((prev) =>
              prev.map((c) =>
                c.id === client.id
                  ? { ...c, status: 'error' }
                  : c,
              ),
            )
            toast({
              title: `Erro ao coletar ${client.name}`,
              description: scrapeResult.error || 'Erro desconhecido',
              variant: 'destructive',
            })
          }
        } catch (error) {
          console.error(`Erro ao processar cliente ${client.name}:`, error)
          setClients((prev) =>
            prev.map((c) =>
              c.id === client.id ? { ...c, status: 'error' } : c,
            ),
          )
        }
      }

      // Atualizar posts e alertas
      if (allNewPosts.length > 0) {
        setPosts((prev) => [...allNewPosts, ...prev])
      }

      if (allNewAlerts.length > 0) {
        setAlerts((prev) => [...allNewAlerts, ...prev])
      }

      // Atualizar métricas diárias
      const today = new Date().toISOString().split('T')[0]
      const newMetrics: DailyMetric[] = clients.map((client) => {
        const clientPosts = allNewPosts.filter((p) => p.clientId === client.id)
        const avgSentiment =
          clientPosts.length > 0
            ? clientPosts.reduce((acc, p) => acc + p.sentimentScore, 0) /
              clientPosts.length
            : 0
        const totalEngagement = clientPosts.reduce(
          (acc, p) => acc + (p.likes + p.comments + p.shares) / (p.views || 1),
          0,
        ) / (clientPosts.length || 1)

        return {
          date: today,
          clientId: client.id,
          sentimentScore: avgSentiment,
          engagementRate: totalEngagement,
          postsCount: clientPosts.length,
        }
      })

      setMetrics((prev) => {
        // Remover métricas duplicadas do dia atual e adicionar novas
        const filtered = prev.filter((m) => m.date !== today)
        return [...filtered, ...newMetrics]
      })

      // Registrar log de scraping
      const durationMs = Date.now() - startTime
      setScrapingLogs((prev) => [
        {
          id: Math.random().toString(),
          date: new Date().toISOString(),
          status: totalItemsCollected > 0 ? 'success' : 'failed',
          itemsCollected: totalItemsCollected,
          durationMs,
          platform: 'multiple',
        },
        ...prev,
      ])

      setIsScraping(false)
      toast({
        title: 'Ciclo Concluído',
        description: `${totalItemsCollected} itens coletados e analisados com sucesso.`,
      })
    } catch (error) {
      console.error('Erro no scraping global:', error)
      setIsScraping(false)
      setClients((prev) => prev.map((c) => ({ ...c, status: 'error' })))
      toast({
        title: 'Erro no Scraping',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
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
        comments,
        alerts,
        metrics,
        scrapingLogs,
        settings,
        isScraping,
        addClient,
        triggerGlobalScrape,
        markAlertRead,
        getMetricsByClient,
        getClientById,
        updateSettings,
        testTelegramConnection,
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
