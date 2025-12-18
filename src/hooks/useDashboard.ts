import { useState, useEffect } from 'react'
import { DashboardWidget } from '@/types'

const DASHBOARD_STORAGE_KEY = 'dashboard_widgets'

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
    position: { x: 0, y: 2, w: 6, h: 4 },
    visible: true,
  },
  {
    id: 'chart-share-of-voice',
    type: 'chart',
    title: 'Share of Voice',
    config: { chartType: 'pie', metric: 'sov' },
    position: { x: 6, y: 2, w: 6, h: 4 },
    visible: true,
  },
  {
    id: 'list-negative-posts',
    type: 'list',
    title: 'Posts Críticos',
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
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (saved) {
      try {
        setWidgets(JSON.parse(saved))
      } catch (e) {
        console.error('Erro ao carregar widgets:', e)
      }
    }
    setIsLoading(false)
  }, [])

  const saveWidgets = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets)
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(newWidgets))
  }

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, ...updates } : w))
    saveWidgets(updated)
  }

  const toggleWidget = (id: string) => {
    updateWidget(id, { visible: !widgets.find((w) => w.id === id)?.visible })
  }

  const moveWidget = (id: string, position: { x: number; y: number }) => {
    updateWidget(id, {
      position: {
        ...widgets.find((w) => w.id === id)?.position,
        ...position,
      } as any,
    })
  }

  const resizeWidget = (id: string, size: { w: number; h: number }) => {
    updateWidget(id, {
      position: {
        ...widgets.find((w) => w.id === id)?.position,
        ...size,
      } as any,
    })
  }

  const addWidget = (widget: Omit<DashboardWidget, 'id'>) => {
    const newWidget: DashboardWidget = { ...widget, id: `widget-${Date.now()}` }
    saveWidgets([...widgets, newWidget])
  }

  const removeWidget = (id: string) => {
    saveWidgets(widgets.filter((w) => w.id !== id))
  }

  const resetDashboard = () => {
    saveWidgets(DEFAULT_WIDGETS)
  }

  const visibleWidgets = widgets.filter((w) => w.visible)

  return {
    widgets,
    visibleWidgets,
    isLoading,
    updateWidget,
    toggleWidget,
    moveWidget,
    resizeWidget,
    addWidget,
    removeWidget,
    resetDashboard,
  }
}
