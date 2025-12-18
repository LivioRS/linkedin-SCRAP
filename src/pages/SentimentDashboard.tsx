import { useDashboardData } from '@/hooks/useDashboardData'
import { MetricSparklineCard } from '@/components/MetricSparklineCard'
import { SentimentHeatMap } from '@/components/SentimentHeatMap'
import { ClientSentimentCharts } from '@/components/ClientSentimentCharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'

export default function SentimentDashboard() {
  const { metrics, heatMapData, clientsData, isLoading } = useDashboardData()

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full rounded-xl lg:col-span-1" />
          <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">
            Dashboard de Sentimento
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Análise aprofundada de reputação e percepção de marca.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricSparklineCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            trendLabel={metric.trendLabel}
            data={metric.data}
            color={metric.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 h-full">
          <SentimentHeatMap data={heatMapData} />
        </div>
        <div className="xl:col-span-2 space-y-6">
          {clientsData.map((client) => (
            <ClientSentimentCharts key={client.id} client={client} />
          ))}
        </div>
      </div>
    </div>
  )
}
