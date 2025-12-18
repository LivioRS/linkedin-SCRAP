import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeatmapDataPoint } from '@/lib/mockData'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

interface SentimentHeatmapProps {
  heatmapData: HeatmapDataPoint[]
  clientNames: string[]
}

export function SentimentHeatmap({
  heatmapData,
  clientNames,
}: SentimentHeatmapProps) {
  const { dates, clientDataMap } = useMemo(() => {
    const dateSet = new Set<string>()
    const map = new Map<string, Map<string, HeatmapDataPoint>>()

    heatmapData.forEach((point) => {
      dateSet.add(point.date)
      if (!map.has(point.clientId)) {
        map.set(point.clientId, new Map())
      }
      map.get(point.clientId)!.set(point.date, point)
    })

    const dates = Array.from(dateSet).sort()
    return { dates, clientDataMap: map }
  }, [heatmapData])

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment > 0.3) return 'bg-green-500'
    if (sentiment > 0) return 'bg-green-300'
    if (sentiment > -0.3) return 'bg-yellow-300'
    return 'bg-red-500'
  }

  const getSentimentIntensity = (sentiment: number): string => {
    const abs = Math.abs(sentiment)
    if (abs > 0.7) return 'opacity-100'
    if (abs > 0.4) return 'opacity-80'
    return 'opacity-60'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Calor de Sentimento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 text-sm font-semibold text-muted-foreground">
                    Cliente
                  </th>
                  {dates.slice(-14).map((date) => (
                    <th
                      key={date}
                      className="text-center p-2 text-xs text-muted-foreground"
                    >
                      {format(new Date(date), 'dd/MM', { locale: ptBR })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientNames.map((clientName, clientIndex) => {
                  const clientId = (clientIndex + 1).toString()
                  const clientData = clientDataMap.get(clientId) || new Map()

                  return (
                    <tr key={clientId}>
                      <td className="p-2 text-sm font-medium">{clientName}</td>
                      {dates.slice(-14).map((date) => {
                        const point = clientData.get(date)
                        const sentiment = point?.sentiment || 0

                        return (
                          <td key={date} className="p-1">
                            <div
                              className={`w-8 h-8 rounded ${getSentimentColor(
                                sentiment,
                              )} ${getSentimentIntensity(sentiment)} flex items-center justify-center text-xs text-white font-medium`}
                              title={`${clientName} - ${format(
                                new Date(date),
                                'dd/MM/yyyy',
                                { locale: ptBR },
                              )}: ${sentiment.toFixed(2)}`}
                            >
                              {sentiment > 0 ? '+' : ''}
                              {sentiment.toFixed(1)}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Positivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
            <span>Neutro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Negativo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
