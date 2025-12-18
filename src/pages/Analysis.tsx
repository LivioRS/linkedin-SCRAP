import { useState } from 'react'
import useAppStore from '@/stores/useAppStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Trophy, TrendingDown, ArrowRight, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Analysis() {
  const { clients, metrics, posts } = useAppStore()

  const ownClient = clients.find((c) => c.type === 'own')
  const competitors = clients.filter((c) => c.type === 'competitor')

  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>(
    competitors[0]?.id || '',
  )
  const [period, setPeriod] = useState('30')

  const selectedCompetitor = clients.find((c) => c.id === selectedCompetitorId)

  // Helpers to calc metrics
  const getMetricsForClient = (clientId: string | undefined, days: number) => {
    if (!clientId) return { sentiment: 0, engagement: 0, volume: 0, sov: 0 }

    const clientMetrics = metrics
      .filter((m) => m.clientId === clientId)
      .slice(0, days)
    const clientPosts = posts
      .filter((p) => p.clientId === clientId)
      .slice(0, days) // simple slice for mock

    const sentiment =
      clientMetrics.reduce((acc, c) => acc + c.sentimentScore, 0) /
      (clientMetrics.length || 1)
    const engagement =
      clientMetrics.reduce((acc, c) => acc + c.engagementRate, 0) /
      (clientMetrics.length || 1)

    // Share of voice (simple volume based)
    const totalVolume = posts.length || 1
    const clientVolume = clientPosts.length
    const sov = (clientVolume / totalVolume) * 100

    return { sentiment, engagement, volume: clientVolume, sov }
  }

  const ownMetricsData = getMetricsForClient(ownClient?.id, parseInt(period))
  const compMetricsData = getMetricsForClient(
    selectedCompetitorId,
    parseInt(period),
  )

  // Determine winners
  const getWinnerClass = (val1: number, val2: number) =>
    val1 > val2
      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold'
      : ''

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Análise Competitiva
          </h2>
          <p className="text-muted-foreground">
            Comparativo direto entre sua marca e concorrentes.
          </p>
        </div>
        <div className="flex gap-4">
          <Select
            value={selectedCompetitorId}
            onValueChange={setSelectedCompetitorId}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione Concorrente" />
            </SelectTrigger>
            <SelectContent>
              {competitors.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Dias</SelectItem>
              <SelectItem value="30">30 Dias</SelectItem>
              <SelectItem value="90">90 Dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Comparativo Lado a Lado</CardTitle>
            <CardDescription>
              Métricas de performance para o período selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Métrica</TableHead>
                  <TableHead className="text-center">
                    {ownClient?.name} (Você)
                  </TableHead>
                  <TableHead className="text-center">
                    {selectedCompetitor?.name}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    Score de Sentimento
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center',
                      getWinnerClass(
                        ownMetricsData.sentiment,
                        compMetricsData.sentiment,
                      ),
                    )}
                  >
                    {ownMetricsData.sentiment.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center',
                      getWinnerClass(
                        compMetricsData.sentiment,
                        ownMetricsData.sentiment,
                      ),
                    )}
                  >
                    {compMetricsData.sentiment.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Taxa de Engajamento
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center',
                      getWinnerClass(
                        ownMetricsData.engagement,
                        compMetricsData.engagement,
                      ),
                    )}
                  >
                    {(ownMetricsData.engagement * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center',
                      getWinnerClass(
                        compMetricsData.engagement,
                        ownMetricsData.engagement,
                      ),
                    )}
                  >
                    {(compMetricsData.engagement * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Volume de Posts</TableCell>
                  <TableCell
                    className={cn(
                      'text-center',
                      getWinnerClass(
                        ownMetricsData.volume,
                        compMetricsData.volume,
                      ),
                    )}
                  >
                    {ownMetricsData.volume}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center',
                      getWinnerClass(
                        compMetricsData.volume,
                        ownMetricsData.volume,
                      ),
                    )}
                  >
                    {compMetricsData.volume}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Share of Voice</TableCell>
                  <TableCell
                    className={cn(
                      'text-center',
                      getWinnerClass(ownMetricsData.sov, compMetricsData.sov),
                    )}
                  >
                    {ownMetricsData.sov.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center',
                      getWinnerClass(compMetricsData.sov, ownMetricsData.sov),
                    )}
                  >
                    {compMetricsData.sov.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Detecção de Movimentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownMetricsData.sentiment < compMetricsData.sentiment ? (
                <Alert variant="destructive">
                  <TrendingDown className="h-4 w-4" />
                  <AlertTitle>Alerta de Crise</AlertTitle>
                  <AlertDescription>
                    Seu sentimento está inferior ao concorrente. Analise os
                    posts negativos recentes.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <AlertTitle>Liderança de Sentimento</AlertTitle>
                  <AlertDescription>
                    Sua marca mantém uma percepção mais positiva no mercado
                    atualmente.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md border">
                "O concorrente {selectedCompetitor?.name} aumentou o volume de
                postagens em 20% na última semana."
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking de Engajamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[ownClient, ...competitors]
                  .filter(Boolean)
                  .map((c) => ({
                    ...c,
                    eng: getMetricsForClient(c?.id, 30).engagement,
                  }))
                  .sort((a, b) => b.eng - a.eng)
                  .map((c, idx) => (
                    <div
                      key={c?.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-muted-foreground w-4">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-sm">{c?.name}</span>
                      </div>
                      <span className="font-bold text-sm">
                        {(c.eng * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
