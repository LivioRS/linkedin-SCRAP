import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ClientDashboardData } from '@/hooks/useDashboardData'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface ClientSentimentChartsProps {
  client: ClientDashboardData
}

export function ClientSentimentCharts({ client }: ClientSentimentChartsProps) {
  const lineChartConfig: ChartConfig = {
    sentiment: {
      label: 'Sentimento',
      color: 'hsl(var(--primary))',
    },
    volume: {
      label: 'Volume',
      color: 'hsl(var(--accent))',
    },
  }

  const distData = [
    {
      name: 'Positivo',
      value: client.distribution.positive,
      color: 'hsl(142, 70%, 45%)', // Green
    },
    {
      name: 'Neutro',
      value: client.distribution.neutral,
      color: 'hsl(210, 40%, 90%)', // Light Gray
    },
    {
      name: 'Negativo',
      value: client.distribution.negative,
      color: 'hsl(0, 84%, 60%)', // Red
    },
  ]

  const distConfig: ChartConfig = {
    value: { label: 'Posts', color: 'hsl(var(--primary))' },
  }

  const hasHistory = client.history && client.history.length > 0

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 border-b pb-4 mb-2">
        <Avatar className="h-14 w-14 border border-border shadow-sm">
          <AvatarImage src={client.avatarUrl} alt={client.name} />
          <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg">
            {client.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold text-foreground">{client.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={client.type === 'own' ? 'default' : 'secondary'}
              className="text-[10px] px-2 py-0.5"
            >
              {client.type === 'own' ? 'Sua Marca' : 'Concorrente'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {client.industry}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h4 className="text-sm font-semibold mb-4 text-muted-foreground">
            Evolução do Sentimento (14 dias)
          </h4>
          <div className="h-[200px] w-full">
            {hasHistory ? (
              <ChartContainer
                config={lineChartConfig}
                className="h-full w-full"
              >
                <LineChart
                  data={client.history}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                    tick={{ fontSize: 11, fill: '#888' }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 1]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#888' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sentiment"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="Score"
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded bg-gray-50">
                Dados históricos indisponíveis
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 text-muted-foreground">
            Distribuição Total
          </h4>
          <div className="h-[200px] w-full">
            <ChartContainer config={distConfig} className="h-full w-full">
              <BarChart
                data={distData}
                layout="vertical"
                margin={{ left: 0, right: 30 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#666' }}
                />
                <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                  label={{ position: 'right', fill: '#666', fontSize: 12 }}
                >
                  {distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
