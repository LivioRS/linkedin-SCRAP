import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Table2,
  BarChart2,
  Bell,
  ShieldCheck,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import useAppStore from '@/stores/useAppStore'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { alerts } = useAppStore()
  const unreadAlerts = alerts.filter((a) => !a.isRead).length

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Clientes', icon: Users, path: '/clients' },
    { label: 'Feed de Reputação', icon: MessageSquare, path: '/feed' },
    { label: 'Tracker de Posts', icon: Table2, path: '/tracker' },
    { label: 'Análise Competitiva', icon: BarChart2, path: '/analysis' },
    { label: 'Dashboard Sentimento', icon: TrendingUp, path: '/sentiment' },
    {
      label: 'Central de Alertas',
      icon: Bell,
      path: '/alerts',
      badge: unreadAlerts > 0 ? unreadAlerts : null,
    },
    { label: 'Configurações', icon: Settings, path: '/settings' },
  ]

  return (
    <aside className="w-[280px] bg-sidebar border-r border-sidebar-border hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl shadow-black/5">
      <div className="h-20 flex items-center justify-center px-6 border-b border-sidebar-border/50">
        <span className="text-base text-sidebar-foreground font-semibold uppercase tracking-widest">
          Monitor de Reputação Digital
        </span>
      </div>
      <div className="flex-1 py-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 group',
              pathname === item.path
                ? 'bg-sidebar-primary/20 text-white shadow-inner'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white hover:translate-x-1',
            )}
          >
            <item.icon
              className={cn(
                'h-5 w-5 mr-3 transition-colors',
                pathname === item.path
                  ? 'text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 group-hover:text-white',
              )}
            />
            {item.label}
            {item.badge && (
              <Badge
                variant="destructive"
                className="ml-auto h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px]"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </aside>
  )
}
