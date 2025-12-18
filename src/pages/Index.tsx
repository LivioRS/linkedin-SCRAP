import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'
import {
  TrendingUp,
  Users,
  MessageSquare,
  AlertCircle,
  TrendingDown,
} from 'lucide-react'
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
  ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { SentimentBadge } from '@/components/SentimentBadge'

export default function Index() {
  const { clients, posts, metrics } = useAppStore()

  // Calculate Global KPIs
  const ownClient = clients.find((c) => c.type === 'own')
  const ownMetrics = metrics.filter((m) => m.clientId === ownClient?.id)

  const avgSentiment =
    ownMetrics.reduce((acc, curr) => acc + curr.sentimentScore, 0) /
    (ownMetrics.length || 1)
  const totalEngagement =
    ownMetrics.reduce((acc, curr) => acc + curr.engagementRate, 0) /
    (ownMetrics.length || 1)
  const totalPosts = posts.filter((p) => p.clientId === ownClient?.id).length
  const activeCompetitors = clients.filter(
    (c) => c.type === 'competitor',
  ).length

  // Recent Negative Posts (Global)
  const negativePosts = posts
    .filter((p) => p.sentimentScore < -0.3)
    .sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    )
    .slice(0, 5)

  // Chart Data Preparation
  const shareOfVoiceData = clients.map((client) => ({
    name: client.name,
    value: posts.filter((p) => p.clientId === client.id).length,
  }))

  const sentimentTrendData = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000)
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

  // Chart Configs
  const pieChartConfig = clients.reduce((acc, client, index) => {
    acc[client.name] = {
      label: client.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as any)

  const lineChartConfig = clients.reduce((acc, client, index) => {
    acc[client.name] = {
      label: client.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as any)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sentimento Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSentiment.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Global (Últimos 30 dias)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Engajamento
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalEngagement * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Média por post</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Posts Coletados
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Concorrentes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompetitors}</div>
            <p className="text-xs text-muted-foreground">
              Monitorados em tempo real
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Share of Voice */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Share of Voice</CardTitle>
            <CardDescription>
              Participação de mercado baseada em volume de posts.
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

        {/* Sentiment Trends */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendências de Sentimento</CardTitle>
            <CardDescription>
              Comparativo de score de sentimento (30 dias).
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
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Negative Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Posts com Sentimento Negativo
            </CardTitle>
            <CardDescription>Atenção prioritária recomendada.</CardDescription>
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
                        <span className="text-sm font-semibold">
                          {client?.name}
                        </span>
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
                            Ver no Feed
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

        {/* AI Insights */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 dark:from-indigo-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <TrendingUp className="h-5 w-5" />
              Insights Automáticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white dark:bg-card rounded-lg shadow-sm border border-indigo-100/50">
              <p className="text-sm text-foreground">
                "O engajamento da <strong>{ownClient?.name}</strong> está{' '}
                <strong>2.5x maior</strong> que a média da indústria esta
                semana, impulsionado pelo post sobre Inovação."
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-card rounded-lg shadow-sm border border-indigo-100/50">
              <p className="text-sm text-foreground">
                "
                <strong>
                  {clients.find((c) => c.type === 'competitor')?.name}
                </strong>{' '}
                teve uma queda de sentimento de 15% após reclamações sobre
                suporte."
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-card rounded-lg shadow-sm border border-indigo-100/50">
              <p className="text-sm text-foreground">
                "Recomendação: Aumentar a frequência de postagens às
                terças-feiras, horário de pico de engajamento do seu público."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
