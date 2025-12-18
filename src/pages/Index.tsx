import { useAppStore } from '@/stores/useAppStore'
import { renderWidget } from '@/components/DashboardWidgets'
import { Button } from '@/components/ui/button'
import { Download, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function Index() {
  const { clients, metrics, posts, alerts, isLoading } = useAppStore()

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[350px] w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  const widgetProps = { clients, posts, metrics, alerts }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">
            Visão Geral
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento em tempo real de reputação e concorrentes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-primary/20 hover:bg-primary/5"
          >
            <Download className="h-4 w-4" /> Exportar Relatório
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
            <Plus className="h-4 w-4" /> Nova Análise
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderWidget('kpi-sentiment', widgetProps)}
        {renderWidget('kpi-engagement', widgetProps)}
        {renderWidget('kpi-posts', widgetProps)}
        {renderWidget('kpi-competitors', widgetProps)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-full">
          {renderWidget('chart-sentiment-trend', widgetProps)}
        </div>
        <div className="lg:col-span-1 h-full">
          {renderWidget('chart-share-of-voice', widgetProps)}
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderWidget('list-negative-posts', widgetProps)}
        {renderWidget('list-recent-alerts', widgetProps)}
      </div>
    </div>
  )
}
