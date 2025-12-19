import { useDashboard } from '@/hooks/useDashboard'
import { renderWidget } from '@/components/DashboardWidgets'
import { DashboardCustomizer } from '@/components/DashboardCustomizer'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Download, FileText, RefreshCw } from 'lucide-react'
import { exportToPDF, exportToCSV } from '@/services/export/reports'
import { subDays } from 'date-fns'

export default function Index() {
  const { visibleWidgets, isLoading: isDashboardLoading } = useDashboard()
  const {
    clients,
    posts,
    metrics,
    alerts,
    isLoading: isDataLoading,
    refreshData,
  } = useAppStore()

  const isLoading = isDashboardLoading || isDataLoading

  const handleExportPDF = () => {
    exportToPDF(
      {
        clients,
        posts,
        metrics,
        alerts,
        period: { start: subDays(new Date(), 30), end: new Date() },
      },
      'planin-dashboard.pdf',
    )
  }

  const handleExportCSV = () => {
    exportToCSV(
      {
        clients,
        posts,
        metrics,
        alerts,
        period: { start: subDays(new Date(), 30), end: new Date() },
      },
      'planin-data.csv',
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
            <Skeleton className="h-[400px] w-full rounded-xl lg:col-span-2" />
            <Skeleton className="h-[400px] w-full rounded-xl lg:col-span-2" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-display">
            Visão Geral
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitoramento em tempo real e KPIs principais.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Button variant="ghost" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileText className="h-4 w-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          <DashboardCustomizer />
        </div>
      </div>

      {/* Dynamic Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-min">
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              'rounded-xl transition-all duration-300 h-full',
              // Dynamic Grid Span Logic based on widget config width (1-12)
              widget.position.w === 3 ? 'lg:col-span-3' :
              widget.position.w === 4 ? 'lg:col-span-4' :
              widget.position.w === 6 ? 'lg:col-span-6' :
              widget.position.w === 8 ? 'lg:col-span-8' :
              widget.position.w === 9 ? 'lg:col-span-9' :
              widget.position.w === 12 ? 'lg:col-span-12' :
              'lg:col-span-6',
              // Height classes
              widget.position.h > 2 ? 'h-[400px]' : 'h-auto',
            )}
          >
            {renderWidget(widget.id, { clients, posts, metrics, alerts })}
          </div>
        ))}
      </div>
    </div>
  )
}
