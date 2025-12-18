import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { HeatMapCell } from '@/hooks/useDashboardData'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SentimentHeatMapProps {
  data: HeatMapCell[]
}

export function SentimentHeatMap({ data }: SentimentHeatMapProps) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const slots = ['08:00', '12:00', '16:00', '20:00']

  const getCellColor = (value: number) => {
    if (value >= 0.5) return 'bg-green-500 hover:bg-green-600' // Very Positive
    if (value >= 0.2) return 'bg-green-300 hover:bg-green-400' // Positive
    if (value >= -0.2) return 'bg-gray-100 hover:bg-gray-200' // Neutral
    if (value >= -0.5) return 'bg-red-300 hover:bg-red-400' // Negative
    return 'bg-red-500 hover:bg-red-600' // Very Negative
  }

  const getSentimentLabel = (value: number) => {
    if (value >= 0.5) return 'Muito Positivo'
    if (value >= 0.2) return 'Positivo'
    if (value >= -0.2) return 'Neutro'
    if (value >= -0.5) return 'Negativo'
    return 'Muito Negativo'
  }

  return (
    <Card className="w-full shadow-sm border-none bg-white h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">
          Mapa de Calor de Sentimento
        </CardTitle>
        <CardDescription>
          Intensidade do sentimento por dia da semana e horário.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3 pb-2">
          {/* Header Row */}
          <div className="flex items-center">
            <div className="w-10 shrink-0"></div>
            {slots.map((slot) => (
              <div
                key={slot}
                className="flex-1 text-center text-xs font-semibold text-muted-foreground"
              >
                {slot}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {days.map((day) => (
            <div key={day} className="flex items-center gap-2">
              <div className="w-10 shrink-0 text-xs font-semibold text-muted-foreground text-right pr-2">
                {day}
              </div>
              {slots.map((slot) => {
                const cell = data.find(
                  (d) => d.day === day && d.hourSlot === slot,
                )
                const value = cell?.value || 0
                return (
                  <div key={`${day}-${slot}`} className="flex-1 h-8">
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'h-full w-full rounded-md transition-colors cursor-default',
                              getCellColor(value),
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="font-semibold text-sm mb-1">
                            {day} às {slot}
                          </p>
                          <div className="flex flex-col text-xs gap-0.5">
                            <span>
                              Score: <strong>{value.toFixed(2)}</strong>
                            </span>
                            <span>{getSentimentLabel(value)}</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-4 border-t border-dashed">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-red-500"></div> Crítico
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-gray-100 border"></div> Neutro
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-green-500"></div> Excelente
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
