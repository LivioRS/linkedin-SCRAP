import React from 'react'
import { LineChart, Line, Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ClientSentimentData } from '@/lib/mockData'

interface SparklineCardsProps {
  clientsData: ClientSentimentData[]
}

export function SparklineCards({ clientsData }: SparklineCardsProps) {
  const getTrend = (data: ClientSentimentData['data']) => {
    if (data.length < 2) return { icon: Minus, color: 'text-gray-500', label: 'Estável' }
    const first = data[0]?.sentiment || 0
    const last = data[data.length - 1]?.sentiment || 0
    const diff = last - first

    if (diff > 0.1) {
      return { icon: TrendingUp, color: 'text-green-600', label: 'Crescendo' }
    }
    if (diff < -0.1) {
      return { icon: TrendingDown, color: 'text-red-600', label: 'Declinando' }
    }
    return { icon: Minus, color: 'text-gray-500', label: 'Estável' }
  }

  const getAverageSentiment = (data: ClientSentimentData['data']) => {
    if (data.length === 0) return 0
    const sum = data.reduce((acc, d) => acc + d.sentiment, 0)
    return sum / data.length
  }

  const getTotalVolume = (data: ClientSentimentData['data']) => {
    return data.reduce((acc, d) => acc + d.volume, 0)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clientsData.map((client) => {
        const trend = getTrend(client.data)
        const avgSentiment = getAverageSentiment(client.data)
        const totalVolume = getTotalVolume(client.data)
        const TrendIcon = trend.icon

        return (
          <Card key={client.clientId} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {client.clientName}
                </CardTitle>
                <TrendIcon className={`h-4 w-4 ${trend.color}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={client.data}>
                    <defs>
                      <linearGradient
                        id={`gradient-${client.clientId}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="sentiment"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill={`url(#gradient-${client.clientId})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Média</p>
                  <p className="font-semibold">
                    {avgSentiment > 0 ? '+' : ''}
                    {avgSentiment.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Volume</p>
                  <p className="font-semibold">{totalVolume}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Tendência</p>
                  <p className={`text-xs font-medium ${trend.color}`}>
                    {trend.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

