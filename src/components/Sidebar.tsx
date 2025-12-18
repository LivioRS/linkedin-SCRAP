import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart2,
  Bell,
  Settings,
  Activity,
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
    { label: 'Dashboard Sentimento', icon: Activity, path: '/sentiment' },
    { label: 'Clientes', icon: Users, path: '/clients' },
    { label: 'Feed de Reputação', icon: MessageSquare, path: '/feed' },
    { label: 'Análise Competitiva', icon: BarChart2, path: '/analysis' },
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
      <div className="h-20 flex flex-col justify-center px-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <img
            src="https://planin.com/wp-content/uploads/2023/01/planin-logo-branco.png"
            alt="PLANIN"
            className="h-8 w-auto"
          />
        </div>
        <span className="text-[10px] text-sidebar-foreground/70 uppercase tracking-widest mt-1 font-medium">
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
      <div className="p-6 border-t border-sidebar-border/50 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center text-white font-bold border-2 border-sidebar-accent">
            JD
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">John Doe</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              Marketing Manager
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
