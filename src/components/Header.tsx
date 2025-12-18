import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

export function AppHeader({ title }: { title: string }) {
  const { isScraping, triggerGlobalScrape, scrapingStatus } = useAppStore()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-3 w-3 animate-spin text-accent" />
      case 'success':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-200" />
    }
  }

  return (
    <header className="h-20 bg-white border-b border-border shadow-sm flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Visão geral do sistema
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block w-72 group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input
            type="search"
            placeholder="Buscar por clientes, posts..."
            className="pl-10 h-10 bg-gray-50 border-gray-200 focus:border-accent focus:ring-accent/20 transition-all rounded-lg"
          />
        </div>
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
        <HoverCard openDelay={0} closeDelay={200}>
          <HoverCardTrigger asChild>
            <Button
              onClick={triggerGlobalScrape}
              disabled={isScraping}
              className="min-w-[180px] relative overflow-hidden bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-md border-0 h-10"
            >
              {isScraping && (
                <span className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
              <RefreshCw
                className={cn('mr-2 h-4 w-4', isScraping && 'animate-spin')}
              />
              {isScraping ? 'Coletando...' : 'Global Scrape'}
            </Button>
          </HoverCardTrigger>
          {isScraping && (
            <HoverCardContent className="w-80 p-4" align="end">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold mb-2 text-primary">
                  Status da Coleta
                </h4>
                {Object.entries(scrapingStatus).map(([platform, status]) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize text-gray-700">{platform}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {status}
                      </span>
                      {getStatusIcon(status)}
                    </div>
                  </div>
                ))}
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
      </div>
    </header>
  )
}
