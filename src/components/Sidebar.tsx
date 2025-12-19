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
    { label: 'Visão Geral', icon: LayoutDashboard, path: '/' },
    { label: 'Análise Profunda', icon: Activity, path: '/analysis' },
    { label: 'Dashboard Sentimento', icon: BarChart2, path: '/sentiment' },
    { label: 'Feed de Reputação', icon: MessageSquare, path: '/feed' },
    { label: 'Gestão de Clientes', icon: Users, path: '/clients' },
    {
      label: 'Central de Alertas',
      icon: Bell,
      path: '/alerts',
      badge: unreadAlerts > 0 ? unreadAlerts : null,
    },
    { label: 'Configurações', icon: Settings, path: '/settings' },
  ]

  return (
    <aside className="w-[280px] bg-slate-900 border-r border-slate-800 hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 shadow-2xl">
      <div className="h-20 flex flex-col justify-center px-6 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <img
            src="/planin-logo.png"
            alt="Planin Logo"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div
            className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 hidden"
            style={{ display: 'none' }}
          >
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
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight font-display">
            PLANIN
          </span>
        </div>
        <span className="text-base text-slate-400 uppercase tracking-widest mt-1.5 font-semibold pl-1">
          Monitor de Reputação Digital
        </span>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 mt-2">
          Navegação
        </p>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative',
              pathname === item.path
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white',
            )}
          >
            <item.icon
              className={cn(
                'h-5 w-5 mr-3 transition-colors',
                pathname === item.path
                  ? 'text-white'
                  : 'text-slate-500 group-hover:text-white',
              )}
            />
            {item.label}
            {item.badge && (
              <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px] bg-red-500 hover:bg-red-600 border-none">
                {item.badge}
              </Badge>
            )}
            {pathname === item.path && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-white/20" />
            )}
          </Link>
        ))}
      </div>

    </aside>
  )
}
