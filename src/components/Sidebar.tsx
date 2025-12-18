import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart2,
  Bell,
  Settings,
  Activity,
  LogOut,
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
    <aside className="w-[280px] bg-sidebar border-r border-sidebar-border hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl">
      <div className="h-20 flex flex-col justify-center px-6 border-b border-white/5 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            PLANIN
          </span>
        </div>
        <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest mt-1.5 font-medium pl-1">
          Monitor de Reputação
        </span>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-2 mt-2">
          Menu Principal
        </p>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative',
              pathname === item.path
                ? 'bg-primary text-white shadow-md'
                : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <item.icon
              className={cn(
                'h-5 w-5 mr-3 transition-colors',
                pathname === item.path
                  ? 'text-white'
                  : 'text-sidebar-foreground/50 group-hover:text-white',
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
            {pathname === item.path && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-white/20" />
            )}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold border border-white/10 shadow-inner">
            JD
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
              John Doe
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              Marketing Manager
            </p>
          </div>
          <LogOut className="h-4 w-4 text-sidebar-foreground/30 group-hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  )
}
