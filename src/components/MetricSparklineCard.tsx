import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
} from 'recharts'
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
  const isPositive = trend >= 0
  const chartConfig = {
    value: {
      label: 'Valor',
      color: color,
    },
  }

  return (
    <Card className="flex flex-col justify-between h-full shadow-planin hover:shadow-planin-hover transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-primary">{value}</span>
          <div
            className={cn(
              'flex items-center text-xs font-medium',
              isPositive ? 'text-green-600' : 'text-red-600',
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend)}%
            <span className="text-muted-foreground ml-1 font-normal">
              {trendLabel}
            </span>
          </div>
        </div>
        <div className="h-[60px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart data={data}>
              <XAxis hide dataKey="index" />
              <YAxis hide domain={['dataMin', 'dataMax']} />
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
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
                animationDuration={1000}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
