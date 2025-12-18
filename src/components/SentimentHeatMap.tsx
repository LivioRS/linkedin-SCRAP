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
  // Organize data for grid rendering
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const slots = ['08:00', '12:00', '16:00', '20:00']

  const getCellColor = (value: number) => {
    if (value >= 0.5) return 'bg-green-500 hover:bg-green-600'
    if (value >= 0.2) return 'bg-green-300 hover:bg-green-400'
    if (value >= -0.2) return 'bg-gray-200 hover:bg-gray-300'
    if (value >= -0.5) return 'bg-red-300 hover:bg-red-400'
    return 'bg-red-500 hover:bg-red-600'
  }

  const getSentimentLabel = (value: number) => {
    if (value >= 0.5) return 'Muito Positivo'
    if (value >= 0.2) return 'Positivo'
    if (value >= -0.2) return 'Neutro'
    if (value >= -0.5) return 'Negativo'
    return 'Muito Negativo'
  }

  return (
    <Card className="w-full shadow-planin border-none">
      <CardHeader>
        <CardTitle className="text-xl text-primary font-bold">
          Mapa de Calor de Sentimento
        </CardTitle>
        <CardDescription>
          Intensidade do sentimento por dia da semana e horário.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2 overflow-x-auto pb-4">
          <div className="flex">
            <div className="w-16 shrink-0"></div>
            {slots.map((slot) => (
              <div
                key={slot}
                className="flex-1 text-center text-xs font-medium text-muted-foreground min-w-[60px]"
              >
                {slot}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day} className="flex items-center">
              <div className="w-16 shrink-0 text-xs font-medium text-muted-foreground">
                {day}
              </div>
              {slots.map((slot) => {
                const cell = data.find(
                  (d) => d.day === day && d.hourSlot === slot,
                )
                const value = cell?.value || 0
                return (
                  <div
                    key={`${day}-${slot}`}
                    className="flex-1 p-1 min-w-[60px]"
                  >
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'h-10 w-full rounded-md transition-colors cursor-default',
                              getCellColor(value),
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="font-semibold">
                            {day} às {slot}
                          </p>
                          <p className="text-xs">Score: {value.toFixed(2)}</p>
                          <p className="text-xs">{getSentimentLabel(value)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div> Negativo
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div> Neutro
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div> Positivo
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
