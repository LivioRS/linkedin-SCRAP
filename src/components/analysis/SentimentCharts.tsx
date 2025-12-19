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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

interface SentimentChartsProps {
  trendData: any[]
  distributionData: any[]
  topicData: any[]
}

export function SentimentCharts({
  trendData,
  distributionData,
  topicData,
}: SentimentChartsProps) {
  const trendConfig: ChartConfig = {
    sentiment: {
      label: 'Sentimento',
      color: 'hsl(var(--primary))',
    },
    volume: {
      label: 'Volume',
      color: 'hsl(var(--accent))',
    },
  }

  const distributionConfig: ChartConfig = {
    positive: {
      label: 'Positivo',
      color: 'hsl(142, 70%, 45%)',
    },
    neutral: {
      label: 'Neutro',
      color: 'hsl(210, 40%, 90%)',
    },
    negative: {
      label: 'Negativo',
      color: 'hsl(0, 84%, 60%)',
    },
  }

  const topicConfig: ChartConfig = {
    count: {
      label: 'Menções',
      color: 'hsl(var(--secondary))',
    },
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full lg:col-span-2 shadow-sm border-none bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Tendência de Sentimento
          </CardTitle>
          <CardDescription>
            Evolução histórica do score e volume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer config={trendConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })
                    }
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[-1, 1]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sentiment"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="Sentimento"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Volume"
                    opacity={0.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Distribuição
          </CardTitle>
          <CardDescription>Share de sentimento total.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={distributionConfig}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    paddingAngle={5}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend
                    content={<ChartLegendContent />}
                    className="-translate-y-2 flex-wrap gap-2"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full shadow-sm border-none bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Tópicos & Palavras-chave
          </CardTitle>
          <CardDescription>
            Assuntos mais frequentes associados à marca.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ChartContainer config={topicConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topicData}
                  layout="vertical"
                  margin={{ left: 0, right: 20 }}
                >
                  <CartesianGrid horizontal={false} stroke="#f0f0f0" />
                  <YAxis
                    dataKey="topic"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={120}
                    tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="line" />}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    {topicData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(var(--chart-${(index % 4) + 1}))`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
