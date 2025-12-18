import React from 'react'
import { SmallMultiples } from './SmallMultiples'
import { SentimentHeatmap } from './SentimentHeatmap'
import { SparklineCards } from './SparklineCards'
import { ClientSentimentData, HeatmapDataPoint } from '@/lib/mockData'

interface CompleteDashboardProps {
  clientsData: ClientSentimentData[]
  heatmapData: HeatmapDataPoint[]
  clientNames: string[]
}

export default function CompleteDashboard({
  clientsData,
  heatmapData,
  clientNames,
}: CompleteDashboardProps) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
          Dashboard de Sentimento
        </h1>
        <p className="text-muted-foreground">
          Visualizações completas de análise de sentimento por cliente
        </p>
      </div>

      <SparklineCards clientsData={clientsData} />

      <SmallMultiples clientsData={clientsData} />

      <SentimentHeatmap heatmapData={heatmapData} clientNames={clientNames} />
    </div>
  )
}

