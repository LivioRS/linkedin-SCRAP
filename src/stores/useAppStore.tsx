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
  Settings,
} from '@/types'
import { toast } from '@/hooks/use-toast'
import { validateApifyKey } from '@/services/api/apify'
import { validateClaudeKey } from '@/services/api/claude'
import { validateTelegramConfig } from '@/services/api/telegram'

interface ScrapingStatus {
  [platform: string]: 'idle' | 'loading' | 'success' | 'error'
}

interface AppState {
  clients: Client[]
  posts: Post[]
  comments: Comment[]
  alerts: Alert[]
  metrics: DailyMetric[]
  scrapingLogs: ScrapingLog[]
  settings: Settings
  isScraping: boolean
  scrapingStatus: ScrapingStatus
  addClient: (
    client: Omit<Client, 'id' | 'status' | 'lastUpdated' | 'avatarUrl'>,
  ) => void
  triggerGlobalScrape: () => Promise<void>
  markAlertRead: (id: string) => void
  getMetricsByClient: (clientId: string) => DailyMetric[]
  getClientById: (id: string) => Client | undefined
  updateSettings: (newSettings: Partial<Settings>) => void
  testTelegramConnection: () => Promise<boolean>
  testApifyConnection: () => Promise<boolean>
  testClaudeConnection: () => Promise<boolean>
  testSupabaseConnection: () => Promise<boolean>
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
  scraping: { frequency: 'daily', retentionDays: 90 },
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
        sentimentScore: Math.random() * 1.5 - 0.5,
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
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({
    linkedin: 'idle',
    instagram: 'idle',
    facebook: 'idle',
    twitter: 'idle',
    youtube: 'idle',
  })

  useEffect(() => {
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
    setMetrics((prev) => [...prev, ...GENERATE_MOCK_METRICS([newClient])])
    toast({
      title: 'Cliente Adicionado',
      description: `${newClient.name} foi adicionado ao monitoramento.`,
    })
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
    toast({
      title: 'Configurações Salvas',
      description: 'As alterações foram aplicadas com sucesso.',
    })
  }

  const testTelegramConnection = async () => {
    if (
      !settings.apiKeys.telegramBot ||
      !settings.notifications.telegramChatId
    ) {
      toast({
        title: 'Configuração Incompleta',
        description: 'Preencha o Token do Bot e o Chat ID.',
        variant: 'destructive',
      })
      return false
    }
    const result = await validateTelegramConfig({
      botToken: settings.apiKeys.telegramBot,
      chatId: settings.notifications.telegramChatId,
    })
    if (result.valid) {
      toast({
        title: 'Sucesso',
        description: 'Conexão com Telegram estabelecida.',
      })
      return true
    } else {
      toast({
        title: 'Erro na Conexão',
        description: result.error || 'Falha ao conectar ao Telegram.',
        variant: 'destructive',
      })
      return false
    }
  }

  const testApifyConnection = async () => {
    if (!settings.apiKeys.apify) {
      toast({
        title: 'API Key Ausente',
        description: 'Por favor, insira um token do Apify.',
        variant: 'destructive',
      })
      return false
    }
    const isValid = await validateApifyKey(settings.apiKeys.apify)
    if (isValid)
      toast({
        title: 'Conectado ao Apify',
        description: 'Token validado com sucesso.',
      })
    else
      toast({
        title: 'Erro de Autenticação',
        description: 'Token do Apify inválido.',
        variant: 'destructive',
      })
    return isValid
  }

  const testClaudeConnection = async () => {
    if (!settings.apiKeys.anthropic) {
      toast({
        title: 'API Key Ausente',
        description: 'Por favor, insira uma chave da API Anthropic.',
        variant: 'destructive',
      })
      return false
    }
    const isValid = await validateClaudeKey(settings.apiKeys.anthropic)
    if (isValid)
      toast({
        title: 'Conectado ao Claude',
        description: 'Chave API validada com sucesso.',
      })
    else
      toast({
        title: 'Erro de Autenticação',
        description: 'Chave API do Claude inválida.',
        variant: 'destructive',
      })
    return isValid
  }

  const testSupabaseConnection = async () => {
    if (!settings.apiKeys.supabaseUrl || !settings.apiKeys.supabaseKey) {
      toast({
        title: 'Configuração Incompleta',
        description: 'Preencha a URL e a Chave do Supabase.',
        variant: 'destructive',
      })
      return false
    }
    // Simulate Supabase connection test
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Basic validation for URL format
      new URL(settings.apiKeys.supabaseUrl)
      if (settings.apiKeys.supabaseKey.length < 10) {
        throw new Error('Chave muito curta')
      }
      toast({
        title: 'Conectado ao Supabase',
        description: 'Credenciais validadas com sucesso.',
      })
      return true
    } catch (error) {
      toast({
        title: 'Erro na Conexão',
        description: 'URL inválida ou credenciais incorretas.',
        variant: 'destructive',
      })
      return false
    }
  }

  const triggerGlobalScrape = async () => {
    const activePlatforms = Object.entries(settings.platforms)
      .filter(([, isEnabled]) => isEnabled)
      .map(([platform]) => platform)

    if (activePlatforms.length === 0) {
      toast({
        title: 'Nenhuma plataforma ativa',
        description: 'Ative pelo menos uma rede social nas configurações.',
        variant: 'destructive',
      })
      return
    }

    setIsScraping(true)
    setClients((prev) => prev.map((c) => ({ ...c, status: 'processing' })))
    toast({
      title: 'Iniciando Global Scrape',
      description: `Coletando dados de: ${activePlatforms.join(', ')}...`,
    })

    const initialStatus: ScrapingStatus = {}
    // Reset statuses
    Object.keys(settings.platforms).forEach((p) => {
      initialStatus[p] = 'idle'
    })
    // Set active ones to loading
    activePlatforms.forEach((p) => {
      initialStatus[p] = 'loading'
    })
    setScrapingStatus(initialStatus)

    // Simulate async scraping for each platform
    for (const platform of activePlatforms) {
      // Simulate delay random between 1.5s and 3s
      await new Promise((resolve) =>
        setTimeout(resolve, 1500 + Math.random() * 1500),
      )
      setScrapingStatus((prev) => ({ ...prev, [platform]: 'success' }))
    }

    setTimeout(() => {
      toast({
        title: 'Análise de IA (Claude)',
        description: 'Processando sentimento e contexto...',
      })
      setClients((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'success',
          lastUpdated: new Date().toISOString(),
        })),
      )
      setScrapingLogs((prev) => [
        {
          id: Math.random().toString(),
          date: new Date().toISOString(),
          status: 'success',
          itemsCollected: Math.floor(Math.random() * 150) + 20,
          durationMs: activePlatforms.length * 2000 + 2000,
        },
        ...prev,
      ])
      setIsScraping(false)
      toast({
        title: 'Ciclo Global Concluído',
        description: 'Todos os dados foram sincronizados.',
      })
    }, 1500)
  }

  const markAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    )
  }

  const getMetricsByClient = (clientId: string) =>
    metrics.filter((m) => m.clientId === clientId)
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
        scrapingStatus,
        addClient,
        triggerGlobalScrape,
        markAlertRead,
        getMetricsByClient,
        getClientById,
        updateSettings,
        testTelegramConnection,
        testApifyConnection,
        testClaudeConnection,
        testSupabaseConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useAppStore must be used within an AppProvider')
  return context
}
