import { cn } from '@/lib/utils'

interface SentimentBadgeProps {
  score: number
}

export function SentimentBadge({ score }: SentimentBadgeProps) {
  let label = 'Neutro'
  let colorClass = 'bg-gray-100 text-gray-700 border-gray-200'

  if (score > 0.3) {
    label = 'Positivo'
    colorClass = 'bg-green-100 text-green-700 border-green-200'
  } else if (score < -0.3) {
    label = 'Negativo'
    colorClass = 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorClass,
      )}
    >
      {label} <span className="ml-1 opacity-75">({score.toFixed(2)})</span>
    </span>
  )
}
