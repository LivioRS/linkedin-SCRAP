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
import { TrendingUp, Users, MessageSquare, AlertCircle, Activity } from 'lucide-react'
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sentimento Médio</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{avgSentiment.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">Sua marca (últimos 30 dias)</p>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {(totalEngagement * 100).toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground">Média (Likes+Comentários/Views)</p>
      </CardContent>
    </Card>
  )
}

export function KPIPostsWidget({ clients, posts }: WidgetProps) {
  const ownClient = clients.find((c) => c.type === 'own')
  const totalPosts = posts.filter((p) => p.clientId === ownClient?.id).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Posts Coletados</CardTitle>
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalPosts}</div>
        <p className="text-xs text-muted-foreground">Base de dados própria</p>
      </CardContent>
    </Card>
  )
}

export function KPICompetitorsWidget({ clients }: WidgetProps) {
  const ownClient = clients.find((c) => c.type === 'own')
  const activeCompetitors = clients.filter((c) => c.type === 'competitor').length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Concorrentes</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{activeCompetitors}</div>
        <p className="text-xs text-muted-foreground">
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

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Tendências de Sentimento</CardTitle>
        <CardDescription>
          Evolução do score de sentimento (-1 a 1) nos últimos 15 dias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={lineChartConfig}
          className="min-h-[300px] w-full"
        >
          <LineChart
            data={sentimentTrendData}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
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

  const pieChartConfig = clients.reduce((acc, client, index) => {
    acc[client.name] = {
      label: client.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as any)

  return (
    <Card className="col-span-1">
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
              innerRadius={60}
              strokeWidth={5}
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Posts Críticos Recentes
        </CardTitle>
        <CardDescription>Monitoramento de posts com sentimento negativo.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {negativePosts.length > 0 ? (
            negativePosts.map((post) => {
              const client = clients.find((c) => c.id === post.clientId)
              return (
                <div
                  key={post.id}
                  className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold">{client?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{post.content}</p>
                  <div className="flex justify-between items-center mt-1">
                    <SentimentBadge score={post.sentimentScore} />
                    <Button variant="ghost" size="sm" asChild>
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
            <div className="text-center py-8 text-muted-foreground">
              Nenhum post negativo detectado recentemente.
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
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
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
                className={`p-3 border rounded-md ${
                  !alert.isRead ? 'bg-card border-l-4 border-l-primary' : 'bg-muted/20'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold uppercase">
                    {alert.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{alert.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum alerta recente.
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

