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
  updateClient: (id: string, data: Partial<Client>) => void
  removeClient: (id: string) => void
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
    name: 'Grupo Plaenge',
    url: 'https://linkedin.com/company/grupo-plaenge',
    type: 'own',
    industry: 'Construção Civil',
    status: 'success',
    lastUpdated: new Date().toISOString(),
    avatarUrl: 'https://img.usecurling.com/i?q=plaenge&color=green&shape=fill',
  },
  {
    id: '2',
    name: 'Vanguard',
    url: 'https://linkedin.com/company/vanguard-home',
    type: 'competitor',
    industry: 'Construção Civil',
    status: 'idle',
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    avatarUrl:
      'https://img.usecurling.com/i?q=vanguard&color=blue&shape=outline',
  },
  {
    id: '3',
    name: 'A.Yoshii Engenharia',
    url: 'https://linkedin.com/company/a-yoshii-engenharia',
    type: 'competitor',
    industry: 'Construção Civil',
    status: 'success',
    lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    avatarUrl:
      'https://img.usecurling.com/i?q=building&color=orange&shape=lineal-color',
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
  targetUrls: [],
}

const GENERATE_MOCK_METRICS = (clients: Client[]): DailyMetric[] => {
  const metrics: DailyMetric[] = []
  const days = 90 // Últimos 90 dias
  clients.forEach((client) => {
    for (let i = 0; i < days; i++) {
      metrics.push({
        date: new Date(Date.now() - (days - i) * 86400000)
          .toISOString()
          .split('T')[0],
        clientId: client.id,
        sentimentScore: Math.random() * 1.5 - 0.5,
        engagementRate: Math.random() * 0.08 + 0.01,
        postsCount: Math.floor(Math.random() * 3) + 1, // 1-3 posts por dia
      })
    }
  })
  return metrics
}

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'competitor_move',
    message: 'A.Yoshii lançou novo empreendimento de alto padrão em Londrina.',
    severity: 'medium',
    createdAt: new Date().toISOString(),
    isRead: false,
  },
]

const SAMPLE_POST_TEMPLATES = [
  'Lançamento incrível do novo decorado! Venha conhecer o futuro do seu lar. #Luxo #Conforto',
  'Orgulho de entregar mais uma obra antes do prazo. Compromisso com a qualidade.',
  'Nossa equipe de engenharia inova mais uma vez com tecnologias sustentáveis.',
  'O mercado imobiliário segue aquecido neste trimestre, ótima oportunidade para investir.',
  'Evento de inauguração foi um sucesso absoluto. Obrigado a todos os parceiros!',
  'Novo lançamento chegando! Fiquem atentos para grandes novidades este mês.',
  'Agradecemos a todos os clientes pelo feedback positivo. Continuamos trabalhando para melhorar.',
  'Evento exclusivo para parceiros acontecerá na próxima semana. Mais informações em breve.',
  'Nossa equipe está sempre inovando para trazer as melhores soluções ao mercado.',
  'Parceria estratégica anunciada hoje marca um novo capítulo na nossa história.',
  'Resultados do último trimestre superaram expectativas. Obrigado pela confiança!',
  'Workshop gratuito sobre tendências do mercado. Inscreva-se e participe!',
  'Sustentabilidade é prioridade. Conheça nossas iniciativas ambientais.',
]

const COMMENT_TEMPLATES = [
  'Excelente trabalho! Parabéns pela iniciativa.',
  'Muito interessante essa abordagem.',
  'Quando teremos mais detalhes sobre isso?',
  'Ótima notícia! Estou ansioso para saber mais.',
  'Parabéns pela transparência e compromisso.',
  'Isso é muito importante para o setor.',
  'Adorei a iniciativa! Continuem assim.',
  'Precisamos de mais informações sobre isso.',
]

const GENERATE_COMMENTS = (postId: string, count: number): Comment[] => {
  const comments: Comment[] = []
  const authorNames = [
    'João Silva',
    'Maria Santos',
    'Pedro Oliveira',
    'Ana Costa',
    'Carlos Ferreira',
    'Juliana Alves',
    'Roberto Lima',
    'Fernanda Souza',
  ]

  for (let i = 0; i < count; i++) {
    const commentDate = new Date(Date.now() - Math.random() * 30 * 86400000)
    comments.push({
      id: `${postId}-comment-${i}`,
      postId,
      author: authorNames[Math.floor(Math.random() * authorNames.length)],
      content:
        COMMENT_TEMPLATES[
          Math.floor(Math.random() * COMMENT_TEMPLATES.length)
        ],
      sentimentScore: Math.random() * 1.2 - 0.2, // Tendência positiva
      postedAt: commentDate.toISOString(),
    })
  }

  return comments
}

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

  // Função para gerar posts dos últimos 90 dias na inicialização
  const GENERATE_INITIAL_POSTS = (clients: Client[]): {
    posts: Post[]
    comments: Comment[]
  } => {
    const posts: Post[] = []
    const comments: Comment[] = []
    const days = 90

    clients.forEach((client) => {
      // Gerar 1-2 posts por dia em média, distribuídos ao longo dos 90 dias
      Array.from({ length: days }).forEach((_, dayIndex) => {
        const shouldHavePost = Math.random() > 0.3 // 70% de chance de ter post no dia
        if (!shouldHavePost) return

        const numPostsToday = Math.random() > 0.5 ? 1 : 2 // 1 ou 2 posts por dia
        
        Array.from({ length: numPostsToday }).forEach((_, postIndex) => {
          const postId = `${client.id}-post-init-${dayIndex}-${postIndex}`
          const dayOffset = days - dayIndex - 1
          const randomHour = Math.floor(Math.random() * 24)
          const randomMinute = Math.floor(Math.random() * 60)
          
          // Distribuir sentimento de forma mais realista ao longo do tempo
          const baseSentiment = Math.sin((dayIndex / days) * Math.PI * 2) * 0.3 + (Math.random() - 0.5) * 0.4
          const sentimentScore = Math.max(-1, Math.min(1, baseSentiment))
          
          const postComments = GENERATE_COMMENTS(
            postId,
            Math.floor(Math.random() * 8),
          )

          const postedAt = new Date(
            Date.now() - dayOffset * 86400000 - randomHour * 3600000 - randomMinute * 60000
          )

          const vehicles = ['InfoMoney', 'Folha de Curitiba', 'Money Times', 'Bing News', 'LinkedIn', 'Instagram', 'Facebook', 'Twitter']
          const regions = ['Corporativo', 'Regional', 'Nacional', 'Internacional']
          const categories = ['Operacional', 'Financeiro', 'Marketing', 'RH', 'Sustentabilidade', 'Inovação']
          
          const content = SAMPLE_POST_TEMPLATES[
            Math.floor(Math.random() * SAMPLE_POST_TEMPLATES.length)
          ]
          const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
          const region = regions[Math.floor(Math.random() * regions.length)]
          const category = categories[Math.floor(Math.random() * categories.length)]
          
          // Calcular urgência baseada no sentimento e engajamento
          const likes = Math.floor(Math.random() * 500) + 10
          let urgency: 'baixa' | 'media' | 'alta' = 'baixa'
          if (sentimentScore < -0.5 || likes > 1000) urgency = 'alta'
          else if (sentimentScore < -0.3 || likes > 500) urgency = 'media'

          // Gerar título baseado no conteúdo e cliente
          const title = `${client.name} ${content.substring(0, 40)}...`

          posts.push({
            id: postId,
            clientId: client.id,
            title,
            content,
            likes,
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
            postedAt: postedAt.toISOString(),
            url: '#',
            vehicle,
            region,
            category,
            urgency,
          })

          comments.push(...postComments)
        })
      })
    })

    return { posts, comments }
  }

  useEffect(() => {
    setMetrics(GENERATE_MOCK_METRICS(clients))
    // Gerar posts iniciais dos últimos 90 dias
    const { posts: initialPosts, comments: initialComments } = GENERATE_INITIAL_POSTS(clients)
    setPosts(initialPosts)
    setComments(initialComments)
  }, [])

  const addClient = (
    newClientData: Omit<Client, 'id' | 'status' | 'lastUpdated' | 'avatarUrl'>,
  ) => {
    const newClient: Client = {
      ...newClientData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'idle',
      lastUpdated: new Date().toISOString(),
      avatarUrl: `https://img.usecurling.com/i?q=${newClientData.name.split(' ')[0]}&shape=outline`,
    }
    setClients((prev) => [...prev, newClient])
    setMetrics((prev) => [...prev, ...GENERATE_MOCK_METRICS([newClient])])
    toast({
      title: 'Cliente Adicionado',
      description: `${newClient.name} foi adicionado ao monitoramento.`,
    })
  }

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, ...data } : client,
      ),
    )
    toast({
      title: 'Cliente Atualizado',
      description: 'As informações foram salvas com sucesso.',
    })
  }

  const removeClient = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id))
    setMetrics((prev) => prev.filter((m) => m.clientId !== id))
    toast({
      title: 'Cliente Removido',
      description: 'A empresa foi removida do monitoramento.',
    })
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
    // Don't toast for everything, sometimes it's internal update
    if (Object.keys(newSettings).length > 0) {
      toast({
        title: 'Configurações Salvas',
        description: 'As alterações foram aplicadas com sucesso.',
      })
    }
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
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
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

    const hasTargets = settings.targetUrls && settings.targetUrls.length > 0

    if (activePlatforms.length === 0 && !hasTargets) {
      toast({
        title: 'Nada para monitorar',
        description: 'Ative uma rede social ou adicione URLs alvo.',
        variant: 'destructive',
      })
      return
    }

    setIsScraping(true)
    setClients((prev) => prev.map((c) => ({ ...c, status: 'processing' })))
    toast({
      title: 'Iniciando Global Scrape',
      description: `Buscando dados para ${clients.length} empresas e ${settings.targetUrls.length} URLs alvo...`,
    })

    const initialStatus: ScrapingStatus = {}
    Object.keys(settings.platforms).forEach((p) => {
      initialStatus[p] = 'idle'
    })
    activePlatforms.forEach((p) => {
      initialStatus[p] = 'loading'
    })
    setScrapingStatus(initialStatus)

    for (const platform of activePlatforms) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1500 + Math.random() * 1000),
      )
      setScrapingStatus((prev) => ({ ...prev, [platform]: 'success' }))
    }

    // Generate new mock data
    const newPosts: Post[] = []
    const newAlerts: Alert[] = []

    clients.forEach((client) => {
      const numNewPosts = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < numNewPosts; i++) {
        const template =
          SAMPLE_POST_TEMPLATES[
            Math.floor(Math.random() * SAMPLE_POST_TEMPLATES.length)
          ]
        const sentiment = Math.random() * 1.6 - 0.6 // bias slightly positive
        const isNegative = sentiment < -0.3

        const vehicles = ['InfoMoney', 'Folha de Curitiba', 'Money Times', 'Bing News', 'LinkedIn', 'Instagram', 'Facebook', 'Twitter']
        const regions = ['Corporativo', 'Regional', 'Nacional', 'Internacional']
        const categories = ['Operacional', 'Financeiro', 'Marketing', 'RH', 'Sustentabilidade', 'Inovação']
        
        const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
        const region = regions[Math.floor(Math.random() * regions.length)]
        const category = categories[Math.floor(Math.random() * categories.length)]
        const likes = Math.floor(Math.random() * 500)
        
        let urgency: 'baixa' | 'media' | 'alta' = 'baixa'
        if (sentiment < -0.5 || likes > 1000) urgency = 'alta'
        else if (sentiment < -0.3 || likes > 500) urgency = 'media'

        const content = `${template} - ${client.name}`
        const title = `${client.name}: ${template.substring(0, 50)}...`

        newPosts.push({
          id: Math.random().toString(36).substr(2, 9),
          clientId: client.id,
          title,
          content,
          likes,
          comments: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 20),
          views: Math.floor(Math.random() * 5000),
          sentimentScore: sentiment,
          sentimentExplanation:
            'Análise simulada pela IA indicando tom ' +
            (sentiment > 0 ? 'positivo' : 'negativo') +
            '.',
          postedAt: new Date().toISOString(),
          url: 'https://linkedin.com',
          vehicle,
          region,
          category,
          urgency,
        })

        if (isNegative && client.type === 'own') {
          newAlerts.push({
            id: Math.random().toString(),
            type: 'sentiment_drop',
            message: `Post negativo detectado para ${client.name}: "${template.substring(0, 30)}..."`,
            severity: 'high',
            createdAt: new Date().toISOString(),
            isRead: false,
          })
        }
      }
    })

    // Simulate processing specific target URLs
    if (settings.targetUrls.length > 0) {
      settings.targetUrls.forEach((target) => {
        // 30% chance of finding something new on target URLs
        if (Math.random() > 0.7) {
          const client =
            clients.find((c) => c.type === 'own') || MOCK_CLIENTS[0]
          const vehicles = ['InfoMoney', 'Folha de Curitiba', 'Money Times', 'Bing News', 'LinkedIn', 'Instagram', 'Facebook', 'Twitter']
          const regions = ['Corporativo', 'Regional', 'Nacional', 'Internacional']
          const categories = ['Operacional', 'Financeiro', 'Marketing', 'RH', 'Sustentabilidade', 'Inovação']
          
          const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
          const region = regions[Math.floor(Math.random() * regions.length)]
          const category = categories[Math.floor(Math.random() * categories.length)]
          const content = `Conteúdo monitorado da URL: ${target.url}. Análise de impacto e reputação realizada.`
          const title = `${client.name}: Conteúdo monitorado da URL específica`

          newPosts.push({
            id: Math.random().toString(36).substr(2, 9),
            clientId: client.id,
            title,
            content,
            likes: Math.floor(Math.random() * 200),
            comments: Math.floor(Math.random() * 20),
            shares: Math.floor(Math.random() * 5),
            views: Math.floor(Math.random() * 1000),
            sentimentScore: 0.2,
            sentimentExplanation:
              'Monitoramento de URL específica detectou atividade relevante.',
            postedAt: new Date().toISOString(),
            url: target.url,
            vehicle,
            region,
            category,
            urgency: 'baixa',
          })
        }
      })
    }

    setTimeout(() => {
      setPosts((prev) => [...newPosts, ...prev])
      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev])
        toast({
          title: 'Alertas Gerados',
          description: `${newAlerts.length} novos alertas críticos detectados.`,
          variant: 'destructive',
        })
      }

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
          itemsCollected: newPosts.length,
          durationMs: activePlatforms.length * 1500,
        },
        ...prev,
      ])

      setIsScraping(false)
      toast({
        title: 'Ciclo Global Concluído',
        description: `Coleta finalizada. ${newPosts.length} novos items processados (incluindo URLs alvo).`,
      })
    }, 1000)
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
        updateClient,
        removeClient,
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
