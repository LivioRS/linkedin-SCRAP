import { useState, useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AnalysisHeader } from '@/components/analysis/AnalysisHeader'
import { SentimentOverview } from '@/components/analysis/SentimentOverview'
import { SentimentCharts } from '@/components/analysis/SentimentCharts'
import { MentionsFeed } from '@/components/analysis/MentionsFeed'
import { subDays, isAfter } from 'date-fns'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/services/export/reports'

export default function Analysis() {
  const { clients, posts, metrics, alerts } = useAppStore()
  const [period, setPeriod] = useState('30')
  const [platform, setPlatform] = useState('all')

  const ownClient = clients.find((c) => c.type === 'own')

  // Filter Data Logic
  const filteredData = useMemo(() => {
    const cutoffDate = subDays(new Date(), parseInt(period))

    const filteredPosts = posts.filter((post) => {
      const isDateValid = isAfter(new Date(post.postedAt), cutoffDate)
      const isPlatformValid =
        platform === 'all' ||
        post.vehicle?.toLowerCase() === platform.toLowerCase() ||
        (platform === 'linkedin' && !post.vehicle) // Default to LinkedIn if missing
      return isDateValid && isPlatformValid
    })

    const filteredMetrics = metrics.filter((metric) => {
      const isDateValid = isAfter(new Date(metric.date), cutoffDate)
      return isDateValid && metric.clientId === ownClient?.id
    })

    return { posts: filteredPosts, metrics: filteredMetrics }
  }, [posts, metrics, period, platform, ownClient])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalMentions = filteredData.posts.length
    const sentimentScore =
      filteredData.posts.reduce((acc, p) => acc + p.sentimentScore, 0) /
      (totalMentions || 1)

    const engagementRate =
      filteredData.posts.reduce(
        (acc, p) => acc + (p.likes + p.comments) / (p.views || 100),
        0,
      ) / (totalMentions || 1)

    const positiveCount = filteredData.posts.filter(
      (p) => p.sentimentScore > 0.3,
    ).length
    const negativeCount = filteredData.posts.filter(
      (p) => p.sentimentScore < -0.3,
    ).length
    const npsScore =
      totalMentions > 0
        ? ((positiveCount - negativeCount) / totalMentions) * 100
        : 0

    return { totalMentions, sentimentScore, engagementRate, npsScore }
  }, [filteredData])

  // Prepare Chart Data
  const chartData = useMemo(() => {
    // Trend Data
    const dates = Array.from(
      new Set(filteredData.posts.map((p) => p.postedAt.split('T')[0])),
    ).sort()

    // Fill gaps in dates if needed, for now using existing post dates
    const trendData = dates.map((date) => {
      const dayPosts = filteredData.posts.filter((p) =>
        p.postedAt.startsWith(date),
      )
      const sentiment =
        dayPosts.reduce((acc, p) => acc + p.sentimentScore, 0) /
        (dayPosts.length || 1)
      return {
        date,
        sentiment: parseFloat(sentiment.toFixed(2)),
        volume: dayPosts.length,
      }
    })

    // Distribution Data
    const positive = filteredData.posts.filter(
      (p) => p.sentimentScore > 0.3,
    ).length
    const negative = filteredData.posts.filter(
      (p) => p.sentimentScore < -0.3,
    ).length
    const neutral = filteredData.posts.length - positive - negative
    const distributionData = [
      { name: 'Positivo', value: positive, color: 'hsl(142, 70%, 45%)' },
      { name: 'Neutro', value: neutral, color: 'hsl(210, 40%, 90%)' },
      { name: 'Negativo', value: negative, color: 'hsl(0, 84%, 60%)' },
    ].filter((d) => d.value > 0)

    // Topic Data (Mocked based on categories for now)
    const topicMap = new Map<string, number>()
    filteredData.posts.forEach((p) => {
      const topic = p.category || 'Geral'
      topicMap.set(topic, (topicMap.get(topic) || 0) + 1)
    })
    const topicData = Array.from(topicMap.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return { trendData, distributionData, topicData }
  }, [filteredData])

  const handleExport = () => {
    exportToCSV(
      {
        clients,
        posts: filteredData.posts,
        metrics: filteredData.metrics,
        alerts: [],
        period: {
          start: subDays(new Date(), parseInt(period)),
          end: new Date(),
        },
      },
      `analise-sentimento-${period}d.csv`,
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Section */}
      <AnalysisHeader />

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-border/50 shadow-sm gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mr-2">
            Filtros
          </h2>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Fontes</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="news">Notícias</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 Dias</SelectItem>
              <SelectItem value="30">Últimos 30 Dias</SelectItem>
              <SelectItem value="90">Últimos 3 Meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" /> Exportar Dados
        </Button>
      </div>

      {/* KPI Section */}
      <SentimentOverview {...kpis} />

      {/* Charts Section */}
      <SentimentCharts {...chartData} />

      {/* Feed Section */}
      <MentionsFeed posts={filteredData.posts.slice(0, 10)} clients={clients} />
    </div>
  )
}
