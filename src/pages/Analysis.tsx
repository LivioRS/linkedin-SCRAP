import { useState } from 'react'
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Lightbulb, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Analysis() {
  const { clients, metrics, posts } = useAppStore()

  const [period, setPeriod] = useState('30')

  // -- Charts Data Preparation --

  // 1. Share of Voice (Pie Chart)
  // Calculate total posts per client
  const shareOfVoiceData = clients
    .map((client) => {
      const clientPostsCount = posts.filter(
        (p) => p.clientId === client.id,
      ).length
      return {
        name: client.name,
        value: clientPostsCount,
      }
    })
    .filter((d) => d.value > 0)

  const pieChartConfig: ChartConfig = clients.reduce((acc, client, index) => {
    acc[client.name] = {
      label: client.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as ChartConfig)

  // 2. Sentiment Trends (Line Chart)
  // Get unique dates from metrics
  const dates = Array.from(new Set(metrics.map((m) => m.date))).sort()
  const trendData = dates
    .map((date) => {
      const entry: any = { date }
      clients.forEach((client) => {
        const metric = metrics.find(
          (m) => m.clientId === client.id && m.date === date,
        )
        entry[client.name] = metric ? metric.sentimentScore : 0
      })
      return entry
    })
    .slice(-parseInt(period))

  const trendChartConfig: ChartConfig = {
    ...pieChartConfig,
  }

  // 3. Engagement Comparison (Bar Chart)
  const engagementData = clients.map((client) => {
    const clientMetrics = metrics.filter((m) => m.clientId === client.id)
    const avgEngagement =
      clientMetrics.reduce((sum, m) => sum + m.engagementRate, 0) /
      (clientMetrics.length || 1)
    return {
      name: client.name,
      engagement: avgEngagement * 100, // Percentage
    }
  })

  const barChartConfig: ChartConfig = {
    engagement: {
      label: 'Taxa de Engajamento (%)',
      color: 'hsl(var(--primary))',
    },
    ...pieChartConfig,
  }

  // Insights Logic
  const ownClient = clients.find((c) => c.type === 'own')
  const competitors = clients.filter((c) => c.type === 'competitor')

  const ownEngagement =
    engagementData.find((d) => d.name === ownClient?.name)?.engagement || 0
  const avgCompEngagement =
    competitors.reduce((sum, c) => {
      return (
        sum + (engagementData.find((d) => d.name === c.name)?.engagement || 0)
      )
    }, 0) / (competitors.length || 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Análise Competitiva Avançada
          </h2>
          <p className="text-muted-foreground">
            Comparação detalhada de performance e reputação de mercado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Período:</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share of Voice */}
        <Card>
          <CardHeader>
            <CardTitle>Share of Voice</CardTitle>
            <CardDescription>
              Volume de menções e posts por marca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={pieChartConfig}
              className="min-h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={shareOfVoiceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  paddingAngle={5}
                >
                  {shareOfVoiceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend
                  content={<ChartLegendContent />}
                  className="-translate-y-2 flex-wrap gap-2"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Engagement Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Engajamento</CardTitle>
            <CardDescription>Média de engajamento no período</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={barChartConfig}
              className="min-h-[300px] w-full"
            >
              <BarChart
                data={engagementData}
                layout="vertical"
                margin={{ left: 0 }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  strokeDasharray="3 3"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  hide
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <XAxis type="number" unit="%" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="engagement" radius={[0, 4, 4, 0]} barSize={32}>
                  {engagementData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                    />
                  ))}
                </Bar>
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sentiment Trends - Full Width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução de Sentimento</CardTitle>
            <CardDescription>
              Tendência histórica do score de sentimento (-1 a 1)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={trendChartConfig}
              className="h-[350px] w-full"
            >
              <LineChart
                data={trendData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })
                  }
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis domain={[-1, 1]} />
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

      {/* AI Insights Block */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 dark:from-indigo-950/30 dark:to-purple-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
            <Lightbulb className="h-5 w-5" />
            Insights Competitivos (Claude AI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ownEngagement > avgCompEngagement ? (
            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
              <Activity className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">
                  Liderança em Engajamento
                </p>
                <p className="text-sm text-muted-foreground">
                  Sua marca tem {(ownEngagement - avgCompEngagement).toFixed(1)}
                  % mais engajamento que a média dos concorrentes.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
              <Activity className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">
                  Oportunidade de Melhoria
                </p>
                <p className="text-sm text-muted-foreground">
                  O engajamento está abaixo da média do setor. Considere
                  analisar os posts com melhor performance dos concorrentes.
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              "A análise de tendências mostra que{' '}
              <strong>
                {clients.find((c) => c.type === 'competitor')?.name}
              </strong>{' '}
              teve um pico de sentimento positivo na última semana,
              correlacionado com o lançamento de uma nova feature."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
