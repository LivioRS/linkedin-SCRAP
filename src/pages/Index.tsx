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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral personalizada do monitoramento de reputação
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DashboardCustomizer />
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      {sortedWidgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          {sortedWidgets.map((widget) => {
            // Determine column span based on widget width
            // Grid is 12 columns
            // w=3 -> col-span-3 (quarter width)
            // w=6 -> col-span-6 (half width)
            // w=12 -> col-span-12 (full width)
            const colSpanClass = `lg:col-span-${widget.position.w}`

            return (
              <div key={widget.id} className={colSpanClass}>
                {renderWidget(widget.id, { clients, posts, metrics, alerts })}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
          <p className="text-lg font-medium text-muted-foreground mb-2">
            Seu dashboard está vazio
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione widgets para visualizar seus dados
          </p>
          <DashboardCustomizer />
        </div>
      )}
    </div>
  )
}
