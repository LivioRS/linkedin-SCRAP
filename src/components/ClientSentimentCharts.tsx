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
} from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface ClientSentimentChartsProps {
  client: ClientDashboardData
}

export function ClientSentimentCharts({ client }: ClientSentimentChartsProps) {
  const lineChartConfig = {
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
      color: 'hsl(142, 70%, 40%)',
    },
    {
      name: 'Neutro',
      value: client.distribution.neutral,
      color: 'hsl(220, 13%, 91%)',
    },
    {
      name: 'Negativo',
      value: client.distribution.negative,
      color: 'hsl(0, 84%, 60%)',
    },
  ]

  const distConfig = {
    value: { label: 'Posts', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <AvatarImage src={client.avatarUrl} alt={client.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {client.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold text-primary">{client.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {client.industry}
            </span>
            <Badge
              variant={client.type === 'own' ? 'default' : 'secondary'}
              className="text-[10px] px-1.5 h-5"
            >
              {client.type === 'own' ? 'Você' : 'Concorrente'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-planin border-none">
          <CardHeader>
            <CardTitle className="text-base">
              Evolução do Sentimento (14 dias)
            </CardTitle>
            <CardDescription>
              Tendência diária de reputação e volume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={lineChartConfig}
              className="h-[250px] w-full"
            >
              <LineChart
                data={client.history}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 1]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
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
                  dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Score Sentimento"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Volume de Posts"
                  opacity={0.5}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-planin border-none">
          <CardHeader>
            <CardTitle className="text-base">Distribuição</CardTitle>
            <CardDescription>Proporção de sentimento.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={distConfig} className="h-[250px] w-full">
              <BarChart data={distData} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                />
                <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                  label={{ position: 'right', fill: '#6B7280', fontSize: 12 }}
                >
                  {distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
