import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from './Sidebar'
import { AppHeader } from './Header'
import { AppProvider } from '@/stores/useAppStore'
import { Toaster } from '@/components/ui/toaster'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/':
      return 'Visão Geral'
    case '/sentiment':
      return 'Dashboard de Sentimento'
    case '/clients':
      return 'Gerenciamento de Clientes'
    case '/feed':
      return 'Feed de Reputação'
    case '/analysis':
      return 'Análise Competitiva e Profunda'
    case '/alerts':
      return 'Central de Alertas'
    case '/settings':
      return 'Configurações do Sistema'
    default:
      return 'ReputaMonitor'
  }
}

function LayoutContent() {
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-slate-50 text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <AppSidebar />
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-900 text-white border-slate-800 shadow-lg"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-[280px] border-r-0 bg-slate-900"
          >
            <AppSidebar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <AppHeader title={title} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default function Layout() {
  return (
    <AppProvider>
      <LayoutContent />
    </AppProvider>
  )
}
