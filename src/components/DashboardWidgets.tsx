/**
 * Componentes de widgets renderizáveis do dashboard
 */

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  TrendingUp,
  Users,
  MessageSquare,
  AlertCircle,
  Activity,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'
import { SentimentBadge } from '@/components/SentimentBadge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Client, Post, DailyMetric, Alert } from '@/types'

interface WidgetProps {
  clients: Client[]
  posts: Post[]
  metrics: DailyMetric[]
  alerts: Alert[]
}

export function KPISentimentWidget({ clients, metrics }: WidgetProps) {
  const ownClient = clients.find((c) => c.type === 'own')
  const ownMetrics = metrics.filter((m) => m.clientId === ownClient?.id)
  const avgSentiment =
    ownMetrics.reduce((acc, curr) => acc + curr.sentimentScore, 0) /
    (ownMetrics.length || 1)

  return (
    <Card className="h-full border-t-4 border-t-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Sentimento Médio
        </CardTitle>
        <TrendingUp className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-primary mt-2">
          {avgSentiment.toFixed(2)}
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <span className="text-green-600 font-medium flex items-center">
            <ArrowUpRight className="h-3 w-3" /> +12%
          </span>{' '}
          em relação ao mês anterior
        </p>
      </CardContent>
    </Card>
  )
}

export function KPIEngagementWidget({ clients, metrics }: WidgetProps) {
  const ownClient = clients.find((c) => c.type === 'own')
  const ownMetrics = metrics.filter((m) => m.clientId === ownClient?.id)
  const totalEngagement =
    ownMetrics.reduce((acc, curr) => acc + curr.engagementRate, 0) /
    (ownMetrics.length || 1)

  return (
    <Card className="h-full border-t-4 border-t-secondary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Taxa de Engajamento
        </CardTitle>
        <Activity className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-secondary mt-2">
          {(totalEngagement * 100).toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Média (Likes+Comentários/Views)
        </p>
      </CardContent>
    </Card>
  )
}

export function KPIPostsWidget({ clients, posts }: WidgetProps) {
  const ownClient = clients.find((c) => c.type === 'own')
  const totalPosts = posts.filter((p) => p.clientId === ownClient?.id).length

  return (
    <Card className="h-full border-t-4 border-t-accent">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Posts Coletados
        </CardTitle>
        <MessageSquare className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-gray-800 mt-2">
          {totalPosts}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Base de dados própria atualizada
        </p>
      </CardContent>
    </Card>
  )
}

export function KPICompetitorsWidget({ clients }: WidgetProps) {
  const ownClient = clients.find((c) => c.type === 'own')
  const activeCompetitors = clients.filter(
    (c) => c.type === 'competitor',
  ).length

  return (
    <Card className="h-full border-t-4 border-t-gray-400">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Concorrentes
        </CardTitle>
        <Users className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-gray-800 mt-2">
          {activeCompetitors}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Monitorados no setor {ownClient?.industry}
        </p>
      </CardContent>
    </Card>
  )
}

export function ChartSentimentTrendWidget({ clients, metrics }: WidgetProps) {
  const sentimentTrendData = Array.from({ length: 15 }).map((_, i) => {
    const date = new Date(Date.now() - (14 - i) * 86400000)
      .toISOString()
      .split('T')[0]
    const data: any = { date }
    clients.forEach((client) => {
      const dayMetric = metrics.find(
        (m) => m.clientId === client.id && m.date === date,
      )
      data[client.name] = dayMetric?.sentimentScore || 0
    })
    return data
  })

  const lineChartConfig = clients.reduce((acc, client, index) => {
    acc[client.name] = {
      label: client.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as any)

  const hasData = metrics.length > 0 && clients.length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tendências de Sentimento</CardTitle>
        <CardDescription>
          Evolução do score de sentimento (-1 a 1) nos últimos 15 dias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            config={lineChartConfig}
            className="min-h-[300px] w-full"
          >
            <LineChart
              data={sentimentTrendData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'short',
                  })
                }
              />
              <YAxis hide domain={[-1, 1]} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              {clients.map((client, index) => (
                <Line
                  key={client.id}
                  type="monotone"
                  dataKey={client.name}
                  stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
            <p className="text-sm">Sem dados disponíveis para exibir</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ChartShareOfVoiceWidget({ clients, posts }: WidgetProps) {
  const ownClient = clients.find((c) => c.type === 'own')
  const industryPosts = posts.filter((p) => {
    const client = clients.find((c) => c.id === p.clientId)
    return client?.industry === ownClient?.industry
  })

  const shareOfVoiceData = clients
    .filter((c) => c.industry === ownClient?.industry)
    .map((client) => ({
      name: client.name,
      value: industryPosts.filter((p) => p.clientId === client.id).length,
    }))
    .filter((item) => item.value > 0) // Filtrar apenas itens com valor > 0

  const pieChartConfig = clients.reduce((acc, client, index) => {
    acc[client.name] = {
      label: client.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as any)

  return (
    <Card className="col-span-1 h-full">
      <CardHeader>
        <CardTitle>Share of Voice (SoV)</CardTitle>
        <CardDescription>
          Presença de mercado baseada em volume de publicações no setor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={pieChartConfig}
          className="min-h-[250px] w-full"
        >
          <PieChart>
            <Pie
              data={shareOfVoiceData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              paddingAngle={2}
              strokeWidth={2}
              stroke="#fff"
            >
              {shareOfVoiceData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ListNegativePostsWidget({ clients, posts }: WidgetProps) {
  const negativePosts = posts
    .filter((p) => p.sentimentScore < -0.3)
    .sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    )
    .slice(0, 5)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Posts Críticos Recentes
        </CardTitle>
        <CardDescription>
          Monitoramento de posts com sentimento negativo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {negativePosts.length > 0 ? (
            negativePosts.map((post) => {
              const client = clients.find((c) => c.id === post.clientId)
              return (
                <div
                  key={post.id}
                  className="flex flex-col gap-2 p-4 border border-destructive/20 rounded-lg bg-red-50/50 hover:bg-red-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-gray-800">
                      {client?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 text-gray-600 italic">
                    "{post.content}"
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <SentimentBadge score={post.sentimentScore} />
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-destructive hover:text-destructive hover:bg-red-100"
                    >
                      <Link
                        to={`/feed?search=${encodeURIComponent(post.content.substring(0, 20))}`}
                      >
                        Ver Detalhes
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2 opacity-50" />
              <p>Nenhum post negativo detectado recentemente.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ListRecentAlertsWidget({ alerts }: WidgetProps) {
  const recentAlerts = alerts
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-accent" />
          Alertas Recentes
        </CardTitle>
        <CardDescription>Últimas notificações do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg transition-all ${
                  !alert.isRead
                    ? 'bg-white border-l-4 border-l-primary shadow-sm'
                    : 'bg-gray-50 border-gray-100 opacity-80'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      alert.type === 'sentiment_drop'
                        ? 'bg-red-100 text-red-700'
                        : alert.type === 'engagement_spike'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {alert.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {alert.message}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
              <p>Nenhum alerta recente.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Renderiza um widget baseado no tipo
 */
export function renderWidget(
  widgetId: string,
  props: WidgetProps,
): React.ReactNode {
  switch (widgetId) {
    case 'kpi-sentiment':
      return <KPISentimentWidget {...props} />
    case 'kpi-engagement':
      return <KPIEngagementWidget {...props} />
    case 'kpi-posts':
      return <KPIPostsWidget {...props} />
    case 'kpi-competitors':
      return <KPICompetitorsWidget {...props} />
    case 'chart-sentiment-trend':
      return <ChartSentimentTrendWidget {...props} />
    case 'chart-share-of-voice':
      return <ChartShareOfVoiceWidget {...props} />
    case 'list-negative-posts':
      return <ListNegativePostsWidget {...props} />
    case 'list-recent-alerts':
      return <ListRecentAlertsWidget {...props} />
    default:
      return null
  }
}
