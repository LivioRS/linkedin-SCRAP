import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, MessageCircle, Activity, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SentimentOverviewProps {
  totalMentions: number
  sentimentScore: number
  engagementRate: number
  npsScore: number
}

interface KPIProps {
  title: string
  value: string
  icon: React.ElementType
  trend?: string
  trendUp?: boolean
  description?: string
  className?: string
}

function KPI({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  description,
  className,
}: KPIProps) {
  return (
    <Card
      className={cn(
        'shadow-planin hover:shadow-planin-hover transition-all duration-300 border-l-4',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="p-2 bg-background rounded-full shadow-sm">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">{value}</div>
        {(trend || description) && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {trend && (
              <span
                className={cn(
                  'font-bold flex items-center',
                  trendUp ? 'text-green-600' : 'text-red-600',
                )}
              >
                {trend}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function SentimentOverview({
  totalMentions,
  sentimentScore,
  engagementRate,
  npsScore,
}: SentimentOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <KPI
        title="Total de Menções"
        value={totalMentions.toString()}
        icon={MessageCircle}
        trend="+12%"
        trendUp={true}
        description="vs. período anterior"
        className="border-l-primary"
      />
      <KPI
        title="Score de Sentimento"
        value={sentimentScore.toFixed(2)}
        icon={TrendingUp}
        trend={sentimentScore > 0 ? '+0.4' : '-0.1'}
        trendUp={sentimentScore > 0}
        description="Escala -1 a +1"
        className="border-l-accent"
      />
      <KPI
        title="Taxa de Engajamento"
        value={`${(engagementRate * 100).toFixed(1)}%`}
        icon={Activity}
        trend="+2.1%"
        trendUp={true}
        description="Média do setor: 3.5%"
        className="border-l-secondary"
      />
      <KPI
        title="NPS Estimado"
        value={npsScore.toFixed(0)}
        icon={Award}
        trend={npsScore > 50 ? 'Zona de Qualidade' : 'Zona de Aperfeiçoamento'}
        trendUp={npsScore > 50}
        description="Baseado em sentimento"
        className="border-l-primary"
      />
    </div>
  )
}
