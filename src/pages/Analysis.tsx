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
} from 'recharts'
import { Lightbulb, Activity, TrendingUp } from 'lucide-react'

export default function Analysis() {
  const { clients, metrics, posts } = useAppStore()
  const [period, setPeriod] = useState('30')

  const shareOfVoiceData = clients
    .map((client) => ({
      name: client.name,
      value: posts.filter((p) => p.clientId === client.id).length,
    }))
    .filter((d) => d.value > 0)

  const pieChartConfig: ChartConfig = clients.reduce((acc, client, index) => {
    acc[client.name] = {
      label: client.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as ChartConfig)

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

  const trendChartConfig: ChartConfig = { ...pieChartConfig }

  const engagementData = clients.map((client) => {
    const clientMetrics = metrics.filter((m) => m.clientId === client.id)
    const avgEngagement =
      clientMetrics.reduce((sum, m) => sum + m.engagementRate, 0) /
      (clientMetrics.length || 1)
    return { name: client.name, engagement: avgEngagement * 100 }
  })

  const barChartConfig: ChartConfig = {
    engagement: {
      label: 'Taxa de Engajamento (%)',
      color: 'hsl(var(--primary))',
    },
    ...pieChartConfig,
  }

  const ownClient = clients.find((c) => c.type === 'own')
  const competitors = clients.filter((c) => c.type === 'competitor')
  const ownEngagement =
    engagementData.find((d) => d.name === ownClient?.name)?.engagement || 0
  const avgCompEngagement =
    competitors.reduce(
      (sum, c) =>
        sum + (engagementData.find((d) => d.name === c.name)?.engagement || 0),
      0,
    ) / (competitors.length || 1)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-planin">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Análise Competitiva
          </h2>
          <p className="text-muted-foreground">
            Comparação detalhada de performance e reputação de mercado.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
          <span className="text-sm font-medium px-2 text-gray-600">
            Período:
          </span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] border-0 bg-white shadow-sm h-8">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 Dias</SelectItem>
              <SelectItem value="30">Últimos 30 Dias</SelectItem>
              <SelectItem value="90">Últimos 90 Dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
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
                  stroke="#fff"
                  strokeWidth={2}
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
        <Card className="h-full">
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
                  stroke="#e5e7eb"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  hide
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <XAxis
                  type="number"
                  unit="%"
                  tickLine={false}
                  axisLine={false}
                />
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
              className="h-[400px] w-full"
            >
              <LineChart
                data={trendData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
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
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis
                  domain={[-1, 1]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6B7280' }}
                />
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
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/10 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lightbulb className="h-5 w-5 text-accent" /> Insights Competitivos
            (Claude AI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ownEngagement > avgCompEngagement ? (
            <div className="flex items-start gap-4 p-4 bg-white/80 rounded-xl shadow-sm border border-white/50">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  Liderança em Engajamento
                </p>
                <p className="text-gray-600 mt-1">
                  Sua marca tem{' '}
                  <span className="text-green-700 font-bold">
                    {(ownEngagement - avgCompEngagement).toFixed(1)}%
                  </span>{' '}
                  mais engajamento que a média dos concorrentes. Continue com a
                  estratégia de conteúdo atual.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 p-4 bg-white/80 rounded-xl shadow-sm border border-white/50">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  Oportunidade de Melhoria
                </p>
                <p className="text-gray-600 mt-1">
                  O engajamento está abaixo da média do setor. Considere
                  analisar os posts com melhor performance dos concorrentes para
                  identificar temas de interesse.
                </p>
              </div>
            </div>
          )}
          <div className="p-4 bg-white/80 rounded-xl shadow-sm border border-white/50">
            <p className="text-gray-600 leading-relaxed">
              "A análise de tendências mostra que{' '}
              <strong className="text-primary">
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
