import { useDashboard } from '@/hooks/useDashboard'
import { renderWidget } from '@/components/DashboardWidgets'
import { DashboardCustomizer } from '@/components/DashboardCustomizer'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { AppHeader } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportToPDF } from '@/services/export/reports'
import { subDays } from 'date-fns'

export default function Index() {
  const { visibleWidgets, isLoading: isDashboardLoading } = useDashboard()
  const {
    clients,
    posts,
    metrics,
    alerts,
    isLoading: isDataLoading,
  } = useAppStore()

  const isLoading = isDashboardLoading || isDataLoading

  const handleExport = () => {
    exportToPDF(
      {
        clients,
        posts,
        metrics,
        alerts,
        period: { start: subDays(new Date(), 30), end: new Date() },
      },
      'dashboard-report.pdf',
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <AppHeader title="Visão Geral" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
            <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
            <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <AppHeader title="Visão Geral" />

      <div className="px-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-muted-foreground">
          Monitoramento em Tempo Real
        </h2>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Exportar Relatório
          </Button>
          <DashboardCustomizer />
        </div>
      </div>

      <div className="px-6 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-min">
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              'rounded-xl transition-all duration-300',
              // Grid positioning classes based on widget config
              `col-span-1 md:col-span-${Math.min(widget.position.w * 2, 6)} lg:col-span-${widget.position.w}`,
              // Height classes
              widget.position.h > 2 ? 'h-[400px]' : 'h-[160px]',
            )}
            style={
              {
                // Fallback for custom grid layouts if needed
              }
            }
          >
            {renderWidget(widget.id, { clients, posts, metrics, alerts })}
          </div>
        ))}
      </div>
    </div>
  )
}
