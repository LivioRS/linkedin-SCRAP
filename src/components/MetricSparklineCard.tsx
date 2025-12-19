import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { LineChart, Line, YAxis, XAxis, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import { SparklineData } from '@/hooks/useDashboardData'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface MetricSparklineCardProps {
  title: string
  value: string | number
  trend: number
  trendLabel: string
  data: SparklineData[]
  color: string
}

export function MetricSparklineCard({
  title,
  value,
  trend,
  trendLabel,
  data,
  color,
}: MetricSparklineCardProps) {
  const isPositive = trend > 0
  const isNeutral = trend === 0

  const chartConfig = {
    value: {
      label: 'Valor',
      color: color,
    },
  }

  const hasData = data && data.length > 0

  return (
    <Card className="flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-all duration-300 border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </span>
          <div
            className={cn(
              'flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full',
              isPositive
                ? 'bg-green-100 text-green-700'
                : isNeutral
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-red-100 text-red-700',
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : isNeutral ? (
              <Minus className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend)}%
          </div>
        </div>
        <div className="text-xs text-muted-foreground mb-4 -mt-1 pl-0.5">
          {trendLabel}
        </div>
        <div className="h-[50px] w-full mt-auto">
          {hasData ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={data}>
                <XAxis hide dataKey="index" />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip
                  content={<ChartTooltipContent hideLabel indicator="line" />}
                  cursor={{
                    stroke: 'hsl(var(--muted-foreground))',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground bg-gray-50 rounded">
              Sem dados
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
