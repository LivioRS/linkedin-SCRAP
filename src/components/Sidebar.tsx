import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart2,
  Bell,
  ShieldCheck,
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
    { label: 'Análise Competitiva', icon: BarChart2, path: '/analysis' },
    {
      label: 'Central de Alertas',
      icon: Bell,
      path: '/alerts',
      badge: unreadAlerts > 0 ? unreadAlerts : null,
    },
  ]

  return (
    <aside className="w-[260px] bg-sidebar border-r border-sidebar-border hidden md:flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <ShieldCheck className="h-8 w-8 text-primary mr-2" />
        <span className="font-bold text-lg text-sidebar-foreground">
          ReputaMonitor
        </span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors group',
              pathname === item.path
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <item.icon
              className={cn(
                'h-5 w-5 mr-3',
                pathname === item.path
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-foreground',
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

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">Marketing Manager</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
