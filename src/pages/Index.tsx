import { useDashboard } from '@/hooks/useDashboard'
import { renderWidget } from '@/components/DashboardWidgets'
import { DashboardCustomizer } from '@/components/DashboardCustomizer'
import useAppStore from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { FileDown, Download } from 'lucide-react'
import { exportToPDF, exportToCSV } from '@/services/export/reports'
import { subDays } from 'date-fns'

export default function Index() {
  const { clients, posts, metrics, alerts } = useAppStore()
  const { visibleWidgets } = useDashboard()

  const handleExportPDF = () => {
    exportToPDF({
      clients,
      posts,
      metrics,
      alerts,
      period: { start: subDays(new Date(), 30), end: new Date() },
    })
  }

  const handleExportCSV = () => {
    exportToCSV({
      clients,
      posts,
      metrics,
      alerts,
      period: { start: subDays(new Date(), 30), end: new Date() },
    })
  }

  // Sort widgets by position to ensure visual order matches logic
  // Primary sort by Y, secondary sort by X
  const sortedWidgets = [...visibleWidgets].sort((a, b) => {
    if (a.position.y === b.position.y) return a.position.x - b.position.x
    return a.position.y - b.position.y
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-planin border border-border/50">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral personalizada da reputação digital.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DashboardCustomizer />
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" /> CSV
          </Button>
          <Button variant="planin" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" /> Relatório PDF
          </Button>
        </div>
      </div>

      {sortedWidgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {sortedWidgets.map((widget) => {
            const colSpanClass = `lg:col-span-${widget.position.w}`
            return (
              <div key={widget.id} className={colSpanClass}>
                {renderWidget(widget.id, { clients, posts, metrics, alerts })}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
          <div className="p-4 rounded-full bg-gray-100 mb-4">
            <FileDown className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xl font-medium text-foreground mb-2">
            Seu dashboard está vazio
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Adicione widgets para visualizar seus dados de reputação
          </p>
          <DashboardCustomizer />
        </div>
      )}
    </div>
  )
}
