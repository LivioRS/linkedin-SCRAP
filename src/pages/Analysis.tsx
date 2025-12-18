import { useState, useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'
import { Trophy, TrendingDown, Activity, Lightbulb, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'

export default function Analysis() {
  const { clients, metrics, posts } = useAppStore()

  const [primaryId, setPrimaryId] = useState<string>(
    clients.find((c) => c.type === 'own')?.id || '',
  )
  const [secondaryId, setSecondaryId] = useState<string>(
    clients.find((c) => c.type === 'competitor')?.id || '',
  )
  const [period, setPeriod] = useState('30')

  const primaryClient = clients.find((c) => c.id === primaryId)
  const secondaryClient = clients.find((c) => c.id === secondaryId)

  // Helpers to calc metrics
  const getMetricsForClient = (clientId: string | undefined, days: number) => {
    if (!clientId) return { sentiment: 0, engagement: 0, volume: 0, sov: 0 }

    const clientMetrics = metrics
      .filter((m) => m.clientId === clientId)
      .slice(0, days)
    const clientPosts = posts
      .filter((p) => p.clientId === clientId)
      .slice(0, days) // Approximate slice for mock

    const sentiment =
      clientMetrics.reduce((acc, c) => acc + c.sentimentScore, 0) /
      (clientMetrics.length || 1)
    const engagement =
      clientMetrics.reduce((acc, c) => acc + c.engagementRate, 0) /
      (clientMetrics.length || 1)

    // Share of voice within industry
    const client = clients.find((c) => c.id === clientId)
    const industryPosts = posts.filter((p) => {
      const c = clients.find((cl) => cl.id === p.clientId)
      return c?.industry === client?.industry
    })
    const sov = (clientPosts.length / (industryPosts.length || 1)) * 100

    return { sentiment, engagement, volume: clientPosts.length, sov }
  }

  const primaryData = getMetricsForClient(primaryId, parseInt(period))
  const secondaryData = getMetricsForClient(secondaryId, parseInt(period))

  // Dados temporais para comparação de tendências
  const trendData = useMemo(() => {
    const days = parseInt(period)
    return Array.from({ length: days }).map((_, i) => {
      const date = subDays(new Date(), days - i - 1)
      const dateStr = format(date, 'yyyy-MM-dd')
      
      const primaryMetric = metrics.find(
        (m) => m.clientId === primaryId && m.date === dateStr,
      )
      const secondaryMetric = metrics.find(
        (m) => m.clientId === secondaryId && m.date === dateStr,
      )

      return {
        date: format(date, 'dd/MM'),
        dateStr,
        primary: {
          sentiment: primaryMetric?.sentimentScore || 0,
          engagement: primaryMetric?.engagementRate || 0,
          posts: primaryMetric?.postsCount || 0,
        },
        secondary: {
          sentiment: secondaryMetric?.sentimentScore || 0,
          engagement: secondaryMetric?.engagementRate || 0,
          posts: secondaryMetric?.postsCount || 0,
        },
      }
    })
  }, [metrics, primaryId, secondaryId, period])

  // Calcular tendências (últimos 7 dias vs anteriores)
  const calculateTrend = (clientId: string, metric: 'sentiment' | 'engagement') => {
    const clientMetrics = metrics
      .filter((m) => m.clientId === clientId)
      .sort((a, b) => a.date.localeCompare(b.date))
    
    if (clientMetrics.length < 14) return 0

    const recent = clientMetrics.slice(-7)
    const previous = clientMetrics.slice(-14, -7)

    const recentAvg = recent.reduce(
      (acc, m) => acc + (metric === 'sentiment' ? m.sentimentScore : m.engagementRate),
      0,
    ) / recent.length

    const previousAvg = previous.reduce(
      (acc, m) => acc + (metric === 'sentiment' ? m.sentimentScore : m.engagementRate),
      0,
    ) / previous.length

    return ((recentAvg - previousAvg) / (previousAvg || 1)) * 100
  }

  const primarySentimentTrend = calculateTrend(primaryId, 'sentiment')
  const secondarySentimentTrend = calculateTrend(secondaryId, 'sentiment')
  const primaryEngagementTrend = calculateTrend(primaryId, 'engagement')
  const secondaryEngagementTrend = calculateTrend(secondaryId, 'engagement')

  // Gerar insights avançados
  const advancedInsights = useMemo(() => {
    const insights = []

    // Comparação de tendências
    if (Math.abs(primarySentimentTrend) > 5 || Math.abs(secondarySentimentTrend) > 5) {
      if (primarySentimentTrend > secondarySentimentTrend) {
        insights.push({
          type: 'positive',
          title: 'Tendência de Sentimento Favorável',
          message: `Sua marca está melhorando o sentimento ${Math.abs(primarySentimentTrend).toFixed(1)}% mais rápido que o concorrente nos últimos 7 dias.`,
          icon: TrendingUp,
        })
      } else {
        insights.push({
          type: 'warning',
          title: 'Concorrente em Aceleração',
          message: `O concorrente está melhorando o sentimento ${Math.abs(secondarySentimentTrend - primarySentimentTrend).toFixed(1)}% mais rápido. Considere revisar sua estratégia de comunicação.`,
          icon: TrendingDown,
        })
      }
    }

    // Análise de volume
    const primaryVolume = trendData.reduce((acc, d) => acc + d.primary.posts, 0)
    const secondaryVolume = trendData.reduce((acc, d) => acc + d.secondary.posts, 0)
    
    if (primaryVolume < secondaryVolume * 0.7) {
      insights.push({
        type: 'info',
        title: 'Oportunidade de Volume',
        message: `O concorrente publica ${((secondaryVolume / primaryVolume - 1) * 100).toFixed(0)}% mais conteúdo. Aumentar a frequência pode melhorar sua visibilidade.`,
        icon: Activity,
      })
    }

    // Análise de engajamento
    if (primaryData.engagement < secondaryData.engagement * 0.8) {
      insights.push({
        type: 'warning',
        title: 'Engajamento Abaixo da Média',
        message: `Seu engajamento está ${((1 - primaryData.engagement / secondaryData.engagement) * 100).toFixed(0)}% abaixo do concorrente. Analise o tipo de conteúdo que gera mais interação.`,
        icon: Activity,
      })
    } else if (primaryData.engagement > secondaryData.engagement * 1.2) {
      insights.push({
        type: 'positive',
        title: 'Liderança em Engajamento',
        message: `Você supera o concorrente em ${((primaryData.engagement / secondaryData.engagement - 1) * 100).toFixed(0)}% de engajamento. Continue com essa estratégia!`,
        icon: Trophy,
      })
    }

    return insights
  }, [
    primarySentimentTrend,
    secondarySentimentTrend,
    primaryData,
    secondaryData,
    trendData,
  ])

  const getWinnerClass = (val1: number, val2: number) =>
    val1 > val2
      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold'
      : ''

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (trend < -5) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600'
    if (trend < -5) return 'text-red-600'
    return 'text-gray-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Inteligência Competitiva
          </h2>
          <p className="text-muted-foreground">
            Compare métricas de performance e reputação.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Primário:</span>
            <Select value={primaryId} onValueChange={setPrimaryId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Comparar:</span>
            <Select value={secondaryId} onValueChange={setSecondaryId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {clients
                  .filter((c) => c.id !== primaryId)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Dias</SelectItem>
              <SelectItem value="30">30 Dias</SelectItem>
              <SelectItem value="90">90 Dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Comparativo Lado a Lado</CardTitle>
            <CardDescription>
              Análise direta entre {primaryClient?.name} e{' '}
              {secondaryClient?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Métrica</TableHead>
                  <TableHead className="text-center font-bold text-primary">
                    {primaryClient?.name}
                  </TableHead>
                  <TableHead className="text-center">
                    {secondaryClient?.name}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    Score de Sentimento (-1 a 1)
                    <div className="text-xs text-muted-foreground mt-1">
                      Tendência 7 dias
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(
                        primaryData.sentiment,
                        secondaryData.sentiment,
                      ),
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {primaryData.sentiment.toFixed(2)}
                      {getTrendIcon(primarySentimentTrend)}
                    </div>
                    <div className={cn('text-xs mt-1', getTrendColor(primarySentimentTrend))}>
                      {primarySentimentTrend > 0 ? '+' : ''}
                      {primarySentimentTrend.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(
                        secondaryData.sentiment,
                        primaryData.sentiment,
                      ),
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {secondaryData.sentiment.toFixed(2)}
                      {getTrendIcon(secondarySentimentTrend)}
                    </div>
                    <div className={cn('text-xs mt-1', getTrendColor(secondarySentimentTrend))}>
                      {secondarySentimentTrend > 0 ? '+' : ''}
                      {secondarySentimentTrend.toFixed(1)}%
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Taxa de Engajamento
                    <div className="text-xs text-muted-foreground mt-1">
                      Tendência 7 dias
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(
                        primaryData.engagement,
                        secondaryData.engagement,
                      ),
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {(primaryData.engagement * 100).toFixed(2)}%
                      {getTrendIcon(primaryEngagementTrend)}
                    </div>
                    <div className={cn('text-xs mt-1', getTrendColor(primaryEngagementTrend))}>
                      {primaryEngagementTrend > 0 ? '+' : ''}
                      {primaryEngagementTrend.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(
                        secondaryData.engagement,
                        primaryData.engagement,
                      ),
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {(secondaryData.engagement * 100).toFixed(2)}%
                      {getTrendIcon(secondaryEngagementTrend)}
                    </div>
                    <div className={cn('text-xs mt-1', getTrendColor(secondaryEngagementTrend))}>
                      {secondaryEngagementTrend > 0 ? '+' : ''}
                      {secondaryEngagementTrend.toFixed(1)}%
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Volume de Posts</TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(primaryData.volume, secondaryData.volume),
                    )}
                  >
                    {primaryData.volume}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(secondaryData.volume, primaryData.volume),
                    )}
                  >
                    {secondaryData.volume}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Share of Voice (Indústria)
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(primaryData.sov, secondaryData.sov),
                    )}
                  >
                    {primaryData.sov.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(secondaryData.sov, primaryData.sov),
                    )}
                  >
                    {secondaryData.sov.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Gráfico de Tendências Temporais */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Tendências</CardTitle>
              <CardDescription>
                Evolução do sentimento ao longo do período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  primary: {
                    label: primaryClient?.name || 'Primário',
                    color: 'hsl(var(--chart-1))',
                  },
                  secondary: {
                    label: secondaryClient?.name || 'Secundário',
                    color: 'hsl(var(--chart-2))',
                  },
                }}
                className="min-h-[300px] w-full"
              >
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis hide domain={[-1, 1]} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="primary.sentiment"
                    name={primaryClient?.name || 'Primário'}
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="secondary.sentiment"
                    name={secondaryClient?.name || 'Secundário'}
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Volume de Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Volume de Publicações</CardTitle>
              <CardDescription>
                Comparação do número de posts por período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  primary: {
                    label: primaryClient?.name || 'Primário',
                    color: 'hsl(var(--chart-1))',
                  },
                  secondary: {
                    label: secondaryClient?.name || 'Secundário',
                    color: 'hsl(var(--chart-2))',
                  },
                }}
                className="min-h-[250px] w-full"
              >
                <BarChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="primary.posts"
                    name={primaryClient?.name || 'Primário'}
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="secondary.posts"
                    name={secondaryClient?.name || 'Secundário'}
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Insights Avançados */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <Lightbulb className="h-5 w-5" />
                Insights Automáticos Avançados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {primaryData.sentiment < secondaryData.sentiment ? (
                <div className="text-sm p-3 bg-white dark:bg-card rounded shadow-sm border border-yellow-100">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                    Atenção à Reputação
                  </p>
                  <p>
                    Seu score de sentimento está inferior ao concorrente.
                    Analise os comentários negativos recentes para identificar
                    pontos de dor.
                  </p>
                </div>
              ) : (
                <div className="text-sm p-3 bg-white dark:bg-card rounded shadow-sm border border-yellow-100">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                    Liderança de Percepção
                  </p>
                  <p>
                    Sua marca mantém uma percepção mais positiva no mercado
                    atualmente. Continue engajando!
                  </p>
                </div>
              )}

              {primaryData.sov < secondaryData.sov && (
                <div className="text-sm p-3 bg-white dark:bg-card rounded shadow-sm border border-yellow-100">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                    Oportunidade de Alcance
                  </p>
                  <p>
                    O concorrente domina o Share of Voice. Considere aumentar a
                    frequência de postagens para recuperar visibilidade.
                  </p>
                </div>
              )}

              {/* Insights Avançados Gerados */}
              {advancedInsights.map((insight, idx) => {
                const Icon = insight.icon
                const bgColor =
                  insight.type === 'positive'
                    ? 'bg-green-50 border-green-200'
                    : insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                const textColor =
                  insight.type === 'positive'
                    ? 'text-green-800 dark:text-green-400'
                    : insight.type === 'warning'
                      ? 'text-yellow-800 dark:text-yellow-400'
                      : 'text-blue-800 dark:text-blue-400'

                return (
                  <div
                    key={idx}
                    className={cn(
                      'text-sm p-3 rounded shadow-sm border',
                      bgColor,
                    )}
                  >
                    <p className={cn('font-semibold mb-1 flex items-center gap-2', textColor)}>
                      <Icon className="h-4 w-4" />
                      {insight.title}
                    </p>
                    <p className="text-foreground">{insight.message}</p>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ranking da Indústria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clients
                  .filter((c) => c.industry === primaryClient?.industry)
                  .map((c) => ({
                    ...c,
                    eng: getMetricsForClient(c.id, 30).engagement,
                  }))
                  .sort((a, b) => b.eng - a.eng)
                  .map((c, idx) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'font-bold w-4 text-center',
                            idx === 0
                              ? 'text-yellow-500'
                              : 'text-muted-foreground',
                          )}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-medium text-sm">{c.name}</span>
                      </div>
                      <span className="font-bold text-sm">
                        {(c.eng * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
