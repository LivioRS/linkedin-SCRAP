import CompleteDashboard from '@/components/visualizations/CompleteDashboard'
import { useDashboardData } from '@/hooks/useDashboardData'

export default function SentimentDashboard() {
  const { clientsData, heatmapData, clientNames } = useDashboardData()

  return (
    <CompleteDashboard
      clientsData={clientsData}
      heatmapData={heatmapData}
      clientNames={clientNames}
    />
  )
}

