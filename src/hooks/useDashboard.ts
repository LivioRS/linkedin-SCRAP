import { useState, useEffect } from 'react'
import { DashboardWidget } from '@/types'

const DASHBOARD_STORAGE_KEY = 'planin_dashboard_widgets_v3' // Updated version key to reset layout if needed

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'kpi-sentiment',
    type: 'kpi',
    title: 'Sentimento Médio',
    config: { metric: 'sentiment' },
    position: { x: 0, y: 0, w: 3, h: 2 },
    visible: true,
  },
  {
    id: 'kpi-engagement',
    type: 'kpi',
    title: 'Taxa de Engajamento',
    config: { metric: 'engagement' },
    position: { x: 3, y: 0, w: 3, h: 2 },
    visible: true,
  },
  {
    id: 'kpi-posts',
    type: 'kpi',
    title: 'Posts Coletados',
    config: { metric: 'posts' },
    position: { x: 6, y: 0, w: 3, h: 2 },
    visible: true,
  },
  {
    id: 'kpi-competitors',
    type: 'kpi',
    title: 'Concorrentes',
    config: { metric: 'competitors' },
    position: { x: 9, y: 0, w: 3, h: 2 },
    visible: true,
  },
  {
    id: 'chart-sentiment-trend',
    type: 'chart',
    title: 'Tendências de Sentimento',
    config: { chartType: 'line', metric: 'sentiment' },
    position: { x: 0, y: 2, w: 8, h: 4 },
    visible: true,
  },
  {
    id: 'chart-share-of-voice',
    type: 'chart',
    title: 'Share of Voice',
    config: { chartType: 'pie', metric: 'sov' },
    position: { x: 8, y: 2, w: 4, h: 4 },
    visible: true,
  },
  {
    id: 'list-negative-posts',
    type: 'list',
    title: 'Posts Críticos (Atenção)',
    config: { filter: 'negative', limit: 5 },
    position: { x: 0, y: 6, w: 6, h: 4 },
    visible: true,
  },
  {
    id: 'list-recent-alerts',
    type: 'list',
    title: 'Alertas Recentes',
    config: { filter: 'recent', limit: 5 },
    position: { x: 6, y: 6, w: 6, h: 4 },
    visible: true,
  },
]

export function useDashboard() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DASHBOARD_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Ensure all default widgets exist (handling updates/new widgets)
        const merged = DEFAULT_WIDGETS.map((def) => {
          const savedWidget = parsed.find(
            (p: DashboardWidget) => p.id === def.id,
          )
          return savedWidget ? { ...def, ...savedWidget } : def
        })
        setWidgets(merged)
      } else {
        setWidgets(DEFAULT_WIDGETS)
      }
    } catch (e) {
      console.error('Erro ao carregar widgets:', e)
      setWidgets(DEFAULT_WIDGETS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveWidgets = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets)
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(newWidgets))
  }

  const toggleWidget = (id: string) => {
    const newWidgets = widgets.map((w) =>
      w.id === id ? { ...w, visible: !w.visible } : w,
    )
    saveWidgets(newWidgets)
  }

  const reorderWidgets = (newOrder: DashboardWidget[]) => {
    saveWidgets(newOrder)
  }

  const moveWidgetUp = (index: number) => {
    if (index <= 0) return
    const newWidgets = [...widgets]
    const temp = newWidgets[index]
    newWidgets[index] = newWidgets[index - 1]
    newWidgets[index - 1] = temp
    saveWidgets(newWidgets)
  }

  const moveWidgetDown = (index: number) => {
    if (index >= widgets.length - 1) return
    const newWidgets = [...widgets]
    const temp = newWidgets[index]
    newWidgets[index] = newWidgets[index + 1]
    newWidgets[index + 1] = temp
    saveWidgets(newWidgets)
  }

  const resetDashboard = () => {
    saveWidgets(DEFAULT_WIDGETS)
  }

  const visibleWidgets = widgets.filter((w) => w.visible)

  return {
    widgets,
    visibleWidgets,
    isLoading,
    toggleWidget,
    reorderWidgets,
    moveWidgetUp,
    moveWidgetDown,
    resetDashboard,
  }
}
