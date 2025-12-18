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
import { Trophy, TrendingDown, Activity, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Analysis() {
  const { clients, metrics, posts } = useAppStore()

  const [primaryId, setPrimaryId] = useState<string>(
    clients.find((c) => c.type === 'own')?.id || '',
  )
  const [secondaryId, setSecondaryId] = useState<string>(
    clients.find((c) => c.type === 'competitor')?.id || '',
  )
  const [period, setPeriod] = useState('30')

  const primaryClient = clients.find((c) => c.id === primaryId)
  const secondaryClient = clients.find((c) => c.id === secondaryId)

  // Helpers to calc metrics
  const getMetricsForClient = (clientId: string | undefined, days: number) => {
    if (!clientId) return { sentiment: 0, engagement: 0, volume: 0, sov: 0 }

    const clientMetrics = metrics
      .filter((m) => m.clientId === clientId)
      .slice(0, days)
    const clientPosts = posts
      .filter((p) => p.clientId === clientId)
      .slice(0, days) // Approximate slice for mock

    const sentiment =
      clientMetrics.reduce((acc, c) => acc + c.sentimentScore, 0) /
      (clientMetrics.length || 1)
    const engagement =
      clientMetrics.reduce((acc, c) => acc + c.engagementRate, 0) /
      (clientMetrics.length || 1)

    // Share of voice within industry
    const client = clients.find((c) => c.id === clientId)
    const industryPosts = posts.filter((p) => {
      const c = clients.find((cl) => cl.id === p.clientId)
      return c?.industry === client?.industry
    })
    const sov = (clientPosts.length / (industryPosts.length || 1)) * 100

    return { sentiment, engagement, volume: clientPosts.length, sov }
  }

  const primaryData = getMetricsForClient(primaryId, parseInt(period))
  const secondaryData = getMetricsForClient(secondaryId, parseInt(period))

  const getWinnerClass = (val1: number, val2: number) =>
    val1 > val2
      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold'
      : ''

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Inteligência Competitiva
          </h2>
          <p className="text-muted-foreground">
            Compare métricas de performance e reputação.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Primário:</span>
            <Select value={primaryId} onValueChange={setPrimaryId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Comparar:</span>
            <Select value={secondaryId} onValueChange={setSecondaryId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {clients
                  .filter((c) => c.id !== primaryId)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
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
              Análise direta entre {primaryClient?.name} e{' '}
              {secondaryClient?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Métrica</TableHead>
                  <TableHead className="text-center font-bold text-primary">
                    {primaryClient?.name}
                  </TableHead>
                  <TableHead className="text-center">
                    {secondaryClient?.name}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    Score de Sentimento (-1 a 1)
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(
                        primaryData.sentiment,
                        secondaryData.sentiment,
                      ),
                    )}
                  >
                    {primaryData.sentiment.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(
                        secondaryData.sentiment,
                        primaryData.sentiment,
                      ),
                    )}
                  >
                    {secondaryData.sentiment.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Taxa de Engajamento
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(
                        primaryData.engagement,
                        secondaryData.engagement,
                      ),
                    )}
                  >
                    {(primaryData.engagement * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(
                        secondaryData.engagement,
                        primaryData.engagement,
                      ),
                    )}
                  >
                    {(secondaryData.engagement * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Volume de Posts</TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(primaryData.volume, secondaryData.volume),
                    )}
                  >
                    {primaryData.volume}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(secondaryData.volume, primaryData.volume),
                    )}
                  >
                    {secondaryData.volume}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Share of Voice (Indústria)
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(primaryData.sov, secondaryData.sov),
                    )}
                  >
                    {primaryData.sov.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center text-lg',
                      getWinnerClass(secondaryData.sov, primaryData.sov),
                    )}
                  >
                    {secondaryData.sov.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <Lightbulb className="h-5 w-5" />
                Insights Automáticos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {primaryData.sentiment < secondaryData.sentiment ? (
                <div className="text-sm p-3 bg-white dark:bg-card rounded shadow-sm border border-yellow-100">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                    Atenção à Reputação
                  </p>
                  <p>
                    Seu score de sentimento está inferior ao concorrente.
                    Analise os comentários negativos recentes para identificar
                    pontos de dor.
                  </p>
                </div>
              ) : (
                <div className="text-sm p-3 bg-white dark:bg-card rounded shadow-sm border border-yellow-100">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                    Liderança de Percepção
                  </p>
                  <p>
                    Sua marca mantém uma percepção mais positiva no mercado
                    atualmente. Continue engajando!
                  </p>
                </div>
              )}

              {primaryData.sov < secondaryData.sov && (
                <div className="text-sm p-3 bg-white dark:bg-card rounded shadow-sm border border-yellow-100">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                    Oportunidade de Alcance
                  </p>
                  <p>
                    O concorrente domina o Share of Voice. Considere aumentar a
                    frequência de postagens para recuperar visibilidade.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ranking da Indústria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clients
                  .filter((c) => c.industry === primaryClient?.industry)
                  .map((c) => ({
                    ...c,
                    eng: getMetricsForClient(c.id, 30).engagement,
                  }))
                  .sort((a, b) => b.eng - a.eng)
                  .map((c, idx) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'font-bold w-4 text-center',
                            idx === 0
                              ? 'text-yellow-500'
                              : 'text-muted-foreground',
                          )}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-medium text-sm">{c.name}</span>
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
