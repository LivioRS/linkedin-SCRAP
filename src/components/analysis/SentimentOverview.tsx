import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  MessageCircle,
  Activity,
  Award,
  TrendingDown,
} from 'lucide-react'
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
  colorClass?: string
}

function KPI({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  description,
  className,
  colorClass,
}: KPIProps) {
  return (
    <Card
      className={cn(
        'shadow-sm hover:shadow-md transition-all duration-300 border-none relative overflow-hidden',
        className,
      )}
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', colorClass)} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </CardTitle>
        <div className="p-2 bg-gray-50 rounded-full">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {(trend || description) && (
          <div className="text-xs text-muted-foreground mt-2 flex flex-col gap-1">
            {trend && (
              <span
                className={cn(
                  'font-semibold flex items-center gap-1',
                  trendUp ? 'text-green-600' : 'text-red-600',
                )}
              >
                {trendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend}
              </span>
            )}
            <span className="opacity-80">{description}</span>
          </div>
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPI
        title="Total de Menções"
        value={totalMentions.toLocaleString()}
        icon={MessageCircle}
        trend="+12%"
        trendUp={true}
        description="vs. 30 dias anteriores"
        colorClass="bg-blue-500"
      />
      <KPI
        title="Score de Sentimento"
        value={sentimentScore.toFixed(2)}
        icon={TrendingUp}
        trend={sentimentScore > 0 ? '+0.4' : '-0.1'}
        trendUp={sentimentScore > 0}
        description="Escala -1 a +1"
        colorClass="bg-green-500"
      />
      <KPI
        title="Engajamento"
        value={`${(engagementRate * 100).toFixed(1)}%`}
        icon={Activity}
        trend="+2.1%"
        trendUp={true}
        description="Média da indústria: 3.5%"
        colorClass="bg-purple-500"
      />
      <KPI
        title="NPS Estimado"
        value={npsScore.toFixed(0)}
        icon={Award}
        trend={npsScore > 50 ? 'Excelente' : 'Bom'}
        trendUp={npsScore > 50}
        description="Baseado em análise semântica"
        colorClass="bg-orange-500"
      />
    </div>
  )
}
