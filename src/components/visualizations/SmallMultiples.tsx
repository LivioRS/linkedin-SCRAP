import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientSentimentData } from '@/lib/mockData'

interface SmallMultiplesProps {
  clientsData: ClientSentimentData[]
}

export function SmallMultiples({ clientsData }: SmallMultiplesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Sentimento por Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientsData.map((client) => (
            <div key={client.clientId} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {client.clientName}
              </h3>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={client.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                      })
                    }
                  />
                  <YAxis
                    domain={[-1, 1]}
                    tick={{ fontSize: 10 }}
                    width={30}
                  />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('pt-BR')
                    }
                    formatter={(value: number) => [
                      value.toFixed(2),
                      'Sentimento',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

