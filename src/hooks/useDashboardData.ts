import { useState, useEffect } from 'react'
import { MetricCardData, HeatMapCell, ClientDashboardData } from '@/types'
import useAppStore from '@/stores/useAppStore'
import { getDay, getHours, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useDashboardData() {
  const { clients, metrics: dailyMetrics, posts, isLoading } = useAppStore()
  const [metrics, setMetrics] = useState<MetricCardData[]>([])
  const [heatMapData, setHeatMapData] = useState<HeatMapCell[]>([])
  const [clientsData, setClientsData] = useState<ClientDashboardData[]>([])

  useEffect(() => {
    if (isLoading) return

    // Validate data availability
    if (!clients || !dailyMetrics || !posts) {
      return
    }

    const ownClient = clients.find((c) => c.type === 'own')
    if (!ownClient) {
      // Fallback or empty state if no own client is defined
      setMetrics([])
      setHeatMapData([])
      setClientsData([])
      return
    }

    // 1. Calculate Metrics Cards
    const ownMetrics = dailyMetrics
      .filter((m) => m.clientId === ownClient.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Safe accessors for metrics
    const currentSentiment =
      ownMetrics.length > 0
        ? ownMetrics[ownMetrics.length - 1]?.sentimentScore
        : 0
    const prevSentiment =
      ownMetrics.length > 1
        ? ownMetrics[ownMetrics.length - 2]?.sentimentScore
        : 0

    // Prevent division by zero or invalid calculations
    const sentimentTrend =
      prevSentiment !== 0
        ? ((currentSentiment - prevSentiment) / Math.abs(prevSentiment)) * 100
        : 0

    // Mentions (Total Posts)
    const ownPosts = posts.filter((p) => p.clientId === ownClient.id)
    const currentMentions = ownPosts.length

    // Engagement
    const currentEngagement =
      ownMetrics.length > 0
        ? ownMetrics[ownMetrics.length - 1]?.engagementRate
        : 0
    const prevEngagement =
      ownMetrics.length > 1
        ? ownMetrics[ownMetrics.length - 2]?.engagementRate
        : 0
    const engagementTrend =
      prevEngagement !== 0
        ? ((currentEngagement - prevEngagement) / prevEngagement) * 100
        : 0

    // Potential Reach (Views)
    const totalReach = ownPosts.reduce((acc, p) => acc + (p.views || 0), 0)

    const computedMetrics: MetricCardData[] = [
      {
        id: 'sentiment',
        title: 'Sentimento Global',
        value: currentSentiment.toFixed(2),
        trend: isNaN(sentimentTrend)
          ? 0
          : parseFloat(sentimentTrend.toFixed(1)),
        trendLabel: 'vs. dia anterior',
        data: ownMetrics.map((m, i) => ({ index: i, value: m.sentimentScore })),
        color: 'hsl(var(--primary))',
      },
      {
        id: 'mentions',
        title: 'Menções Totais',
        value: currentMentions.toLocaleString(),
        trend: 5.2, // Mock trend for mentions as we need historical volume specifically
        trendLabel: 'vs. semana anterior',
        data: ownMetrics.map((m, i) => ({ index: i, value: m.postsCount })),
        color: 'hsl(var(--accent))',
      },
      {
        id: 'engagement',
        title: 'Engajamento Médio',
        value: `${(currentEngagement * 100).toFixed(1)}%`,
        trend: isNaN(engagementTrend)
          ? 0
          : parseFloat(engagementTrend.toFixed(1)),
        trendLabel: 'vs. dia anterior',
        data: ownMetrics.map((m, i) => ({
          index: i,
          value: m.engagementRate * 100,
        })),
        color: 'hsl(var(--chart-4))',
      },
      {
        id: 'reach',
        title: 'Alcance Potencial',
        value:
          totalReach > 1000
            ? `${(totalReach / 1000).toFixed(1)}k`
            : totalReach.toString(),
        trend: 12.5,
        trendLabel: 'vs. mês anterior',
        data: ownMetrics.map((m, i) => ({
          index: i,
          value: m.postsCount * 1000,
        })), // Mock projection
        color: 'hsl(var(--chart-3))',
      },
    ]

    // 2. Calculate Heatmap
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const slots = ['08:00', '12:00', '16:00', '20:00']
    const heatmapMap = new Map<string, { sum: number; count: number }>()

    ownPosts.forEach((post) => {
      try {
        const date = new Date(post.postedAt)
        if (isNaN(date.getTime())) return // Skip invalid dates

        const dayName = days[getDay(date)]
        const hour = getHours(date)
        let slot = '20:00'
        if (hour < 10) slot = '08:00'
        else if (hour < 14) slot = '12:00'
        else if (hour < 18) slot = '16:00'

        const key = `${dayName}-${slot}`
        const current = heatmapMap.get(key) || { sum: 0, count: 0 }
        heatmapMap.set(key, {
          sum: current.sum + post.sentimentScore,
          count: current.count + 1,
        })
      } catch (e) {
        console.error('Error processing post for heatmap:', e)
      }
    })

    const computedHeatmap: HeatMapCell[] = []
    days.forEach((day) => {
      slots.forEach((slot) => {
        const data = heatmapMap.get(`${day}-${slot}`)
        computedHeatmap.push({
          day,
          hourSlot: slot,
          value: data && data.count > 0 ? data.sum / data.count : 0,
        })
      })
    })

    // 3. Calculate Clients Data
    const computedClientsData: ClientDashboardData[] = clients.map((client) => {
      const clientMetrics = dailyMetrics
        .filter((m) => m.clientId === client.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const clientPosts = posts.filter((p) => p.clientId === client.id)
      const positive = clientPosts.filter((p) => p.sentimentScore > 0.3).length
      const negative = clientPosts.filter((p) => p.sentimentScore < -0.3).length
      const neutral = clientPosts.length - positive - negative

      return {
        ...client,
        history: clientMetrics.map((m) => ({
          date: format(parseISO(m.date), 'dd/MM', { locale: ptBR }),
          sentiment: m.sentimentScore,
          volume: m.postsCount,
        })),
        distribution: { positive, neutral, negative },
      }
    })

    setMetrics(computedMetrics)
    setHeatMapData(computedHeatmap)
    setClientsData(computedClientsData)
  }, [clients, dailyMetrics, posts, isLoading])

  return { metrics, heatMapData, clientsData, isLoading }
}
