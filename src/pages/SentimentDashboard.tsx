import CompleteDashboard from '@/components/visualizations/CompleteDashboard'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function SentimentDashboard() {
  const { clientsData, heatmapData, clientNames, isLoading } = useDashboardData()

  // Se não houver dados, mostrar mensagem
  const hasData = clientsData.length > 0 && clientsData.some(c => c.data.length > 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
            Dashboard de Sentimento
          </h1>
          <p className="text-muted-foreground">
            Visualizações completas de análise de sentimento por cliente
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum dado disponível
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Execute o "Global Scrape" para coletar dados e visualizar as análises de sentimento.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <CompleteDashboard
      clientsData={clientsData}
      heatmapData={heatmapData}
      clientNames={clientNames}
    />
  )
}

