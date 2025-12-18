import useAppStore from '@/stores/useAppStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  TrendingDown,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function Alerts() {
  const { alerts, markAlertRead } = useAppStore()

  const getIcon = (type: string) => {
    switch (type) {
      case 'sentiment_drop':
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case 'engagement_spike':
        return <Zap className="h-5 w-5 text-yellow-500" />
      case 'competitor_move':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Central de Alertas (Telegram)
        </h2>
        <p className="text-muted-foreground">
          Notificações automáticas enviadas para o bot configurado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>
            Mostrando todos os alertas gerados pelo motor de IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border transition-all hover:shadow-sm',
                    alert.isRead
                      ? 'bg-background opacity-70'
                      : 'bg-card shadow-sm border-l-4 border-l-primary',
                  )}
                >
                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div className={cn('p-2 rounded-full bg-muted mt-1')}>
                      {getIcon(alert.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] uppercase',
                            getSeverityColor(alert.severity),
                          )}
                        >
                          {alert.severity}
                        </Badge>
                        {!alert.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{alert.message}</p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {new Date(alert.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 self-end md:self-center">
                    {!alert.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAlertRead(alert.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Marcar lido
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Tudo tranquilo! Nenhum alerta recente.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
