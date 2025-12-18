import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'
import {
  TrendingUp,
  Users,
  MessageSquare,
  AlertCircle,
  Activity,
} from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { SentimentBadge } from '@/components/SentimentBadge'
import { DashboardCustomizer } from '@/components/DashboardCustomizer'
import { exportToPDF, exportToCSV } from '@/services/export/reports'
import { Download, FileDown } from 'lucide-react'
import { subDays } from 'date-fns'
import { useDashboard } from '@/hooks/useDashboard'
import { renderWidget } from '@/components/DashboardWidgets'

export default function Index() {
  const { clients, posts, metrics, alerts } = useAppStore()
  const { visibleWidgets, isLoading: dashboardLoading } = useDashboard()

  const handleExportPDF = () => {
    exportToPDF({
      clients,
      posts,
      metrics,
      alerts,
      period: {
        start: subDays(new Date(), 30),
        end: new Date(),
      },
    })
  }

  const handleExportCSV = () => {
    exportToCSV({
      clients,
      posts,
      metrics,
      alerts,
      period: {
        start: subDays(new Date(), 30),
        end: new Date(),
      },
    })
  }

  // Props para widgets
  const widgetProps = { clients, posts, metrics, alerts }

  // Organizar widgets por tipo para layout responsivo
  const kpiWidgets = visibleWidgets.filter((w) => w.type === 'kpi')
  const chartWidgets = visibleWidgets.filter((w) => w.type === 'chart')
  const listWidgets = visibleWidgets.filter((w) => w.type === 'list')

  if (dashboardLoading) {
    return <div>Carregando dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do monitoramento de reputação
          </p>
        </div>
        <div className="flex gap-2">
          <DashboardCustomizer />
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      {kpiWidgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiWidgets.map((widget) => (
            <div key={widget.id}>{renderWidget(widget.id, widgetProps)}</div>
          ))}
        </div>
      )}

      {/* Charts */}
      {chartWidgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {chartWidgets.map((widget) => (
            <div
              key={widget.id}
              className={
                widget.id === 'chart-sentiment-trend'
                  ? 'col-span-1 lg:col-span-2'
                  : 'col-span-1'
              }
            >
              {renderWidget(widget.id, widgetProps)}
            </div>
          ))}
        </div>
      )}

      {/* Lists */}
      {listWidgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listWidgets.map((widget) => (
            <div key={widget.id}>{renderWidget(widget.id, widgetProps)}</div>
          ))}
        </div>
      )}

      {/* Mensagem se nenhum widget estiver visível */}
      {visibleWidgets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhum widget visível. Use "Personalizar Dashboard" para ativar widgets.
            </p>
            <DashboardCustomizer />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
