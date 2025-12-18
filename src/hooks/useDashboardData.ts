import { useState, useEffect } from 'react'
import { Client } from '@/types'
import { subDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface SparklineData {
  value: number
}

export interface MetricCardData {
  id: string
  title: string
  value: string | number
  trend: number
  trendLabel: string
  data: SparklineData[]
  color: string
}

export interface HeatMapCell {
  day: string
  hourSlot: string // e.g., "Manhã", "Tarde"
  value: number // -1 to 1
}

export interface ClientChartData {
  date: string
  sentiment: number
  volume: number
}

export interface ClientDashboardData extends Client {
  history: ClientChartData[]
  distribution: {
    positive: number
    neutral: number
    negative: number
  }
}

export function useDashboardData() {
  const [metrics, setMetrics] = useState<MetricCardData[]>([])
  const [heatMapData, setHeatMapData] = useState<HeatMapCell[]>([])
  const [clientsData, setClientsData] = useState<ClientDashboardData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock Metrics
      const mockMetrics: MetricCardData[] = [
        {
          id: 'sentiment',
          title: 'Sentimento Global',
          value: '0.68',
          trend: 12.5,
          trendLabel: 'vs. mês anterior',
          data: Array.from({ length: 20 }, () => ({
            value: 0.4 + Math.random() * 0.4,
          })),
          color: 'hsl(var(--primary))',
        },
        {
          id: 'mentions',
          title: 'Menções Totais',
          value: '1,284',
          trend: 8.2,
          trendLabel: 'vs. mês anterior',
          data: Array.from({ length: 20 }, () => ({
            value: 50 + Math.random() * 100,
          })),
          color: 'hsl(var(--accent))',
        },
        {
          id: 'engagement',
          title: 'Engajamento Médio',
          value: '4.2%',
          trend: -2.1,
          trendLabel: 'vs. mês anterior',
          data: Array.from({ length: 20 }, () => ({
            value: 3 + Math.random() * 3,
          })),
          color: 'hsl(var(--secondary))',
        },
        {
          id: 'reach',
          title: 'Alcance Potencial',
          value: '850k',
          trend: 15.3,
          trendLabel: 'vs. mês anterior',
          data: Array.from({ length: 20 }, () => ({
            value: 200 + Math.random() * 500,
          })),
          color: 'hsl(var(--chart-4))',
        },
      ]

      // Mock HeatMap
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const slots = ['08:00', '12:00', '16:00', '20:00']
      const mockHeatMap: HeatMapCell[] = []
      days.forEach((day) => {
        slots.forEach((slot) => {
          mockHeatMap.push({
            day,
            hourSlot: slot,
            value: Math.random() * 2 - 0.5, // Bias towards positive
          })
        })
      })

      // Mock Clients Data
      const mockClients: ClientDashboardData[] = [
        {
          id: '1',
          name: 'Grupo Plaenge',
          url: 'https://linkedin.com/company/grupo-plaenge',
          type: 'own',
          industry: 'Construção Civil',
          status: 'success',
          lastUpdated: new Date().toISOString(),
          avatarUrl:
            'https://img.usecurling.com/i?q=plaenge&color=green&shape=fill',
          history: Array.from({ length: 14 }, (_, i) => ({
            date: format(subDays(new Date(), 13 - i), 'dd/MM', {
              locale: ptBR,
            }),
            sentiment: 0.5 + Math.random() * 0.4,
            volume: Math.floor(Math.random() * 50) + 10,
          })),
          distribution: { positive: 65, neutral: 25, negative: 10 },
        },
        {
          id: '2',
          name: 'Vanguard',
          url: 'https://linkedin.com/company/vanguard-home',
          type: 'competitor',
          industry: 'Construção Civil',
          status: 'idle',
          lastUpdated: new Date().toISOString(),
          avatarUrl:
            'https://img.usecurling.com/i?q=vanguard&color=blue&shape=outline',
          history: Array.from({ length: 14 }, (_, i) => ({
            date: format(subDays(new Date(), 13 - i), 'dd/MM', {
              locale: ptBR,
            }),
            sentiment: 0.2 + Math.random() * 0.6,
            volume: Math.floor(Math.random() * 40) + 5,
          })),
          distribution: { positive: 45, neutral: 40, negative: 15 },
        },
      ]

      setMetrics(mockMetrics)
      setHeatMapData(mockHeatMap)
      setClientsData(mockClients)
      setIsLoading(false)
    }

    loadData()
  }, [])

  return { metrics, heatMapData, clientsData, isLoading }
}
