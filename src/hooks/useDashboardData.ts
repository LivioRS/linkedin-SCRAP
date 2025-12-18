import { useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import { ClientSentimentData, HeatmapDataPoint } from '@/lib/mockData'

export function useDashboardData() {
  const { clients, posts, metrics, isScraping } = useAppStore()
  
  const isLoading = isScraping

  const clientsData: ClientSentimentData[] = useMemo(() => {
    return clients.map((client) => {
      const clientMetrics = metrics.filter((m) => m.clientId === client.id)
      const clientPosts = posts.filter((p) => p.clientId === client.id)

      // Agrupar por data
      const dataByDate = new Map<string, { sentiment: number; volume: number }>()

      clientMetrics.forEach((metric) => {
        const existing = dataByDate.get(metric.date) || { sentiment: 0, volume: 0 }
        dataByDate.set(metric.date, {
          sentiment: existing.sentiment + metric.sentimentScore,
          volume: existing.volume + metric.postsCount,
        })
      })

      // Converter para array ordenado
      const data = Array.from(dataByDate.entries())
        .map(([date, values]) => ({
          date,
          sentiment: values.sentiment / (clientMetrics.filter((m) => m.date === date).length || 1),
          volume: values.volume,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      return {
        clientId: client.id,
        clientName: client.name,
        data: data.length > 0 ? data : [
          {
            date: new Date().toISOString().split('T')[0],
            sentiment: 0,
            volume: 0,
          },
        ],
      }
    })
  }, [clients, metrics, posts])

  const heatmapData: HeatmapDataPoint[] = useMemo(() => {
    const data: HeatmapDataPoint[] = []
    const dateSet = new Set<string>()

    // Coletar todas as datas
    metrics.forEach((m) => dateSet.add(m.date))
    posts.forEach((p) => {
      const date = new Date(p.postedAt).toISOString().split('T')[0]
      dateSet.add(date)
    })

    const dates = Array.from(dateSet).sort()

    dates.forEach((date) => {
      clients.forEach((client) => {
        const dayMetrics = metrics.filter(
          (m) => m.clientId === client.id && m.date === date,
        )
        const dayPosts = posts.filter((p) => {
          const postDate = new Date(p.postedAt).toISOString().split('T')[0]
          return p.clientId === client.id && postDate === date
        })

        const avgSentiment =
          dayMetrics.length > 0
            ? dayMetrics.reduce((acc, m) => acc + m.sentimentScore, 0) /
              dayMetrics.length
            : dayPosts.length > 0
              ? dayPosts.reduce((acc, p) => acc + p.sentimentScore, 0) /
                dayPosts.length
              : 0

        data.push({
          date,
          clientId: client.id,
          sentiment: avgSentiment,
          volume: dayPosts.length + dayMetrics.reduce((acc, m) => acc + m.postsCount, 0),
        })
      })
    })

    return data
  }, [clients, metrics, posts])

  const clientNames = useMemo(() => {
    return clients.map((c) => c.name)
  }, [clients])

  return {
    clientsData,
    heatmapData,
    clientNames,
    isLoading,
  }
}

