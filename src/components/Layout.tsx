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
      return 'Dashboard'
    case '/clients':
      return 'Gerenciamento de Clientes'
    case '/feed':
      return 'Feed de Reputação'
    case '/analysis':
      return 'Análise Competitiva'
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
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[260px]">
            <AppSidebar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <AppHeader title={title} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
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
