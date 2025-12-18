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
        return <TrendingDown className="h-5 w-5 text-red-600" />
      case 'engagement_spike':
        return <Zap className="h-5 w-5 text-yellow-600" />
      case 'competitor_move':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-planin">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Central de Alertas
        </h2>
        <p className="text-muted-foreground mt-1">
          Notificações automáticas enviadas para o Telegram e Painel.
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
                    'flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-xl border transition-all duration-200',
                    alert.isRead
                      ? 'bg-white opacity-75 hover:opacity-100'
                      : 'bg-white shadow-md border-l-4 border-l-accent scale-[1.01]',
                  )}
                >
                  <div className="flex items-start gap-4 mb-4 md:mb-0 w-full">
                    <div
                      className={cn(
                        'p-3 rounded-full bg-gray-50 shadow-sm shrink-0',
                      )}
                    >
                      {getIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
                          {alert.type.replace('_', ' ')}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] uppercase font-bold px-2 py-0.5',
                            getSeverityColor(alert.severity),
                          )}
                        >
                          {alert.severity}
                        </Badge>
                        {!alert.isRead && (
                          <span className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(0,153,204,0.6)]"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {alert.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-2 block font-medium">
                        {new Date(alert.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end md:self-center shrink-0">
                    {!alert.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAlertRead(alert.id)}
                        className="text-primary hover:bg-primary/10"
                      >
                        <Check className="h-4 w-4 mr-1" /> Marcar lido
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Tudo tranquilo!</p>
                <p className="text-sm">Nenhum alerta recente no sistema.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
